'use client';

import { useState } from 'react';
import { PlayerGameStats, GameSortConfig, GameSortKey } from '@/types';
import { formatDate, formatEloChange } from '@/lib/utils';
import SortableHeader from '@/components/ui/SortableHeader';
import styles from './GameHistoryTable.module.css';

interface Props {
  games: PlayerGameStats[];
}

export default function GameHistoryTable({ games }: Props) {
  const [sortConfig, setSortConfig] = useState<GameSortConfig>({
    key: 'date',
    direction: 'desc',
  });

  const handleSort = (key: string) => {
    const sortKey = key as GameSortKey;
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
      return (
        (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
      );
    }
    if (key === 'result') {
      return a.result.localeCompare(b.result) * dir;
    }
    if (key === 'eloChange') {
      return (a.eloChange - b.eloChange) * dir;
    }
    if (key === 'eloAfter') {
      return (a.eloAfter - b.eloAfter) * dir;
    }
    return 0;
  });

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
              label="Result"
              sortKey="result"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <th style={{ textAlign: 'center' }}>SCORE</th>
            <th style={{ textAlign: 'left' }}>TEAM</th>
            <th style={{ textAlign: 'left' }}>OPPONENT</th>
            <SortableHeader
              label="Elo &Delta;"
              sortKey="eloChange"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="New Elo"
              sortKey="eloAfter"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((game, index) => (
            <tr
              key={game.gameId}
              className={index % 2 === 1 ? styles.stripe : ''}
            >
              <td className={styles.mono}>{formatDate(game.date)}</td>
              <td
                className={`${styles.center} ${styles.mono} ${styles.bold} ${
                  game.result === 'W' ? styles.positive : styles.negative
                }`}
              >
                {game.result}
              </td>
              <td className={`${styles.center} ${styles.mono}`}>
                {game.teamScore} - {game.opponentScore}
              </td>
              <td className={styles.small}>
                {game.teammates.join(', ')}
              </td>
              <td className={styles.small}>
                {game.opponents.join(', ')}
              </td>
              <td
                className={`${styles.center} ${styles.mono} ${
                  game.eloChange > 0
                    ? styles.positive
                    : game.eloChange < 0
                      ? styles.negative
                      : ''
                }`}
              >
                {game.eloChange !== 0 ? formatEloChange(game.eloChange) : '-'}
              </td>
              <td className={`${styles.center} ${styles.mono} ${styles.bold}`}>
                {game.eloAfter || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        {games.length} total game{games.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
