'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import styles from './Header.module.css';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navClass = (href: string) => {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
  };

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
        <Link href="/" className={navClass('/')}>Player Rankings</Link>
        <Link href="/games" className={navClass('/games')}>Games</Link>
        <Link href="/combos" className={navClass('/combos')}>Chemistry</Link>
        <Link href="/rankings_info" className={navClass('/rankings_info')}>Ranks and Badges</Link>
        {!isLoading && isAuthenticated && (
          <>
            <Link href="/reaping" className={navClass('/reaping')}>Reaping</Link>
            <Link href="/attendance" className={navClass('/attendance')}>Attendance</Link>
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
                  <Link href="/attendance/new" className={styles.dropdownLink} onClick={() => setDropdownOpen(false)}>Record Attendance</Link>
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
