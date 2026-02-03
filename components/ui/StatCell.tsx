import styles from './StatCell.module.css';

interface StatCellProps {
  value: string | number;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
  bold?: boolean;
  color?: 'positive' | 'negative' | 'default';
}

export default function StatCell({
  value,
  align = 'center',
  mono = true,
  bold = false,
  color = 'default',
}: StatCellProps) {
  const className = [
    styles.cell,
    mono ? styles.mono : '',
    bold ? styles.bold : '',
    color === 'positive' ? styles.positive : '',
    color === 'negative' ? styles.negative : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <td className={className} style={{ textAlign: align }}>
      {value}
    </td>
  );
}
