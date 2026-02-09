'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import styles from './Header.module.css';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <Link href="/" className={styles.title}>
          LeElo Tracker
        </Link>
        {!isLoading && (
          isAuthenticated ? (
            <button className={styles.authButton} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link href="/login" className={styles.authButton}>
              Login
            </Link>
          )
        )}
      </div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Player Rankings</Link>
        <Link href="/games" className={styles.navLink}>Games</Link>
        <Link href="/combos" className={styles.navLink}>Chemistry</Link>
        <Link href="/rankings_info" className={styles.navLink}>Ranks and Badges</Link>
        {!isLoading && isAuthenticated && (
          <>
            <Link href="/reaping" className={styles.navLink}>Reaping</Link>
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
              <button
                className={styles.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Data Entry ▼
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link href="/player/new" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>New Player</Link>
                  <Link href="/game/new" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>New Game</Link>
                  <Link href="/game/edit" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>Edit Game</Link>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <div className={styles.subHeader}>From LeElo, the free basketball statistics database</div>
    </header>
  );
}
