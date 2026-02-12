import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { recalculateAllElo } from '@/lib/elo';

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, venmo_user, player_notes } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Generate slug ID
    const id = generateSlug(first_name, last_name);

    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('id', id)
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'A player with this name already exists' },
        { status: 409 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Insert new player
    const { data, error } = await supabase
      .from('players')
      .insert({
        id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email?.trim() || '',
        phone: phone?.trim() || '',
        venmo_user: venmo_user?.trim() || '',
        player_notest: player_notes?.trim() || '',
        elo: 1000,
        first_game: today,
        last_game: today,
        is_unlucky_twice: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create player' },
        { status: 500 }
      );
    }

    revalidatePath('/');
    return NextResponse.json({ success: true, player: data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, first_name, last_name, email, phone, venmo_user, player_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('players')
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email?.trim() || '',
        phone: phone?.trim() || '',
        venmo_user: venmo_user?.trim() || '',
        player_notes: player_notes?.trim() || '',
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
    }

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Check if player has game history
    const { data: gameRefs } = await supabase
      .from('game_players')
      .select('game_id')
      .eq('player_id', id)
      .limit(1);

    if (gameRefs && gameRefs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a player with game history. Remove their games first.' },
        { status: 400 }
      );
    }

    // Delete from reaping_players if any
    await supabase.from('reaping_players').delete().eq('player_id', id);

    // Delete the player
    const { error } = await supabase.from('players').delete().eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
    }

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
