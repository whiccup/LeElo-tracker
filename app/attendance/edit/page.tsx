'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '../new/page.module.css';

interface PlayerOption {
  id: string;
  name: string;
}

interface SessionOption {
  id: string;
  date: string;
}

interface AttendanceRecord {
  session_id: string;
  player_id: string;
  queue_position: number | null;
}

export default function EditAttendancePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [recordsBySession, setRecordsBySession] = useState<Record<string, string[]>>({});

  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [date, setDate] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      supabase
        .from('players')
        .select('id, first_name, last_name')
        .order('first_name'),
      supabase
        .from('attendance_sessions')
        .select('id, date')
        .order('date', { ascending: false })
        .order('id', { ascending: false }),
      supabase
        .from('attendance_players')
        .select('session_id, player_id, queue_position'),
    ]).then(([playersRes, sessionsRes, recordsRes]) => {
      if (playersRes.data) {
        setPlayers(
          playersRes.data.map((p) => ({
            id: p.id,
            name: `${p.first_name} ${p.last_name}`,
          }))
        );
      }

      if (sessionsRes.data) {
        setSessions(sessionsRes.data as SessionOption[]);
      }

      if (recordsRes.data) {
        const grouped: Record<string, AttendanceRecord[]> = {};

        for (const row of recordsRes.data as AttendanceRecord[]) {
          if (!grouped[row.session_id]) {
            grouped[row.session_id] = [];
          }
          grouped[row.session_id].push(row);
        }

        const ordered: Record<string, string[]> = {};
        for (const sessionId of Object.keys(grouped)) {
          ordered[sessionId] = grouped[sessionId]
            .sort((a, b) => {
              const aPos = typeof a.queue_position === 'number' ? a.queue_position : Number.MAX_SAFE_INTEGER;
              const bPos = typeof b.queue_position === 'number' ? b.queue_position : Number.MAX_SAFE_INTEGER;
              if (aPos !== bPos) return aPos - bPos;
              return a.player_id.localeCompare(b.player_id);
            })
            .map((r) => r.player_id);
        }
        setRecordsBySession(ordered);
      }
    });
  }, []);

  const selectedSet = new Set(selectedPlayers);
  const available = players.filter((p) => !selectedSet.has(p.id));

  const attendeeCountBySession = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      counts[s.id] = recordsBySession[s.id]?.length || 0;
    }
    return counts;
  }, [sessions, recordsBySession]);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setError('');
    setSuccess('');

    if (!sessionId) {
      setDate('');
      setSelectedPlayers([]);
      return;
    }

    const selectedSession = sessions.find((s) => s.id === sessionId);
    setDate(selectedSession?.date || '');
    setSelectedPlayers([...(recordsBySession[sessionId] || [])]);
  };

  const handlePlayerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const picked = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setSelectedPlayers([...selectedPlayers, ...picked]);
    setError('');
    setSuccess('');
  };

  const removePlayer = (id: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p !== id));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSessionId) {
      setError('Please select a session to edit');
      return;
    }

    if (!date) {
      setError('Date is required');
      return;
    }

    if (selectedPlayers.length === 0) {
      setError('Select at least one player');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          date,
          playerIds: selectedPlayers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update attendance');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Attendance updated successfully.');
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedSessionId ? { ...s, date } : s))
      );
      setRecordsBySession((prev) => ({
        ...prev,
        [selectedSessionId]: [...selectedPlayers],
      }));
      setIsSubmitting(false);
    } catch {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <Link href="/attendance" className={styles.backLink}>
        &larr; Back to Attendance
      </Link>

      <div className="section-header">
        <h2>Edit Attendance</h2>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <table className={styles.formTable}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Select Session</td>
                <td className={styles.inputCell}>
                  <select
                    className={styles.input}
                    value={selectedSessionId}
                    onChange={(e) => handleSessionSelect(e.target.value)}
                  >
                    <option value="">— Select a session —</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.date} ({attendeeCountBySession[s.id]} attendees)
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {selectedSessionId && (
                <>
                  <tr>
                    <td className={styles.labelCell}>Date</td>
                    <td className={styles.inputCell}>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={styles.input}
                        style={{ width: '160px' }}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.labelCell}>Attendees</td>
                    <td className={styles.inputCell}>
                      {selectedPlayers.length > 0 && (
                        <ul className={styles.playerList}>
                          {selectedPlayers.map((id) => (
                            <li key={id} className={styles.playerItem}>
                              <span>{getPlayerName(id)}</span>
                              <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => removePlayer(id)}
                              >
                                [remove]
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {available.length > 0 && (
                        <select
                          className={styles.playerSelect}
                          multiple
                          size={Math.max(Math.min(available.length, 6), 2)}
                          onChange={handlePlayerSelect}
                          value={[]}
                        >
                          {available.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <div className={styles.playerCount}>
                        {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className={styles.buttonRow}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </main>
  );
}
