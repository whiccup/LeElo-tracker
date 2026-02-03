import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link href="/" className={styles.title}>
          LeElo Tracker
        </Link>
        <span className={styles.subtitle}>From LeElo, the free basketball statistics database</span>
      </div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Rankings</Link>
        <Link href="/" className={styles.navLink}>Reaping</Link>
      </nav>
    </header>
  );
}
