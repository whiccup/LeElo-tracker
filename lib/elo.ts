import { supabase } from '@/lib/supabase';

export const DEFAULT_RATING = 1000;
export const K_BASE = 20;
export const K_PLACEMENT = 40;
export const PLACEMENT_THRESHOLD = 5;

/**
 * Recalculates all Elo ratings from scratch by replaying every game chronologically.
 * Updates game_players.elo_after for each game and players.elo + players.last_game.
 */
export async function recalculateAllElo(): Promise<void> {
  // 1. Fetch all games ordered chronologically
  const { data: games, error: gamesErr } = await supabase
    .from('games')
    .select('id, date, team_a_score, team_b_score, winner')
    .order('date', { ascending: true })
    .order('id', { ascending: true });

  if (gamesErr || !games) {
    throw new Error('Failed to fetch games for recalculation');
  }

  // 2. Fetch all game_players rows
  const { data: allGamePlayers, error: gpErr } = await supabase
    .from('game_players')
    .select('game_id, player_id, team');

  if (gpErr || !allGamePlayers) {
    throw new Error('Failed to fetch game_players for recalculation');
  }

  // Build a map of game_id -> players by team
  const gameRosters = new Map<string, { teamA: string[]; teamB: string[] }>();
  for (const gp of allGamePlayers) {
    if (!gameRosters.has(gp.game_id)) {
      gameRosters.set(gp.game_id, { teamA: [], teamB: [] });
    }
    const roster = gameRosters.get(gp.game_id)!;
    if (gp.team === 'A') {
      roster.teamA.push(gp.player_id);
    } else {
      roster.teamB.push(gp.player_id);
    }
  }

  // 3. Fetch all player IDs and initialize Elo map
  const { data: allPlayers, error: playersErr } = await supabase
    .from('players')
    .select('id');

  if (playersErr || !allPlayers) {
    throw new Error('Failed to fetch players for recalculation');
  }

  const eloMap = new Map<string, number>();
  for (const p of allPlayers) {
    eloMap.set(p.id, DEFAULT_RATING);
  }

  // 4. Track games-played count per player
  const gamesPlayedMap = new Map<string, number>();

  // Track last game date per player
  const lastGameMap = new Map<string, string>();

  // 5. Replay each game chronologically
  for (const game of games) {
    const roster = gameRosters.get(game.id);
    if (!roster) continue;

    const { teamA, teamB } = roster;
    if (teamA.length === 0 || teamB.length === 0) continue;

    // Team average Elo
    const teamAElo =
      teamA.reduce((sum, id) => sum + (eloMap.get(id) || DEFAULT_RATING), 0) / teamA.length;
    const teamBElo =
      teamB.reduce((sum, id) => sum + (eloMap.get(id) || DEFAULT_RATING), 0) / teamB.length;

    // Expected win probability
    const expectedA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const expectedB = 1 - expectedA;

    // Margin of victory multiplier
    const pointDiff = Math.abs(game.team_a_score - game.team_b_score);
    const movMultiplier = Math.log(pointDiff + 1);

    // Team size multiplier
    const teamSize = Math.max(teamA.length, teamB.length);
    const teamSizeMultiplier = teamSize <= 4 ? 1.1 : 1.0;

    const actualA = game.winner === 'A' ? 1 : 0;
    const actualB = 1 - actualA;

    // Calculate per-player deltas and update elo_after
    const updates: { game_id: string; player_id: string; team: string; elo_after: number }[] = [];

    for (const id of teamA) {
      const gamesPlayed = gamesPlayedMap.get(id) || 0;
      const K = gamesPlayed < PLACEMENT_THRESHOLD ? K_PLACEMENT : K_BASE;
      const delta = Math.round(K * movMultiplier * teamSizeMultiplier * (actualA - expectedA));
      const currentElo = eloMap.get(id) || DEFAULT_RATING;
      const newElo = currentElo + delta;
      eloMap.set(id, newElo);
      gamesPlayedMap.set(id, gamesPlayed + 1);
      lastGameMap.set(id, game.date);
      updates.push({ game_id: game.id, player_id: id, team: 'A', elo_after: newElo });
    }

    for (const id of teamB) {
      const gamesPlayed = gamesPlayedMap.get(id) || 0;
      const K = gamesPlayed < PLACEMENT_THRESHOLD ? K_PLACEMENT : K_BASE;
      const delta = Math.round(K * movMultiplier * teamSizeMultiplier * (actualB - expectedB));
      const currentElo = eloMap.get(id) || DEFAULT_RATING;
      const newElo = currentElo + delta;
      eloMap.set(id, newElo);
      gamesPlayedMap.set(id, gamesPlayed + 1);
      lastGameMap.set(id, game.date);
      updates.push({ game_id: game.id, player_id: id, team: 'B', elo_after: newElo });
    }

    // Update game_players rows for this game
    for (const u of updates) {
      await supabase
        .from('game_players')
        .update({ elo_after: u.elo_after })
        .eq('game_id', u.game_id)
        .eq('player_id', u.player_id);
    }
  }

  // 6. Update each player's final elo and last_game
  const playerIds = Array.from(eloMap.keys());
  for (const id of playerIds) {
    const finalElo = eloMap.get(id)!;
    const lastGame = lastGameMap.get(id);
    const updateData: { elo: number; last_game?: string } = { elo: finalElo };
    if (lastGame) {
      updateData.last_game = lastGame;
    }
    await supabase.from('players').update(updateData).eq('id', id);
  }
}
