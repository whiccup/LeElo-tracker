'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface PlayerOption {
  id: string;
  name: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState<PlayerOption[]>([]);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');
  useEffect(() => {
    supabase
      .from('players')
      .select('id, first_name, last_name')
      .order('first_name')
      .then(({ data }) => {
        if (data) {
          setPlayers(
            data.map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}` }))
          );
        }
      });
  }, []);

  const assignedIds = new Set([...teamA, ...teamB]);
  const availableForA = players.filter((p) => !assignedIds.has(p.id));
  const availableForB = players.filter((p) => !assignedIds.has(p.id));

  const handleTeamASelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setTeamA([...teamA, ...selected]);
  };

  const handleTeamBSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setTeamB([...teamB, ...selected]);
  };

  const removeFromTeamA = (id: string) => setTeamA(teamA.filter((p) => p !== id));
  const removeFromTeamB = (id: string) => setTeamB(teamB.filter((p) => p !== id));

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (teamA.length === 0 || teamB.length === 0) {
      setError('Both teams must have at least one player');
      return;
    }
    if (teamA.length > 5 || teamB.length > 5) {
      setError('Each team can have a maximum of 5 players');
      return;
    }
    if (!teamAScore || !teamBScore) {
      setError('Scores are required for both teams');
      return;
    }
    if (Number(teamAScore) === Number(teamBScore)) {
      setError('Game cannot end in a tie');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          teamAPlayers: teamA,
          teamBPlayers: teamB,
          teamAScore: Number(teamAScore),
          teamBScore: Number(teamBScore),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create game');
        setIsSubmitting(false);
        return;
      }

      // Clear form for next entry
      setTeamA([]);
      setTeamB([]);
      setTeamAScore('');
      setTeamBScore('');
      setIsSubmitting(false);
    } catch {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Rankings
      </Link>

      <div className="section-header">
        <h2>Enter New Game</h2>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
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
                <td className={styles.labelCell}>Team A</td>
                <td className={styles.inputCell}>
                  {teamA.length > 0 && (
                    <ul className={styles.playerList}>
                      {teamA.map((id) => (
                        <li key={id} className={styles.playerItem}>
                          {getPlayerName(id)}
                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => removeFromTeamA(id)}
                          >
                            [remove]
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {teamA.length >= 5 && (
                    <div className={styles.maxPlayersNote}>
                      Maximum of 5 players reached
                    </div>
                  )}
                  {availableForA.length > 0 && teamA.length < 5 && (
                    <>
                      <select
                        className={styles.playerSelect}
                        multiple
                        size={Math.max(Math.min(availableForA.length, 6), 2)}
                        onChange={handleTeamASelect}
                        value={[]}
                      >
                        {availableForA.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div className={styles.emptyNote}>Use Cmd/Ctrl-click for multiple players.</div>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Team B</td>
                <td className={styles.inputCell}>
                  {teamB.length > 0 && (
                    <ul className={styles.playerList}>
                      {teamB.map((id) => (
                        <li key={id} className={styles.playerItem}>
                          {getPlayerName(id)}
                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => removeFromTeamB(id)}
                          >
                            [remove]
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {teamB.length >= 5 && (
                    <div className={styles.maxPlayersNote}>
                      Maximum of 5 players reached
                    </div>
                  )}
                  {availableForB.length > 0 && teamB.length < 5 && (
                    <>
                      <select
                        className={styles.playerSelect}
                        multiple
                        size={Math.max(Math.min(availableForB.length, 6), 2)}
                        onChange={handleTeamBSelect}
                        value={[]}
                      >
                        {availableForB.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div className={styles.emptyNote}>Use Cmd/Ctrl-click for multiple players.</div>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Score</td>
                <td className={styles.inputCell}>
                  <div className={styles.scoreRow}>
                    <span className={styles.scoreLabel}>Team A</span>
                    <input
                      type="number"
                      min="0"
                      value={teamAScore}
                      onChange={(e) => setTeamAScore(e.target.value)}
                      className={styles.scoreInput}
                      required
                    />
                    <span className={styles.scoreSeparator}>–</span>
                    <span className={styles.scoreLabel}>Team B</span>
                    <input
                      type="number"
                      min="0"
                      value={teamBScore}
                      onChange={(e) => setTeamBScore(e.target.value)}
                      className={styles.scoreInput}
                      required
                    />
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
                    {isSubmitting ? 'Submitting...' : 'Submit Game'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </main>
  );
}
