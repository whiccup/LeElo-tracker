import { Player } from '@/types';
import { formatWinPercentage, formatStreak, formatDateLong } from '@/lib/utils';
import styles from './PlayerHeader.module.css';

interface Props {
  player: Player;
  rank: number;
}

export default function PlayerHeader({ player, rank }: Props) {
  const streak = formatStreak(player.streak);

  return (
    <div className={styles.card}>
      <div className={styles.nameSection}>
        <h1 className={styles.name}>{player.name}</h1>
        <p className={styles.subtitle}>
          Rank #{rank} | {player.elo} Elo
        </p>
      </div>
      <div className={styles.divider} />
      <div className={styles.quickStats}>
        <span>
          {player.wins}-{player.losses} Record
        </span>
        <span className={styles.separator}>|</span>
        <span>{formatWinPercentage(player.winPercentage)} Win%</span>
        <span className={styles.separator}>|</span>
        <span>{player.gamesPlayed} Games</span>
        <span className={styles.separator}>|</span>
        <span
          className={
            streak.type === 'win'
              ? styles.positive
              : streak.type === 'loss'
                ? styles.negative
                : ''
          }
        >
          {streak.text} Current Streak
        </span>
      </div>
      <p className={styles.lastPlayed}>
        Last Played: {formatDateLong(player.lastPlayed)}
      </p>
    </div>
  );
}
