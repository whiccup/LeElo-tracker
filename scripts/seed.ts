import { createClient } from '@supabase/supabase-js';

// ---- Types ----

interface EloHistoryPoint {
  date: string;
  elo: number;
  gameId: string;
}

interface MockPlayer {
  id: string;
  firstName: string;
  lastName: string;
  elo: number;
  firstGame: string;
  lastGame: string;
  eloHistory: EloHistoryPoint[];
}

interface Game {
  id: string;
  date: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  teamAScore: number;
  teamBScore: number;
  winner: 'A' | 'B';
}

// ---- Mock data ----

const mockPlayers: MockPlayer[] = [
  {
    id: 'jordan-wells', firstName: 'Jordan', lastName: 'Wells', elo: 1687,
    firstGame: '2025-11-05', lastGame: '2026-02-01',
    eloHistory: [
      { date: '2025-11-05', elo: 1500, gameId: 'g1' },
      { date: '2025-11-08', elo: 1524, gameId: 'g2' },
      { date: '2025-11-12', elo: 1548, gameId: 'g3' },
      { date: '2025-11-15', elo: 1535, gameId: 'g4' },
      { date: '2025-11-19', elo: 1561, gameId: 'g5' },
      { date: '2025-11-22', elo: 1578, gameId: 'g6' },
      { date: '2025-11-26', elo: 1555, gameId: 'g7' },
      { date: '2025-11-29', elo: 1580, gameId: 'g8' },
      { date: '2025-12-03', elo: 1602, gameId: 'g9' },
      { date: '2025-12-06', elo: 1589, gameId: 'g10' },
      { date: '2025-12-10', elo: 1614, gameId: 'g11' },
      { date: '2025-12-13', elo: 1632, gameId: 'g12' },
      { date: '2025-12-17', elo: 1618, gameId: 'g13' },
      { date: '2025-12-20', elo: 1640, gameId: 'g14' },
      { date: '2025-12-24', elo: 1628, gameId: 'g15' },
      { date: '2025-12-27', elo: 1647, gameId: 'g16' },
      { date: '2026-01-03', elo: 1635, gameId: 'g17' },
      { date: '2026-01-07', elo: 1651, gameId: 'g18' },
      { date: '2026-01-10', elo: 1669, gameId: 'g19' },
      { date: '2026-01-14', elo: 1702, gameId: 'g20' },
      { date: '2026-01-17', elo: 1688, gameId: 'g21' },
      { date: '2026-01-21', elo: 1675, gameId: 'g22' },
      { date: '2026-01-23', elo: 1643, gameId: 'g23' },
      { date: '2026-01-25', elo: 1628, gameId: 'g24' },
      { date: '2026-01-28', elo: 1647, gameId: 'g25' },
      { date: '2026-01-30', elo: 1669, gameId: 'g26' },
      { date: '2026-02-01', elo: 1687, gameId: 'g27' },
    ],
  },
  {
    id: 'sarah-chen', firstName: 'Sarah', lastName: 'Chen', elo: 1654,
    firstGame: '2025-11-05', lastGame: '2026-02-01',
    eloHistory: [
      { date: '2025-11-05', elo: 1500, gameId: 'g1' },
      { date: '2025-11-12', elo: 1532, gameId: 'g3' },
      { date: '2025-11-22', elo: 1568, gameId: 'g6' },
      { date: '2025-12-03', elo: 1590, gameId: 'g9' },
      { date: '2025-12-13', elo: 1615, gameId: 'g12' },
      { date: '2025-12-24', elo: 1598, gameId: 'g15' },
      { date: '2026-01-07', elo: 1622, gameId: 'g18' },
      { date: '2026-01-17', elo: 1640, gameId: 'g21' },
      { date: '2026-01-28', elo: 1632, gameId: 'g25' },
      { date: '2026-02-01', elo: 1654, gameId: 'g27' },
    ],
  },
  {
    id: 'marcus-brown', firstName: 'Marcus', lastName: 'Brown', elo: 1621,
    firstGame: '2025-11-05', lastGame: '2026-02-01',
    eloHistory: [
      { date: '2025-11-05', elo: 1500, gameId: 'g1' },
      { date: '2025-11-19', elo: 1545, gameId: 'g5' },
      { date: '2025-12-06', elo: 1580, gameId: 'g10' },
      { date: '2025-12-20', elo: 1612, gameId: 'g14' },
      { date: '2026-01-10', elo: 1638, gameId: 'g19' },
      { date: '2026-01-28', elo: 1635, gameId: 'g25' },
      { date: '2026-02-01', elo: 1621, gameId: 'g27' },
    ],
  },
  {
    id: 'alex-rivera', firstName: 'Alex', lastName: 'Rivera', elo: 1598,
    firstGame: '2025-11-08', lastGame: '2026-01-30',
    eloHistory: [
      { date: '2025-11-08', elo: 1500, gameId: 'g2' },
      { date: '2025-11-26', elo: 1535, gameId: 'g7' },
      { date: '2025-12-10', elo: 1560, gameId: 'g11' },
      { date: '2025-12-27', elo: 1575, gameId: 'g16' },
      { date: '2026-01-14', elo: 1590, gameId: 'g20' },
      { date: '2026-01-30', elo: 1598, gameId: 'g26' },
    ],
  },
  {
    id: 'jamie-lee', firstName: 'Jamie', lastName: 'Lee', elo: 1582,
    firstGame: '2025-11-05', lastGame: '2026-01-30',
    eloHistory: [
      { date: '2025-11-05', elo: 1500, gameId: 'g1' },
      { date: '2025-11-22', elo: 1528, gameId: 'g6' },
      { date: '2025-12-06', elo: 1555, gameId: 'g10' },
      { date: '2025-12-24', elo: 1568, gameId: 'g15' },
      { date: '2026-01-14', elo: 1575, gameId: 'g20' },
      { date: '2026-01-30', elo: 1582, gameId: 'g26' },
    ],
  },
  {
    id: 'taylor-nguyen', firstName: 'Taylor', lastName: 'Nguyen', elo: 1556,
    firstGame: '2025-11-08', lastGame: '2026-01-30',
    eloHistory: [
      { date: '2025-11-08', elo: 1500, gameId: 'g2' },
      { date: '2025-12-03', elo: 1540, gameId: 'g9' },
      { date: '2025-12-27', elo: 1565, gameId: 'g16' },
      { date: '2026-01-21', elo: 1572, gameId: 'g22' },
      { date: '2026-01-30', elo: 1556, gameId: 'g26' },
    ],
  },
  {
    id: 'devon-patel', firstName: 'Devon', lastName: 'Patel', elo: 1523,
    firstGame: '2025-11-05', lastGame: '2026-01-28',
    eloHistory: [
      { date: '2025-11-05', elo: 1500, gameId: 'g1' },
      { date: '2025-12-10', elo: 1530, gameId: 'g11' },
      { date: '2026-01-07', elo: 1518, gameId: 'g18' },
      { date: '2026-01-28', elo: 1523, gameId: 'g25' },
    ],
  },
  {
    id: 'morgan-kelly', firstName: 'Morgan', lastName: 'Kelly', elo: 1501,
    firstGame: '2025-11-12', lastGame: '2026-01-28',
    eloHistory: [
      { date: '2025-11-12', elo: 1500, gameId: 'g3' },
      { date: '2025-12-13', elo: 1520, gameId: 'g12' },
      { date: '2026-01-10', elo: 1512, gameId: 'g19' },
      { date: '2026-01-28', elo: 1501, gameId: 'g25' },
    ],
  },
  {
    id: 'casey-johnson', firstName: 'Casey', lastName: 'Johnson', elo: 1478,
    firstGame: '2025-11-08', lastGame: '2026-01-25',
    eloHistory: [
      { date: '2025-11-08', elo: 1500, gameId: 'g2' },
      { date: '2025-12-06', elo: 1485, gameId: 'g10' },
      { date: '2026-01-03', elo: 1470, gameId: 'g17' },
      { date: '2026-01-25', elo: 1478, gameId: 'g24' },
    ],
  },
  {
    id: 'chris-park', firstName: 'Chris', lastName: 'Park', elo: 1289,
    firstGame: '2025-11-05', lastGame: '2026-01-28',
    eloHistory: [
      { date: '2025-11-05', elo: 1500, gameId: 'g1' },
      { date: '2025-11-22', elo: 1465, gameId: 'g6' },
      { date: '2025-12-06', elo: 1420, gameId: 'g10' },
      { date: '2025-12-24', elo: 1380, gameId: 'g15' },
      { date: '2026-01-10', elo: 1335, gameId: 'g19' },
      { date: '2026-01-28', elo: 1289, gameId: 'g25' },
    ],
  },
];

