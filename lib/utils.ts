export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getLocalISODate(date: Date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDateLong(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatWinPercentage(pct: number): string {
  return pct.toFixed(3).replace(/^0/, '');
}

export function formatStreak(streak: number): { text: string; type: 'win' | 'loss' | 'neutral' } {
  if (streak > 0) {
    return { text: `W${streak} \u2713`, type: 'win' };
  } else if (streak < 0) {
    return { text: `L${Math.abs(streak)} \u2717`, type: 'loss' };
  }
  return { text: '-', type: 'neutral' };
}

export function formatEloChange(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return '0';
}
