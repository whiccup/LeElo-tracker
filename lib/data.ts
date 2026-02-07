import { Player, Game, PlayerGameStats, EloHistoryPoint } from '@/types';
import { supabase } from './supabase';

export async function getPlayers(): Promise<Player[]> {
  const { data: players, error: playersErr } = await supabase
    .from('players')
    .select('id, first_name, last_name, elo');

  if (playersErr || !players) return [];

  // Get all game_players joined with games for computing derived stats
  const { data: gameData } = await supabase
    .from('game_players')
    .select('player_id, team, elo_after, game_id, games!inner(id, date, winner, created_at)');

  // Sort gameData by game date and created_at ascending
  const sortedGameData = (gameData || []).sort((a, b) => {
    const gameA = a.games as any;
    const gameB = b.games as any;
    const dateCompare = gameA.date.localeCompare(gameB.date);
    if (dateCompare !== 0) return dateCompare;
    // If same date, sort by created_at timestamp
    return new Date(gameA.created_at).getTime() - new Date(gameB.created_at).getTime();
  });

  // Group by player
  const playerGames = new Map<string, typeof sortedGameData>();
  for (const row of sortedGameData) {
    const list = playerGames.get(row.player_id) || [];
    list.push(row);
    playerGames.set(row.player_id, list);
  }

  return players.map((p) => {
    const pg = playerGames.get(p.id) || [];
    let wins = 0;
    let losses = 0;
    let lastPlayed = '';
    const eloHistory: EloHistoryPoint[] = [];

    for (const row of pg) {
      const game = row.games as any;
      const won = row.team === game.winner;
      if (won) wins++;
      else losses++;
      eloHistory.push({ date: game.date, elo: row.elo_after, gameId: game.id });
      lastPlayed = game.date;
    }

    // Compute streak from end
    let streak = 0;
    for (let i = pg.length - 1; i >= 0; i--) {
      const game = pg[i].games as any;
      const won = pg[i].team === game.winner;
      if (i === pg.length - 1) {
        streak = won ? 1 : -1;
      } else if ((won && streak > 0) || (!won && streak < 0)) {
        streak += won ? 1 : -1;
      } else {
        break;
      }
    }

    const gamesPlayed = wins + losses;
    return {
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      elo: p.elo,
      wins,
      losses,
      gamesPlayed,
      winPercentage: gamesPlayed > 0 ? wins / gamesPlayed : 0,
      streak,
      lastPlayed,
      eloHistory,
    };
  }).sort((a, b) => b.elo - a.elo);
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const players = await getPlayers();
  return players.find((p) => p.id === id) || null;
}

export async function getPlayerGameHistory(
  playerId: string
): Promise<PlayerGameStats[]> {
  // Get all games this player was in
  const { data: playerGameRows } = await supabase
    .from('game_players')
    .select('game_id, player_id, team, elo_after, games!inner(id, date, team_a_score, team_b_score, winner, created_at)');

  if (!playerGameRows) return [];

  // Filter to this player's rows and sort by date and created_at ascending
  const myRows = playerGameRows
    .filter((r) => r.player_id === playerId)
    .sort((a, b) => {
      const gameA = a.games as any;
      const gameB = b.games as any;
      const dateCompare = gameA.date.localeCompare(gameB.date);
      if (dateCompare !== 0) return dateCompare;
      // If same date, sort by created_at timestamp
      return new Date(gameA.created_at).getTime() - new Date(gameB.created_at).getTime();
    });

  if (myRows.length === 0) return [];

  // Get all participants for the same games (for teammates/opponents)
  const gameIds = myRows.map((r) => r.game_id);
  const { data: allParticipants } = await supabase
    .from('game_players')
    .select('game_id, player_id, team')
    .in('game_id', gameIds);

  // Get player names
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, first_name, last_name');

  const nameMap = new Map(
    (allPlayers || []).map((p) => [p.id, `${p.first_name} ${p.last_name}`])
  );

  const results: PlayerGameStats[] = [];
  let prevElo = 1000;

  for (const row of myRows) {
    const game = row.games as any;
    const won = row.team === game.winner;
    const isTeamA = row.team === 'A';

    const participants = (allParticipants || []).filter(
      (p) => p.game_id === row.game_id
    );
    const teammates = participants
      .filter((p) => p.team === row.team && p.player_id !== playerId)
      .map((p) => nameMap.get(p.player_id) || p.player_id);
    const opponents = participants
      .filter((p) => p.team !== row.team)
      .map((p) => nameMap.get(p.player_id) || p.player_id);

    results.push({
      gameId: game.id,
      date: game.date,
      teammates,
      opponents,
      result: won ? 'W' : 'L',
      teamScore: isTeamA ? game.team_a_score : game.team_b_score,
      opponentScore: isTeamA ? game.team_b_score : game.team_a_score,
      eloChange: row.elo_after - prevElo,
      eloAfter: row.elo_after,
    });
    prevElo = row.elo_after;
  }

  return results.reverse(); // most recent first
}

export async function getAllGames(): Promise<Game[]> {
  const { data: games } = await supabase
    .from('games')
    .select('id, date, team_a_score, team_b_score, winner, created_at')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (!games) return [];

  const { data: participants } = await supabase
    .from('game_players')
    .select('game_id, player_id, team');

  return games.map((g) => ({
    id: g.id,
    date: g.date,
    teamAPlayers: (participants || [])
      .filter((p) => p.game_id === g.id && p.team === 'A')
      .map((p) => p.player_id),
    teamBPlayers: (participants || [])
      .filter((p) => p.game_id === g.id && p.team === 'B')
      .map((p) => p.player_id),
    teamAScore: g.team_a_score,
    teamBScore: g.team_b_score,
    winner: g.winner as 'A' | 'B',
    created_at: g.created_at,
  }));
}
