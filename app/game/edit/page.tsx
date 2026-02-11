'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '../new/page.module.css';

interface PlayerOption {
  id: string;
  name: string;
}

interface GameOption {
  id: string;
  date: string;
  team_a_score: number;
  team_b_score: number;
  winner: string;
  teamA: string[];
  teamB: string[];
}

export default function EditGamePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [games, setGames] = useState<GameOption[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [date, setDate] = useState('');
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');

  // Load players and games on mount
  useEffect(() => {
    // Fetch players
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

    // Fetch games with their players
    Promise.all([
      supabase
        .from('games')
        .select('id, date, team_a_score, team_b_score, winner')
        .order('date', { ascending: false })
        .order('id', { ascending: false }),
      supabase
        .from('game_players')
        .select('game_id, player_id, team'),
    ]).then(([gamesRes, gpRes]) => {
      if (gamesRes.data && gpRes.data) {
        const gpByGame = new Map<string, { teamA: string[]; teamB: string[] }>();
        for (const gp of gpRes.data) {
          if (!gpByGame.has(gp.game_id)) {
            gpByGame.set(gp.game_id, { teamA: [], teamB: [] });
          }
          const roster = gpByGame.get(gp.game_id)!;
          if (gp.team === 'A') {
            roster.teamA.push(gp.player_id);
          } else {
            roster.teamB.push(gp.player_id);
          }
        }

        setGames(
          gamesRes.data.map((g) => ({
            id: g.id,
            date: g.date,
            team_a_score: g.team_a_score,
            team_b_score: g.team_b_score,
            winner: g.winner,
            teamA: gpByGame.get(g.id)?.teamA || [],
            teamB: gpByGame.get(g.id)?.teamB || [],
          }))
        );
      }
    });
  }, []);

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  // Format game for dropdown display
  const formatGameLabel = (game: GameOption) => {
    const d = new Date(game.date + 'T00:00:00');
    const dateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    const teamANames = game.teamA.map((id) => getPlayerName(id)).join(', ');
    const teamBNames = game.teamB.map((id) => getPlayerName(id)).join(', ');
    return `${dateStr} — ${teamANames} vs ${teamBNames} (${game.team_a_score}-${game.team_b_score})`;
  };

  // When a game is selected, populate the form
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setConfirmDelete(false);
    setError('');
    setSuccess('');

    if (!gameId) {
      setDate('');
      setTeamA([]);
      setTeamB([]);
      setTeamAScore('');
      setTeamBScore('');
      return;
    }

    const game = games.find((g) => g.id === gameId);
    if (game) {
      setDate(game.date);
      setTeamA([...game.teamA]);
      setTeamB([...game.teamB]);
      setTeamAScore(String(game.team_a_score));
      setTeamBScore(String(game.team_b_score));
    }
  };

  const filteredGames = filterDate ? games.filter((g) => g.date === filterDate) : [];

  const handleDateFilter = (newDate: string) => {
    setFilterDate(newDate);
    setSelectedGameId('');
    setDate('');
    setTeamA([]);
    setTeamB([]);
    setTeamAScore('');
    setTeamBScore('');
    setError('');
    setSuccess('');
  };

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedGameId) {
      setError('Please select a game to edit');
      return;
    }
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGameId,
          date,
          teamAPlayers: teamA,
          teamBPlayers: teamB,
          teamAScore: Number(teamAScore),
          teamBScore: Number(teamBScore),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update game');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Game updated successfully. All Elo ratings have been recalculated.');

      // Update the local games list to reflect changes
      setGames((prev) =>
        prev.map((g) =>
          g.id === selectedGameId
            ? {
                ...g,
                date,
                team_a_score: Number(teamAScore),
                team_b_score: Number(teamBScore),
                winner: Number(teamAScore) > Number(teamBScore) ? 'A' : 'B',
                teamA: [...teamA],
                teamB: [...teamB],
              }
            : g
        )
      );

      setIsSubmitting(false);
    } catch {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGameId) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/games', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: selectedGameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete game');
        setIsDeleting(false);
        return;
      }

      setSuccess('Game removed successfully. All Elo ratings have been recalculated.');
      setGames((prev) => prev.filter((g) => g.id !== selectedGameId));
      setSelectedGameId('');
      setConfirmDelete(false);
      setDate('');
      setTeamA([]);
      setTeamB([]);
      setTeamAScore('');
      setTeamBScore('');
      setIsDeleting(false);
    } catch {
      setError('An unexpected error occurred');
      setConfirmDelete(false);
      setIsDeleting(false);
    }
  };

  return (
    <main>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Rankings
      </Link>

      <div className="section-header">
        <h2>Edit Game</h2>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <table className={styles.formTable}>
            <tbody>
              <tr style={{ backgroundColor: 'var(--bg-table-header)' }}>
                <td className={styles.labelCell}>Filter by Date</td>
                <td className={styles.inputCell}>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => handleDateFilter(e.target.value)}
                    className={styles.input}
                    style={{ width: '160px' }}
                  />
                </td>
              </tr>

              {filterDate && (
                <tr>
                  <td className={styles.labelCell}>Select Game</td>
                  <td className={styles.inputCell}>
                    {filteredGames.length === 0 ? (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
                        No games on this date
                      </span>
                    ) : (
                      <select
                        className={styles.input}
                        value={selectedGameId}
                        onChange={(e) => handleGameSelect(e.target.value)}
                      >
                        <option value="">— Select a game —</option>
                        {filteredGames.map((g) => (
                          <option key={g.id} value={g.id}>
                            {formatGameLabel(g)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              )}

              {selectedGameId && (
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
                        disabled={isSubmitting || isDeleting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className={styles.submitButton}
                        style={{
                          marginLeft: '8px',
                          color: confirmDelete ? '#fff' : 'var(--accent-red)',
                          background: confirmDelete ? 'var(--accent-red)' : undefined,
                          borderColor: 'var(--accent-red)',
                        }}
                        disabled={isSubmitting || isDeleting}
                        onClick={handleDelete}
                      >
                        {isDeleting ? 'Removing...' : confirmDelete ? 'Confirm Remove' : 'Remove Game'}
                      </button>
                      {confirmDelete && (
                        <button
                          type="button"
                          className={styles.submitButton}
                          style={{ marginLeft: '8px' }}
                          onClick={() => setConfirmDelete(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.error} style={{ background: '#efe', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
            {success}
          </div>
        )}
      </div>
    </main>
  );
}
