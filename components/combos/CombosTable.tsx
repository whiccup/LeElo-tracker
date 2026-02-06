'use client';

import { useState, useMemo } from 'react';
import { Game, ComboSortConfig, ComboSortKey } from '@/types';
import { formatWinPercentage } from '@/lib/utils';
import { computeComboStats } from '@/lib/combos';
import SortableHeader from '@/components/ui/SortableHeader';
import styles from './CombosTable.module.css';

interface Props {
  games: Game[];
  nameMap: Record<string, string>;
}

export default function CombosTable({ games, nameMap }: Props) {
  const [tab, setTab] = useState<'duos' | 'trios'>('duos');
  const [sortConfig, setSortConfig] = useState<ComboSortConfig>({
    key: 'winPercentage',
    direction: 'desc',
  });

  const resolveName = (id: string) => nameMap[id] || id;

  const duoStats = useMemo(() => computeComboStats(games, 2), [games]);
  const trioStats = useMemo(() => computeComboStats(games, 3), [games]);

  const stats = tab === 'duos' ? duoStats : trioStats;

  const handleSort = (key: string) => {
    const sortKey = key as ComboSortKey;
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sorted = [...stats].sort((a, b) => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const key = sortConfig.key;

    if (key === 'players') {
      const nameA = a.playerIds.map(resolveName).join(', ');
      const nameB = b.playerIds.map(resolveName).join(', ');
      return nameA.localeCompare(nameB) * dir;
    }
    if (key === 'wins') return (a.wins - b.wins) * dir;
    if (key === 'losses') return (a.losses - b.losses) * dir;
    if (key === 'gamesPlayed') return (a.gamesPlayed - b.gamesPlayed) * dir;
    if (key === 'winPercentage') return (a.winPercentage - b.winPercentage) * dir;
    return 0;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'duos' ? styles.tabActive : ''}`}
          onClick={() => setTab('duos')}
        >
          Duos
        </button>
        <button
          className={`${styles.tab} ${tab === 'trios' ? styles.tabActive : ''}`}
          onClick={() => setTab('trios')}
        >
          Trios
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.center}>#</th>
            <SortableHeader
              label="Players"
              sortKey="players"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
              align="left"
            />
            <SortableHeader
              label="W"
              sortKey="wins"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="L"
              sortKey="losses"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="GP"
              sortKey="gamesPlayed"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="Win%"
              sortKey="winPercentage"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((combo, index) => (
            <tr
              key={combo.playerIds.join('-')}
              className={index % 2 === 1 ? styles.stripe : ''}
            >
              <td className={`${styles.center} ${styles.mono}`}>{index + 1}</td>
              <td>{combo.playerIds.map(resolveName).join(', ')}</td>
              <td className={`${styles.center} ${styles.mono}`}>{combo.wins}</td>
              <td className={`${styles.center} ${styles.mono}`}>{combo.losses}</td>
              <td className={`${styles.center} ${styles.mono}`}>{combo.gamesPlayed}</td>
              <td className={`${styles.center} ${styles.mono} ${styles.bold} ${styles.positive}`}>
                {formatWinPercentage(combo.winPercentage)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        Showing {sorted.length} combos (min. 5 games)
      </div>
    </div>
  );
}
