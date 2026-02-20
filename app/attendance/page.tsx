import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import RefreshButton from '@/components/ui/RefreshButton';
import styles from './page.module.css';

interface SessionRow {
  id: string;
  date: string;
}

interface RecordRow {
  session_id: string;
  player_id: string;
  players: { id: string; first_name: string; last_name: string } | null;
}

export default async function AttendancePage() {
  const { data: sessions } = await supabase
    .from('attendance_sessions')
    .select('id, date')
    .order('date', { ascending: false });

  const { data: records } = await supabase
    .from('attendance_players')
    .select('session_id, player_id, players(id, first_name, last_name)');

  const sessionList: SessionRow[] = (sessions || []) as SessionRow[];
  const recordList = (records || []) as unknown as RecordRow[];

  // Build name map from records
  const nameMap: Record<string, string> = {};
  for (const r of recordList) {
    if (r.players && !nameMap[r.player_id]) {
      nameMap[r.player_id] = `${r.players.first_name} ${r.players.last_name}`;
    }
  }

  // Build attendance set: "playerId:sessionId"
  const attendanceSet: string[] = recordList.map(
    (r) => `${r.player_id}:${r.session_id}`
  );

  // Get unique player IDs from records
  const playerIds = Array.from(new Set(recordList.map((r) => r.player_id)));

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main>
      <div className="section-header">
        <h2>Attendance</h2>
        <Link href="/attendance/edit" className={styles.editLink}>
          Edit Attendance
        </Link>
      </div>
      <span className="section-meta">
        Last Updated: {today} <RefreshButton />
      </span>

      {sessionList.length === 0 ? (
        <p className={styles.empty}>No attendance sessions recorded yet.</p>
      ) : (
        <AttendanceTable
          sessions={sessionList}
          playerIds={playerIds}
          nameMap={nameMap}
          attendanceSet={attendanceSet}
        />
      )}
    </main>
  );
}