const mockGames: Game[] = [
  { id: 'g27', date: '2026-02-01', teamAPlayers: ['jordan-wells', 'sarah-chen', 'alex-rivera'], teamBPlayers: ['marcus-brown', 'jamie-lee', 'taylor-nguyen'], teamAScore: 21, teamBScore: 17, winner: 'A' },
  { id: 'g26', date: '2026-01-30', teamAPlayers: ['jordan-wells', 'jamie-lee', 'devon-patel'], teamBPlayers: ['sarah-chen', 'taylor-nguyen', 'chris-park'], teamAScore: 21, teamBScore: 14, winner: 'A' },
  { id: 'g25', date: '2026-01-28', teamAPlayers: ['jordan-wells', 'sarah-chen', 'morgan-kelly'], teamBPlayers: ['marcus-brown', 'devon-patel', 'chris-park'], teamAScore: 21, teamBScore: 19, winner: 'A' },
  { id: 'g24', date: '2026-01-25', teamAPlayers: ['marcus-brown', 'casey-johnson', 'taylor-nguyen'], teamBPlayers: ['jordan-wells', 'alex-rivera', 'chris-park'], teamAScore: 21, teamBScore: 18, winner: 'A' },
  { id: 'g23', date: '2026-01-23', teamAPlayers: ['sarah-chen', 'alex-rivera', 'devon-patel'], teamBPlayers: ['jordan-wells', 'jamie-lee', 'morgan-kelly'], teamAScore: 21, teamBScore: 16, winner: 'A' },
  { id: 'g22', date: '2026-01-21', teamAPlayers: ['jordan-wells', 'marcus-brown', 'chris-park'], teamBPlayers: ['taylor-nguyen', 'casey-johnson', 'devon-patel'], teamAScore: 15, teamBScore: 21, winner: 'B' },
  { id: 'g21', date: '2026-01-17', teamAPlayers: ['jordan-wells', 'sarah-chen', 'casey-johnson'], teamBPlayers: ['marcus-brown', 'alex-rivera', 'taylor-nguyen'], teamAScore: 18, teamBScore: 21, winner: 'B' },
  { id: 'g20', date: '2026-01-14', teamAPlayers: ['jordan-wells', 'jamie-lee', 'morgan-kelly'], teamBPlayers: ['alex-rivera', 'devon-patel', 'chris-park'], teamAScore: 21, teamBScore: 12, winner: 'A' },
  { id: 'g19', date: '2026-01-10', teamAPlayers: ['jordan-wells', 'marcus-brown', 'taylor-nguyen'], teamBPlayers: ['sarah-chen', 'morgan-kelly', 'chris-park'], teamAScore: 21, teamBScore: 15, winner: 'A' },
  { id: 'g18', date: '2026-01-07', teamAPlayers: ['jordan-wells', 'sarah-chen', 'devon-patel'], teamBPlayers: ['jamie-lee', 'casey-johnson', 'alex-rivera'], teamAScore: 21, teamBScore: 19, winner: 'A' },
  { id: 'g17', date: '2026-01-03', teamAPlayers: ['marcus-brown', 'taylor-nguyen', 'casey-johnson'], teamBPlayers: ['jordan-wells', 'sarah-chen', 'chris-park'], teamAScore: 21, teamBScore: 16, winner: 'A' },
];

