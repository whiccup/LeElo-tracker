'use client';

import styles from './SortableHeader.module.css';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentKey: string;
  currentDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
}

export default function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDirection,
  onSort,
  align = 'center',
}: SortableHeaderProps) {
  const isActive = currentKey === sortKey;

  return (
    <th
      className={`${styles.header} ${isActive ? styles.active : ''}`}
      style={{ textAlign: align }}
      scope="col"
      aria-sort={
        isActive
          ? currentDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
      >
        <span className={styles.label}>
          {label}
          {isActive && (
            <span className={styles.arrow}>
              {currentDirection === 'asc' ? ' \u25B4' : ' \u25BE'}
            </span>
          )}
        </span>
      </button>
    </th>
  );
}
