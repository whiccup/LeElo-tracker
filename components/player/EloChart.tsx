'use client';

import { useState } from 'react';
import { EloHistoryPoint } from '@/types';
import styles from './EloChart.module.css';

interface Props {
  eloHistory: EloHistoryPoint[];
}

export default function EloChart({ eloHistory }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (eloHistory.length === 0) {
    return (
      <div className={styles.placeholder}>
        <p>No Elo history data available.</p>
      </div>
    );
  }

  // Prepend Game 0 at starting Elo (1000)
  const dataPoints = [{ elo: 1000 }, ...eloHistory.map((p) => ({ elo: p.elo }))];
  const totalPoints = dataPoints.length;

  const elos = dataPoints.map((p) => p.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);
  const range = maxElo - minElo || 1;

  // SVG dimensions
  const width = 900;
  const height = 260;
  const padding = { top: 20, right: 40, bottom: 20, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Scale
  const xStep = chartW / Math.max(totalPoints - 1, 1);
  const yScale = (elo: number) =>
    padding.top + chartH - ((elo - minElo) / range) * chartH;

  // Build polyline points
  const points = dataPoints
    .map((p, i) => `${padding.left + i * xStep},${yScale(p.elo)}`)
    .join(' ');

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const elo = Math.round(minElo + (range * i) / 4);
    return { elo, y: yScale(elo) };
  });

  // Data point coordinates for dot markers
  const dotCoords = dataPoints.map((p, i) => ({
    x: padding.left + i * xStep,
    y: yScale(p.elo),
    elo: p.elo,
  }));

  const hoveredDot = hovered !== null ? dotCoords[hovered] : null;
  const tooltipAbove = hoveredDot ? hoveredDot.y > padding.top + 30 : true;

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

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* Invisible hit areas + visible dots */}
        {dotCoords.map((d, i) => (
          <g key={i}>
            {/* Larger invisible hit area */}
            <circle
              cx={d.x}
              cy={d.y}
              r="14"
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={styles.hitArea}
            />
            {/* Visible dot */}
            <circle
              cx={d.x}
              cy={d.y}
              r={hovered === i ? 6 : 3.5}
              fill="#000000"
              pointerEvents="none"
            />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredDot && hovered !== null && (
          <g className={styles.tooltip} pointerEvents="none">
            <rect
              x={hoveredDot.x - 48}
              y={tooltipAbove ? hoveredDot.y - 48 : hoveredDot.y + 12}
              width="96"
              height="38"
              rx="2"
              fill="#fff"
              stroke="#000"
              strokeWidth="1"
            />
            <text
              x={hoveredDot.x}
              y={tooltipAbove ? hoveredDot.y - 30 : hoveredDot.y + 30}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#000"
              fontFamily="Arial, Helvetica, sans-serif"
            >
              Game {hovered}
            </text>
            <text
              x={hoveredDot.x}
              y={tooltipAbove ? hoveredDot.y - 16 : hoveredDot.y + 44}
              textAnchor="middle"
              fontSize="12"
              fill="#54595d"
              fontFamily="Arial, Helvetica, sans-serif"
            >
              Elo: {hoveredDot.elo}
            </text>
          </g>
        )}

        {/* Game count */}
        <text
          x={width - padding.right}
          y={height - 4}
          textAnchor="end"
          fontSize="11"
          fill="#54595d"
          fontFamily="'Times New Roman', serif"
        >
          {eloHistory.length} {eloHistory.length === 1 ? 'game' : 'games'}
        </text>
      </svg>
    </div>
  );
}
