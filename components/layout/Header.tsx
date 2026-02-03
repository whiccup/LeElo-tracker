import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`content-wrapper ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.title}>
            LEELO TRACKER
          </Link>
          <span className={styles.subtitle}>Basketball League Rankings</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/">Rankings</Link>
        </nav>
      </div>
    </header>
  );
}
