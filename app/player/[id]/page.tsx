import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlayerById, getPlayerGameHistory, getPlayers } from '@/lib/data';
import PlayerHeader from '@/components/player/PlayerHeader';
import EloChart from '@/components/player/EloChart';
import GameHistoryTable from '@/components/player/GameHistoryTable';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) {
    return { title: 'Player Not Found - LeElo Tracker' };
  }
  return {
    title: `${player.name} - LeElo Tracker`,
    description: `${player.name}'s basketball stats, Elo rating, and game history`,
  };
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const [player, games, allPlayers] = await Promise.all([
    getPlayerById(id),
    getPlayerGameHistory(id),
    getPlayers(),
  ]);

  if (!player) {
    notFound();
  }

  // Calculate rank from all players sorted by Elo
  const sorted = [...allPlayers].sort((a, b) => b.elo - a.elo);
  const rank = sorted.findIndex((p) => p.id === player.id) + 1;

  // Career stats
  const peakElo = Math.max(...player.eloHistory.map((p) => p.elo));
  const eloChanges = player.eloHistory.map((p, i) =>
    i === 0 ? 0 : p.elo - player.eloHistory[i - 1].elo
  );

  // Calculate best/worst streaks from elo history
  let bestStreak = 0;
  let worstStreak = 0;
  let currentWin = 0;
  let currentLoss = 0;
  for (const change of eloChanges) {
    if (change > 0) {
      currentWin++;
      currentLoss = 0;
      bestStreak = Math.max(bestStreak, currentWin);
    } else if (change < 0) {
      currentLoss++;
      currentWin = 0;
      worstStreak = Math.max(worstStreak, currentLoss);
    }
  }

  return (
    <main className="content-wrapper">
      <Link href="/" className={styles.backLink}>
        &lsaquo; Back to Rankings
      </Link>

      <PlayerHeader player={player} rank={rank} />

      <div className="section-header">
        <h2>Career Stats</h2>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Wins</span>
          <span className={styles.statValue}>{player.wins}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Losses</span>
          <span className={styles.statValue}>{player.losses}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Win%</span>
          <span className={styles.statValue}>
            {player.winPercentage.toFixed(3).replace(/^0/, '')}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Games</span>
          <span className={styles.statValue}>{player.gamesPlayed}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Peak Elo</span>
          <span className={styles.statValue}>{peakElo}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Current</span>
          <span className={styles.statValue}>{player.elo}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Start</span>
          <span className={styles.statValue}>1500</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Best Streak</span>
          <span className={`${styles.statValue} ${styles.positive}`}>
            W{bestStreak}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Worst Streak</span>
          <span className={`${styles.statValue} ${styles.negative}`}>
            L{worstStreak}
          </span>
        </div>
      </div>

      <div className="section-header">
        <h2>Elo Rating Over Time</h2>
      </div>
      <EloChart eloHistory={player.eloHistory} />

      <div className="section-header">
        <h2>Game History</h2>
      </div>
      <GameHistoryTable games={games} />
    </main>
  );
}
