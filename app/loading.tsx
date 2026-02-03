import styles from './loading.module.css';

export default function Loading() {
  return (
    <main className="content-wrapper">
      <div className={styles.skeleton}>
        <div className={styles.headerRow}>
          <div className={`${styles.bar} ${styles.title}`} />
          <div className={`${styles.bar} ${styles.meta}`} />
        </div>
        <div className={styles.table}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.row}>
              <div className={`${styles.bar} ${styles.cell}`} />
              <div className={`${styles.bar} ${styles.cellWide}`} />
              <div className={`${styles.bar} ${styles.cell}`} />
              <div className={`${styles.bar} ${styles.cell}`} />
              <div className={`${styles.bar} ${styles.cell}`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
