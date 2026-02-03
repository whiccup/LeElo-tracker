import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlayerById, getPlayerGameHistory, getPlayers } from '@/lib/data';
import PlayerHeader from '@/components/player/PlayerHeader';
import EloChart from '@/components/player/EloChart';
import GameHistoryTable from '@/components/player/GameHistoryTable';
import styles from './page.module.css';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const { id } = params;
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
  const { id } = params;
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
    <main>
      <Link href="/" className={styles.backLink}>
        &larr; Back to Rankings
      </Link>

      <PlayerHeader player={player} rank={rank} />

      <div className="section-header">
        <h2>Career Stats</h2>
      </div>
      <table className={styles.statsTable}>
        <tbody>
          <tr>
            <td className={styles.statsLabel}>Wins</td>
            <td className={styles.statsValue}>{player.wins}</td>
            <td className={styles.statsLabel}>Losses</td>
            <td className={styles.statsValue}>{player.losses}</td>
            <td className={styles.statsLabel}>Win%</td>
            <td className={styles.statsValue}>
              {player.winPercentage.toFixed(3).replace(/^0/, '')}
            </td>
          </tr>
          <tr>
            <td className={styles.statsLabel}>Games</td>
            <td className={styles.statsValue}>{player.gamesPlayed}</td>
            <td className={styles.statsLabel}>Peak Elo</td>
            <td className={styles.statsValue}>{peakElo}</td>
            <td className={styles.statsLabel}>Current</td>
            <td className={styles.statsValue}>{player.elo}</td>
          </tr>
          <tr>
            <td className={styles.statsLabel}>Start</td>
            <td className={styles.statsValue}>1500</td>
            <td className={styles.statsLabel}>Best Streak</td>
            <td className={`${styles.statsValue} ${styles.positive}`}>
              W{bestStreak}
            </td>
            <td className={styles.statsLabel}>Worst Streak</td>
            <td className={`${styles.statsValue} ${styles.negative}`}>
              L{worstStreak}
            </td>
          </tr>
        </tbody>
      </table>

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
