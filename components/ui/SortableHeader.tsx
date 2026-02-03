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
      onClick={() => onSort(sortKey)}
      role="columnheader"
      aria-sort={
        isActive
          ? currentDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
    >
      <span className={styles.label}>
        {label}
        {isActive && (
          <span className={styles.arrow}>
            {currentDirection === 'asc' ? ' \u25B4' : ' \u25BE'}
          </span>
        )}
      </span>
    </th>
  );
}
