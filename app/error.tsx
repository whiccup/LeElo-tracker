'use client';

import styles from './error.module.css';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="content-wrapper">
      <div className={styles.errorBox}>
        <h2>Something went wrong</h2>
        <p>Unable to load rankings. Please refresh the page.</p>
        <button onClick={reset} className={styles.retry}>
          Try again
        </button>
      </div>
    </main>
  );
}