// ---- Seed logic ----

const supabase = createClient(
  'https://rwuicbuqboqykgzzzkog.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dWljYnVxYm9xeWtnenp6a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MzkzNywiZXhwIjoyMDg1NzE5OTM3fQ.DmBnEo9T_Um89YQ4gyeqovehBMG7n6wSWwGmPogYg-8'
);

async function seed() {
  console.log('Seeding players...');
  const { error: playersErr } = await supabase.from('players').insert(
    mockPlayers.map((p) => ({
      id: p.id,
      first_name: p.firstName,
      last_name: p.lastName,
      email: '',
      phone: '',
      venmo_user: '',
      player_notest: '',
      elo: p.elo,
      first_game: p.firstGame,
      last_game: p.lastGame,
      is_unlucky_twice: false,
    }))
  );
  if (playersErr) throw new Error(`Players insert failed: ${playersErr.message}`);
  console.log(`  Inserted ${mockPlayers.length} players`);

  // Collect all game IDs and dates from eloHistory
  const gameDates = new Map<string, string>();
  for (const player of mockPlayers) {
    for (const point of player.eloHistory) {
      gameDates.set(point.gameId, point.date);
    }
  }

  // Insert full games (g17–g27)
  console.log('Seeding games...');
  const { error: gamesErr } = await supabase.from('games').insert(
    mockGames.map((g) => ({
      id: g.id,
      date: g.date,
      team_a_score: g.teamAScore,
      team_b_score: g.teamBScore,
      winner: g.winner,
    }))
  );
  if (gamesErr) throw new Error(`Games insert failed: ${gamesErr.message}`);
  console.log(`  Inserted ${mockGames.length} full games`);

  // Insert stub games for those only in eloHistory (g1–g16)
  const mockGameIds = new Set(mockGames.map((g) => g.id));
  const stubGames = [...gameDates.entries()]
    .filter(([id]) => !mockGameIds.has(id))
    .map(([id, date]) => ({
      id,
      date,
      team_a_score: 0,
      team_b_score: 0,
      winner: 'A',
    }));

  if (stubGames.length > 0) {
    const { error: stubErr } = await supabase.from('games').insert(stubGames);
    if (stubErr) throw new Error(`Stub games insert failed: ${stubErr.message}`);
    console.log(`  Inserted ${stubGames.length} stub games`);
  }

  // Build game_players rows
  console.log('Seeding game_players...');
  const gamePlayerRows: Array<{
    game_id: string;
    player_id: string;
    team: string;
    elo_after: number;
  }> = [];
  const inserted = new Set<string>();

  // For full games (g17–g27), use team data
  for (const game of mockGames) {
    for (const pid of game.teamAPlayers) {
      const player = mockPlayers.find((p) => p.id === pid)!;
      const eloPoint = player.eloHistory.find((e) => e.gameId === game.id);
      const key = `${game.id}:${pid}`;
      if (!inserted.has(key)) {
        gamePlayerRows.push({
          game_id: game.id, player_id: pid, team: 'A',
          elo_after: eloPoint?.elo ?? player.elo,
        });
        inserted.add(key);
      }
    }
    for (const pid of game.teamBPlayers) {
      const player = mockPlayers.find((p) => p.id === pid)!;
      const eloPoint = player.eloHistory.find((e) => e.gameId === game.id);
      const key = `${game.id}:${pid}`;
      if (!inserted.has(key)) {
        gamePlayerRows.push({
          game_id: game.id, player_id: pid, team: 'B',
          elo_after: eloPoint?.elo ?? player.elo,
        });
        inserted.add(key);
      }
    }
  }

  // For stub games, insert from eloHistory with team 'A' as placeholder
  for (const player of mockPlayers) {
    for (const point of player.eloHistory) {
      if (!mockGameIds.has(point.gameId)) {
        const key = `${point.gameId}:${player.id}`;
        if (!inserted.has(key)) {
          gamePlayerRows.push({
            game_id: point.gameId, player_id: player.id,
            team: 'A', elo_after: point.elo,
          });
          inserted.add(key);
        }
      }
    }
  }

  const { error: gpErr } = await supabase.from('game_players').insert(gamePlayerRows);
  if (gpErr) throw new Error(`game_players insert failed: ${gpErr.message}`);
  console.log(`  Inserted ${gamePlayerRows.length} game_player rows`);

  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
