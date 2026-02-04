import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

const DEFAULT_RATING = 1000;
const K_BASE = 20;
const K_PLACEMENT = 40;
const PLACEMENT_THRESHOLD = 5; // first 5 games use higher K

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, teamAPlayers, teamBPlayers, teamAScore, teamBScore } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (!teamAPlayers?.length || !teamBPlayers?.length) {
      return NextResponse.json(
        { error: 'Both teams must have at least one player' },
        { status: 400 }
      );
    }
    if (teamAScore == null || teamBScore == null) {
      return NextResponse.json(
        { error: 'Scores are required for both teams' },
        { status: 400 }
      );
    }
    if (Number(teamAScore) === Number(teamBScore)) {
      return NextResponse.json(
        { error: 'Game cannot end in a tie' },
        { status: 400 }
      );
    }

    // Check for duplicate players across teams
    const overlap = teamAPlayers.filter((p: string) => teamBPlayers.includes(p));
    if (overlap.length > 0) {
      return NextResponse.json(
        { error: 'A player cannot be on both teams' },
        { status: 400 }
      );
    }

    const winner = Number(teamAScore) > Number(teamBScore) ? 'A' : 'B';
    const gameId = `g-${Date.now()}`;

    // Insert game
    const { error: gameErr } = await supabase.from('games').insert({
      id: gameId,
      date,
      team_a_score: Number(teamAScore),
      team_b_score: Number(teamBScore),
      winner,
    });

    if (gameErr) {
      console.error('Game insert error:', gameErr);
      return NextResponse.json(
        { error: 'Failed to create game' },
        { status: 500 }
      );
    }

    // Fetch current ratings for all players
    const allPlayerIds = [...teamAPlayers, ...teamBPlayers];
    const { data: players } = await supabase
      .from('players')
      .select('id, elo')
      .in('id', allPlayerIds);

    if (!players) {
      return NextResponse.json(
        { error: 'Failed to fetch player ratings' },
        { status: 500 }
      );
    }

    const eloMap = new Map(players.map((p) => [p.id, p.elo]));

    // Count games played per player (for placement K factor)
    const { data: gameCounts } = await supabase
      .from('game_players')
      .select('player_id')
      .in('player_id', allPlayerIds);

    const gameCountMap = new Map<string, number>();
    for (const row of gameCounts || []) {
      gameCountMap.set(row.player_id, (gameCountMap.get(row.player_id) || 0) + 1);
    }

    // STEP 2: Team Rating = Average of players
    const teamAElo =
      teamAPlayers.reduce((sum: number, id: string) => sum + (eloMap.get(id) || DEFAULT_RATING), 0) /
      teamAPlayers.length;
    const teamBElo =
      teamBPlayers.reduce((sum: number, id: string) => sum + (eloMap.get(id) || DEFAULT_RATING), 0) /
      teamBPlayers.length;

    // STEP 3: Expected Win Probability
    const expectedA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const expectedB = 1 - expectedA;

    // STEP 4: Margin of Victory Multiplier
    const pointDiff = Math.abs(Number(teamAScore) - Number(teamBScore));
    const movMultiplier = Math.log(pointDiff + 1);

    // STEP 6: Team Size Multiplier (4v4 = 1.1, 5v5 = 1.0)
    const teamSize = Math.max(teamAPlayers.length, teamBPlayers.length);
    const teamSizeMultiplier = teamSize <= 4 ? 1.1 : 1.0;

    const actualA = winner === 'A' ? 1 : 0;
    const actualB = 1 - actualA;

    // STEP 5 & 7: Calculate per-player delta with individual K factor
    const gamePlayerRows = [
      ...teamAPlayers.map((id: string) => {
        const gamesPlayed = gameCountMap.get(id) || 0;
        const K = gamesPlayed < PLACEMENT_THRESHOLD ? K_PLACEMENT : K_BASE;
        const delta = Math.round(K * movMultiplier * teamSizeMultiplier * (actualA - expectedA));
        return {
          game_id: gameId,
          player_id: id,
          team: 'A',
          elo_after: (eloMap.get(id) || DEFAULT_RATING) + delta,
        };
      }),
      ...teamBPlayers.map((id: string) => {
        const gamesPlayed = gameCountMap.get(id) || 0;
        const K = gamesPlayed < PLACEMENT_THRESHOLD ? K_PLACEMENT : K_BASE;
        const delta = Math.round(K * movMultiplier * teamSizeMultiplier * (actualB - expectedB));
        return {
          game_id: gameId,
          player_id: id,
          team: 'B',
          elo_after: (eloMap.get(id) || DEFAULT_RATING) + delta,
        };
      }),
    ];

    const { error: gpErr } = await supabase
      .from('game_players')
      .insert(gamePlayerRows);

    if (gpErr) {
      console.error('game_players insert error:', gpErr);
      return NextResponse.json(
        { error: 'Failed to record player participation' },
        { status: 500 }
      );
    }

    // Update each player's Elo and last_game date
    for (const row of gamePlayerRows) {
      await supabase
        .from('players')
        .update({ elo: row.elo_after, last_game: date })
        .eq('id', row.player_id);
    }

    revalidatePath('/');
    return NextResponse.json({ success: true, gameId }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
