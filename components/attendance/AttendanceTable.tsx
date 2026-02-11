'use client';

import { useMemo } from 'react';
import { formatDate } from '@/lib/utils';
import styles from './AttendanceTable.module.css';

const TOTAL_DUES = 44;

interface Session {
  id: string;
  date: string;
}

interface Props {
  sessions: Session[];
  playerIds: string[];
  nameMap: Record<string, string>;
  attendanceSet: string[]; // "playerId:sessionId" entries
}

export default function AttendanceTable({
  sessions,
  playerIds,
  nameMap,
  attendanceSet,
}: Props) {
  const attendanceLookup = useMemo(
    () => new Set(attendanceSet),
    [attendanceSet]
  );

  // Count attendees per session
  const attendeeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      counts[s.id] = 0;
    }
    for (const entry of attendanceSet) {
      const sessionId = entry.split(':')[1];
      if (counts[sessionId] !== undefined) {
        counts[sessionId]++;
      }
    }
    return counts;
  }, [sessions, attendanceSet]);

  // Per-session dues
  const sessionDues = useMemo(() => {
    const dues: Record<string, number> = {};
    for (const s of sessions) {
      const count = attendeeCounts[s.id] || 1;
      dues[s.id] = TOTAL_DUES / count;
    }
    return dues;
  }, [sessions, attendeeCounts]);

  // Sort players alphabetically
  const sortedPlayerIds = useMemo(
    () =>
      [...playerIds].sort((a, b) =>
        (nameMap[a] || a).localeCompare(nameMap[b] || b)
      ),
    [playerIds, nameMap]
  );

  // Calculate total dues per player
  const playerTotalDues = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const pid of sortedPlayerIds) {
      let total = 0;
      for (const s of sessions) {
        if (attendanceLookup.has(`${pid}:${s.id}`)) {
          total += sessionDues[s.id];
        }
      }
      totals[pid] = total;
    }
    return totals;
  }, [sortedPlayerIds, sessions, attendanceLookup, sessionDues]);

  // Total sessions attended per player
  const playerSessionCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const pid of sortedPlayerIds) {
      let count = 0;
      for (const s of sessions) {
        if (attendanceLookup.has(`${pid}:${s.id}`)) {
          count++;
        }
      }
      counts[pid] = count;
    }
    return counts;
  }, [sortedPlayerIds, sessions, attendanceLookup]);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyCol}>Player</th>
            <th className={styles.center}>GP</th>
            <th className={styles.center}>Total Dues</th>
            {sessions.map((s) => (
              <th key={s.id} className={styles.dateCol}>
                {formatDate(s.date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayerIds.map((pid, i) => (
            <tr key={pid} className={i % 2 === 1 ? styles.stripe : undefined}>
              <td className={styles.stickyCol}>{nameMap[pid] || pid}</td>
              <td className={`${styles.center} ${styles.mono}`}>
                {playerSessionCount[pid]}
              </td>
              <td className={`${styles.center} ${styles.mono}`}>
                ${playerTotalDues[pid].toFixed(2)}
              </td>
              {sessions.map((s) => (
                <td key={s.id} className={styles.center}>
                  {attendanceLookup.has(`${pid}:${s.id}`) ? (
                    <span className={styles.check}>&#10003;</span>
                  ) : (
                    ''
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.duesRow}>
            <td className={styles.stickyCol}>Per-Person Dues</td>
            <td className={styles.center}></td>
            <td className={styles.center}></td>
            {sessions.map((s) => (
              <td key={s.id} className={`${styles.center} ${styles.mono}`}>
                ${sessionDues[s.id].toFixed(2)}
              </td>
            ))}
          </tr>
          <tr className={styles.duesRow}>
            <td className={styles.stickyCol}>Attendees</td>
            <td className={styles.center}></td>
            <td className={styles.center}></td>
            {sessions.map((s) => (
              <td key={s.id} className={`${styles.center} ${styles.mono}`}>
                {attendeeCounts[s.id]}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      <div className={styles.footer}>
        {sessions.length} session{sessions.length !== 1 ? 's' : ''} &bull;{' '}
        {sortedPlayerIds.length} player{sortedPlayerIds.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
