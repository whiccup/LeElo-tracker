import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, playerIds, autoIncludedIds, excludedIds } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const allPlayerIds = [...(playerIds || []), ...(autoIncludedIds || [])];
    if (allPlayerIds.length <= 15) {
      return NextResponse.json(
        { error: 'Must have more than 15 players to run a reaping' },
        { status: 400 }
      );
    }

    const reapingId = `r-${Date.now()}`;

    // Insert reaping event
    const { error: eventErr } = await supabase.from('reaping_events').insert({
      id: reapingId,
      date,
    });

    if (eventErr) {
      console.error('Reaping event insert error:', eventErr);
      return NextResponse.json(
        { error: 'Failed to create reaping event' },
        { status: 500 }
      );
    }

    // Insert reaping players
    const excludedSet = new Set(excludedIds || []);
    const reapingPlayerRows = allPlayerIds.map((playerId: string) => ({
      reaping_id: reapingId,
      player_id: playerId,
      excluded: excludedSet.has(playerId),
    }));

    const { error: playersErr } = await supabase
      .from('reaping_players')
      .insert(reapingPlayerRows);

    if (playersErr) {
      console.error('Reaping players insert error:', playersErr);
      return NextResponse.json(
        { error: 'Failed to record reaping players' },
        { status: 500 }
      );
    }

    // Recalculate is_unlucky_twice for all participating players
    for (const playerId of allPlayerIds) {
      // Get last 2 reaping records for this player, ordered by event date DESC
      const { data: recentRecords } = await supabase
        .from('reaping_players')
        .select('excluded, reaping_id, reaping_events(date)')
        .eq('player_id', playerId)
        .order('reaping_id', { ascending: false })
        .limit(2);

      // Sort by event date descending (join gives us the date)
      const sorted = (recentRecords || []).sort((a: any, b: any) => {
        const dateA = a.reaping_events?.date || '';
        const dateB = b.reaping_events?.date || '';
        return dateB.localeCompare(dateA);
      });

      const isUnluckyTwice =
        sorted.length >= 2 && sorted[0].excluded && sorted[1].excluded;

      await supabase
        .from('players')
        .update({ is_unlucky_twice: isUnluckyTwice })
        .eq('id', playerId);
    }

    revalidatePath('/reaping');
    return NextResponse.json({ success: true, reapingId }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
