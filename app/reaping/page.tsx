'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface PlayerOption {
  id: string;
  name: string;
  isUnluckyTwice: boolean;
}

interface ReapingResult {
  includedIds: string[];
  excludedIds: string[];
}

export default function ReapingPage() {
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pool, setPool] = useState<string[]>([]);
  const [autoIncludedIds, setAutoIncludedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ReapingResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    supabase
      .from('players')
      .select('id, first_name, last_name, is_unlucky_twice')
      .order('first_name')
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((p) => ({
            id: p.id,
            name: `${p.first_name} ${p.last_name}`,
            isUnluckyTwice: p.is_unlucky_twice || false,
          }));
          setPlayers(mapped);

          // Pre-populate pool with auto-entry players
          const autoIds = mapped
            .filter((p) => p.isUnluckyTwice)
            .map((p) => p.id);
          if (autoIds.length > 0) {
            setPool(autoIds);
            setAutoIncludedIds(autoIds);
          }
        }
      });
  }, []);

  const poolSet = new Set(pool);
  const available = players.filter((p) => !poolSet.has(p.id));

  const handlePlayerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setPool([...pool, ...selected]);
    // Clear result when pool changes
    setResult(null);
    setError('');
    setSuccessMessage('');
  };

  const removeFromPool = (id: string) => {
    setPool(pool.filter((p) => p !== id));
    setResult(null);
    setError('');
  };

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  const isAutoIncluded = (id: string) => autoIncludedIds.includes(id);

  const handleReap = () => {
    setError('');
    setSuccessMessage('');

    if (pool.length <= 15) {
      setError('Need more than 15 players to run a reaping');
      return;
    }

    const toExcludeCount = pool.length - 15;

    // Players eligible for exclusion (not auto-included)
    const eligible = pool.filter((id) => !isAutoIncluded(id));

    if (eligible.length < toExcludeCount) {
      setError(
        'Not enough eligible players to exclude (auto-entry players are protected)'
      );
      return;
    }

    // Randomly select players to exclude
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const excludedIds = shuffled.slice(0, toExcludeCount);
    const excludedSet = new Set(excludedIds);
    const includedIds = pool.filter((id) => !excludedSet.has(id));

    setResult({ includedIds, excludedIds });
  };

  const handleSave = async () => {
    if (!result) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      // playerIds = non-auto players, autoIncludedIds = auto-entry players
      const manualPlayerIds = pool.filter((id) => !isAutoIncluded(id));

      const response = await fetch('/api/reaping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          playerIds: manualPlayerIds,
          autoIncludedIds,
          excludedIds: result.excludedIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save reaping');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Reaping saved successfully!');
      setPool([]);
      setAutoIncludedIds([]);
      setResult(null);
      setIsSubmitting(false);

      // Re-fetch players to get updated is_unlucky_twice flags
      const { data: refreshed } = await supabase
        .from('players')
        .select('id, first_name, last_name, is_unlucky_twice')
        .order('first_name');

      if (refreshed) {
        const mapped = refreshed.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          isUnluckyTwice: p.is_unlucky_twice || false,
        }));
        setPlayers(mapped);

        // Re-populate auto-entry players
        const autoIds = mapped
          .filter((p) => p.isUnluckyTwice)
          .map((p) => p.id);
        if (autoIds.length > 0) {
          setPool(autoIds);
          setAutoIncludedIds(autoIds);
        }
      }
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
        <h2>Reaping</h2>
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
              <td className={styles.labelCell}>Players</td>
              <td className={styles.inputCell}>
                {pool.length > 0 && (
                  <ul className={styles.playerList}>
                    {pool.map((id) => (
                      <li key={id} className={styles.playerItem}>
                        <span>
                          {getPlayerName(id)}
                          {isAutoIncluded(id) && (
                            <span className={styles.autoEntry}>(auto-entry)</span>
                          )}
                        </span>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeFromPool(id)}
                        >
                          [remove]
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {available.length > 0 && (
                  <>
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
                    <div className={styles.helpText}>Use Cmd/Ctrl-click for multiple players.</div>
                  </>
                )}
                <div className={styles.playerCount}>
                  {pool.length} player{pool.length !== 1 ? 's' : ''} signed up
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className={styles.buttonRow}>
                {pool.length > 15 && (
                  <button
                    type="button"
                    className={styles.submitButton}
                    onClick={handleReap}
                  >
                    {result ? 'Re-Reap' : 'Reap'}
                  </button>
                )}
                {result && (
                  <>
                    {' '}
                    <button
                      type="button"
                      className={styles.submitButton}
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Results'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {result && (
          <div className={styles.resultSection}>
            <h3>Included ({result.includedIds.length})</h3>
            <ul className={styles.resultList}>
              {result.includedIds.map((id) => (
                <li key={id} className={styles.included}>
                  {getPlayerName(id)}
                  {isAutoIncluded(id) && (
                    <span className={styles.autoEntry}>(auto-entry)</span>
                  )}
                </li>
              ))}
            </ul>

            <h3>Excluded ({result.excludedIds.length})</h3>
            <ul className={styles.resultList}>
              {result.excludedIds.map((id) => (
                <li key={id} className={styles.excluded}>
                  {getPlayerName(id)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
      </div>
    </main>
  );
}
