'use client';

import { useState } from 'react';
import { Game, AllGamesSortConfig, AllGamesSortKey } from '@/types';
import { formatDate } from '@/lib/utils';
import SortableHeader from '@/components/ui/SortableHeader';
import styles from './AllGamesTable.module.css';

interface Props {
  games: Game[];
  nameMap: Record<string, string>;
}

const PAGE_OPTIONS = [10, 25, 50] as const;

export default function AllGamesTable({ games, nameMap }: Props) {
  const [sortConfig, setSortConfig] = useState<AllGamesSortConfig>({
    key: 'date',
    direction: 'desc',
  });
  const [visibleCount, setVisibleCount] = useState<number | 'all'>(10);

  const resolveName = (id: string) => nameMap[id] || id;

  const handleSort = (key: string) => {
    const sortKey = key as AllGamesSortKey;
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sorted = [...games].sort((a, b) => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const key = sortConfig.key;

    if (key === 'date') {
      return a.date.localeCompare(b.date) * dir;
    }
    if (key === 'teamA') {
      const nameA = resolveName(a.teamAPlayers[0] || '');
      const nameB = resolveName(b.teamAPlayers[0] || '');
      return nameA.localeCompare(nameB) * dir;
    }
    if (key === 'teamB') {
      const nameA = resolveName(a.teamBPlayers[0] || '');
      const nameB = resolveName(b.teamBPlayers[0] || '');
      return nameA.localeCompare(nameB) * dir;
    }
    if (key === 'score') {
      const diffA = a.teamAScore - a.teamBScore;
      const diffB = b.teamAScore - b.teamBScore;
      return (diffA - diffB) * dir;
    }
    if (key === 'winner') {
      return a.winner.localeCompare(b.winner) * dir;
    }
    return 0;
  });

  const displayed = visibleCount === 'all' ? sorted : sorted.slice(0, visibleCount);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortableHeader
              label="Date"
              sortKey="date"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
              align="left"
            />
            <SortableHeader
              label="Team A"
              sortKey="teamA"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
              align="left"
            />
            <SortableHeader
              label="Score"
              sortKey="score"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="Team B"
              sortKey="teamB"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
              align="left"
            />
            <SortableHeader
              label="Winner"
              sortKey="winner"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody>
          {displayed.map((game, index) => (
            <tr
              key={game.id}
              className={index % 2 === 1 ? styles.stripe : ''}
            >
              <td className={styles.mono}>{formatDate(game.date)}</td>
              <td className={styles.small}>
                {game.teamAPlayers.map(resolveName).join(', ')}
              </td>
              <td className={`${styles.center} ${styles.mono} ${styles.bold}`}>
                {game.teamAScore} - {game.teamBScore}
              </td>
              <td className={styles.small}>
                {game.teamBPlayers.map(resolveName).join(', ')}
              </td>
              <td className={`${styles.center} ${styles.mono} ${styles.bold} ${styles.positive}`}>
                {game.winner}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        <span>
          Showing {displayed.length} of {games.length} games
        </span>
        <span className={styles.footerControls}>
          {PAGE_OPTIONS.map((n) => (
            <button
              key={n}
              className={`${styles.pageBtn} ${visibleCount === n ? styles.pageBtnActive : ''}`}
              onClick={() => setVisibleCount(n)}
            >
              {n}
            </button>
          ))}
          <button
            className={`${styles.pageBtn} ${visibleCount === 'all' ? styles.pageBtnActive : ''}`}
            onClick={() => setVisibleCount('all')}
          >
            All
          </button>
        </span>
      </div>
    </div>
  );
}
