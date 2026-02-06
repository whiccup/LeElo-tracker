import { Game, ComboStats } from '@/types';

function getCombinations(arr: string[], size: number): string[][] {
  if (size === 1) return arr.map((item) => [item]);
  const results: string[][] = [];
  for (let i = 0; i <= arr.length - size; i++) {
    const rest = getCombinations(arr.slice(i + 1), size - 1);
    for (const combo of rest) {
      results.push([arr[i], ...combo]);
    }
  }
  return results;
}

export function computeComboStats(games: Game[], comboSize: number): ComboStats[] {
  const map = new Map<string, { wins: number; losses: number; playerIds: string[] }>();

  for (const game of games) {
    const teamACombos = getCombinations(game.teamAPlayers.sort(), comboSize);
    const teamBCombos = getCombinations(game.teamBPlayers.sort(), comboSize);

    for (const combo of teamACombos) {
      const key = combo.sort().join('-');
      const entry = map.get(key) || { wins: 0, losses: 0, playerIds: combo.sort() };
      if (game.winner === 'A') entry.wins++;
      else entry.losses++;
      map.set(key, entry);
    }

    for (const combo of teamBCombos) {
      const key = combo.sort().join('-');
      const entry = map.get(key) || { wins: 0, losses: 0, playerIds: combo.sort() };
      if (game.winner === 'B') entry.wins++;
      else entry.losses++;
      map.set(key, entry);
    }
  }

  const results: ComboStats[] = [];
  for (const entry of Array.from(map.values())) {
    const gamesPlayed = entry.wins + entry.losses;
    if (gamesPlayed < 5) continue;
    results.push({
      playerIds: entry.playerIds,
      gamesPlayed,
      wins: entry.wins,
      losses: entry.losses,
      winPercentage: entry.wins / gamesPlayed,
    });
  }

  return results.sort((a, b) => b.winPercentage - a.winPercentage);
}
