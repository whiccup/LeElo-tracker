'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getLocalISODate } from '@/lib/utils';
import styles from './page.module.css';

interface PlayerOption {
  id: string;
  name: string;
}

export default function NewAttendancePage() {
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [date, setDate] = useState(() => getLocalISODate());
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    supabase
      .from('players')
      .select('id, first_name, last_name')
      .order('first_name')
      .then(({ data }) => {
        if (data) {
          setPlayers(
            data.map((p) => ({
              id: p.id,
              name: `${p.first_name} ${p.last_name}`,
            }))
          );
        }
      });
  }, []);

  const selectedSet = new Set(selected);
  const available = players.filter((p) => !selectedSet.has(p.id));

  const handlePlayerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const picked = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setSelected([...selected, ...picked]);
    setError('');
    setSuccessMessage('');
  };

  const removePlayer = (id: string) => {
    setSelected(selected.filter((p) => p !== id));
    setError('');
  };

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (selected.length === 0) {
      setError('Select at least one player');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, playerIds: selected }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save attendance');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Attendance recorded successfully!');
      setSelected([]);
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
        <h2>Record Attendance</h2>
      </div>

      <div className={styles.formContainer}>
        <table className={styles.formTable}>
          <tbody>
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
                {selected.length > 0 && (
                  <ul className={styles.playerList}>
                    {selected.map((id) => (
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
                  {selected.length} player{selected.length !== 1 ? 's' : ''} selected
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={isSubmitting || selected.length === 0}
                >
                  {isSubmitting ? 'Saving...' : 'Save Attendance'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
      </div>
    </main>
  );
}
