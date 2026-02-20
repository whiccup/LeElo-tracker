import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

function isMissingQueuePositionColumn(message?: string) {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes('queue_position') && (m.includes('column') || m.includes('schema cache'));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, playerIds } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!playerIds || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one player is required' },
        { status: 400 }
      );
    }

    const sessionId = `att-${Date.now()}`;

    const { error: sessionErr } = await supabase
      .from('attendance_sessions')
      .insert({ id: sessionId, date });

    if (sessionErr) {
      console.error('Attendance session insert error:', sessionErr);
      return NextResponse.json(
        { error: 'Failed to create attendance session' },
        { status: 500 }
      );
    }

    const rowsWithQueue = playerIds.map((playerId: string, idx: number) => ({
      session_id: sessionId,
      player_id: playerId,
      queue_position: idx + 1,
    }));

    const { error: queueInsertErr } = await supabase
      .from('attendance_players')
      .insert(rowsWithQueue);

    if (!queueInsertErr) {
      revalidatePath('/attendance');
      return NextResponse.json({ success: true, sessionId }, { status: 201 });
    }

    const rows = playerIds.map((playerId: string) => ({
      session_id: sessionId,
      player_id: playerId,
    }));

    const { error: playersErr } = await supabase
      .from('attendance_players')
      .insert(rows);

    if (playersErr || !isMissingQueuePositionColumn(queueInsertErr.message)) {
      console.error('Attendance players insert error:', playersErr || queueInsertErr);
      return NextResponse.json(
        { error: 'Failed to record attendance players' },
        { status: 500 }
      );
    }

    revalidatePath('/attendance');
    return NextResponse.json({ success: true, sessionId }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: sessions, error: sessionsErr } = await supabase
      .from('attendance_sessions')
      .select('id, date')
      .order('date', { ascending: false });

    if (sessionsErr) {
      console.error('Fetch sessions error:', sessionsErr);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    const { data: records, error: recordsErr } = await supabase
      .from('attendance_players')
      .select('session_id, player_id, queue_position, players(id, first_name, last_name)');

    if (recordsErr) {
      console.error('Fetch attendance records error:', recordsErr);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions, records });
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
    const { sessionId, date, playerIds } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!playerIds || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one player is required' },
        { status: 400 }
      );
    }

    const { error: sessionErr } = await supabase
      .from('attendance_sessions')
      .update({ date })
      .eq('id', sessionId);

    if (sessionErr) {
      console.error('Attendance session update error:', sessionErr);
      return NextResponse.json(
        { error: 'Failed to update attendance session' },
        { status: 500 }
      );
    }

    const { error: deleteErr } = await supabase
      .from('attendance_players')
      .delete()
      .eq('session_id', sessionId);

    if (deleteErr) {
      console.error('Attendance players delete error:', deleteErr);
      return NextResponse.json(
        { error: 'Failed to update attendance players' },
        { status: 500 }
      );
    }

    const rowsWithQueue = playerIds.map((playerId: string, idx: number) => ({
      session_id: sessionId,
      player_id: playerId,
      queue_position: idx + 1,
    }));

    const { error: queueInsertErr } = await supabase
      .from('attendance_players')
      .insert(rowsWithQueue);

    if (!queueInsertErr) {
      revalidatePath('/attendance');
      revalidatePath('/game/new');
      return NextResponse.json({ success: true, sessionId });
    }

    const rows = playerIds.map((playerId: string) => ({
      session_id: sessionId,
      player_id: playerId,
    }));

    const { error: playersErr } = await supabase
      .from('attendance_players')
      .insert(rows);

    if (playersErr || !isMissingQueuePositionColumn(queueInsertErr.message)) {
      console.error('Attendance players update error:', playersErr || queueInsertErr);
      return NextResponse.json(
        { error: 'Failed to update attendance players' },
        { status: 500 }
      );
    }

    revalidatePath('/attendance');
    revalidatePath('/game/new');
    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
