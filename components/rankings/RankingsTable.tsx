'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player, SortConfig, SortKey } from '@/types';
import { formatDate, formatWinPercentage, formatStreak } from '@/lib/utils';
import SortableHeader from '@/components/ui/SortableHeader';
import styles from './RankingsTable.module.css';

interface Props {
  players: Player[];
}

export default function RankingsTable({ players }: Props) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'elo',
    direction: 'desc',
  });

  const handleSort = (key: string) => {
    const sortKey = key as SortKey;
    setSortConfig((prev) => ({
      key: sortKey,
      direction:
        prev.key === sortKey && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const key = sortConfig.key;

    if (key === 'rank' || key === 'elo') {
      return (a.elo - b.elo) * dir;
    }
    if (key === 'name') {
      return a.name.localeCompare(b.name) * dir;
    }
    if (key === 'lastPlayed') {
      return (
        (new Date(a.lastPlayed).getTime() -
          new Date(b.lastPlayed).getTime()) *
        dir
      );
    }

    const aVal = a[key as keyof Player] as number;
    const bVal = b[key as keyof Player] as number;
    return (aVal - bVal) * dir;
  });

  // Assign ranks based on Elo (descending)
  const rankedByElo = [...players].sort((a, b) => b.elo - a.elo);
  const rankMap = new Map<string, number>();
  rankedByElo.forEach((p, i) => rankMap.set(p.id, i + 1));

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortableHeader
              label="Rank"
              sortKey="rank"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="Name"
              sortKey="name"
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
              label="Elo"
              sortKey="elo"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
            <SortableHeader
              label="Streak"
              sortKey="streak"
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
            <SortableHeader
              label="Last"
              sortKey="lastPlayed"
              currentKey={sortConfig.key}
              currentDirection={sortConfig.direction}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => {
            const streak = formatStreak(player.streak);
            const rank = rankMap.get(player.id) ?? index + 1;

            return (
              <tr
                key={player.id}
                className={`${styles.row} ${index % 2 === 1 ? styles.stripe : ''}`}
                onClick={() => router.push(`/player/${player.id}`)}
                tabIndex={0}
                role="link"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/player/${player.id}`);
                  }
                }}
              >
                <td className={styles.center}>
                  <span className={styles.mono}>{rank}</span>
                </td>
                <td className={styles.name}>{player.name}</td>
                <td className={`${styles.center} ${styles.mono}`}>
                  {player.wins}
                </td>
                <td className={`${styles.center} ${styles.mono}`}>
                  {player.losses}
                </td>
                <td className={`${styles.center} ${styles.mono} ${styles.bold}`}>
                  {player.elo}
                </td>
                <td
                  className={`${styles.center} ${styles.mono} ${
                    streak.type === 'win'
                      ? styles.positive
                      : streak.type === 'loss'
                        ? styles.negative
                        : ''
                  }`}
                >
                  {streak.text}
                </td>
                <td className={`${styles.center} ${styles.mono}`}>
                  {player.gamesPlayed}
                </td>
                <td className={`${styles.center} ${styles.mono}`}>
                  {formatWinPercentage(player.winPercentage)}
                </td>
                <td className={`${styles.center} ${styles.mono}`}>
                  {formatDate(player.lastPlayed)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.footer}>
        {players.length} player{players.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
