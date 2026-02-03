import { EloHistoryPoint } from '@/types';
import styles from './EloChart.module.css';

interface Props {
  eloHistory: EloHistoryPoint[];
}

export default function EloChart({ eloHistory }: Props) {
  if (eloHistory.length === 0) {
    return (
      <div className={styles.placeholder}>
        <p>No Elo history data available.</p>
      </div>
    );
  }

  const elos = eloHistory.map((p) => p.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);
  const range = maxElo - minElo || 1;

  // SVG dimensions
  const width = 900;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Scale
  const xStep = chartW / Math.max(eloHistory.length - 1, 1);
  const yScale = (elo: number) =>
    padding.top + chartH - ((elo - minElo) / range) * chartH;

  // Build polyline points
  const points = eloHistory
    .map((p, i) => `${padding.left + i * xStep},${yScale(p.elo)}`)
    .join(' ');

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const elo = Math.round(minElo + (range * i) / 4);
    return { elo, y: yScale(elo) };
  });

  // X-axis labels (show ~6 evenly spaced)
  const xLabelCount = Math.min(6, eloHistory.length);
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const idx = Math.round((i * (eloHistory.length - 1)) / Math.max(xLabelCount - 1, 1));
    return {
      label: `Game ${idx + 1}`,
      x: padding.left + idx * xStep,
    };
  });

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
        role="img"
        aria-label="Elo rating trend chart"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick.elo}
            x1={padding.left}
            y1={tick.y}
            x2={width - padding.right}
            y2={tick.y}
            stroke="#c0c0c0"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`label-${tick.elo}`}
            x={padding.left - 10}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="12"
            fill="#54595d"
            fontFamily="'Times New Roman', serif"
          >
            {tick.elo}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label) => (
          <text
            key={label.label}
            x={label.x}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#54595d"
            fontFamily="'Times New Roman', serif"
          >
            {label.label}
          </text>
        ))}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#000000"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
