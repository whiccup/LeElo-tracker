export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getLocalISODate(date: Date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function normalizeName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, ' ');
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const normalized = normalizeName(fullName);
  if (!normalized) {
    return { firstName: '', lastName: '' };
  }

  const parts = normalized.split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
  };
}

export function abbreviateName(fullName: string): string {
  const normalized = normalizeName(fullName);
  if (!normalized) return fullName;

  const { firstName, lastName } = splitName(normalized);
  if (!firstName || !lastName) {
    return normalized;
  }

  return `${firstName} ${lastName[0]}.`;
}

export function formatNameListForDisplay(fullNames: string[]): string[] {
  const normalizedNames = fullNames.map(normalizeName);
  const abbreviated = normalizedNames.map(abbreviateName);
  const counts: Record<string, number> = {};

  for (const name of abbreviated) {
    counts[name] = (counts[name] || 0) + 1;
  }

  return normalizedNames.map((fullName, idx) => {
    const shortName = abbreviated[idx];
    if (counts[shortName] <= 1) {
      return shortName;
    }

    const { firstName, lastName } = splitName(fullName);
    if (!firstName || !lastName) {
      return fullName;
    }

    return `${firstName} ${lastName}`;
  });
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
