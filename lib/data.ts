import { Player, Game, PlayerGameStats } from '@/types';
import { mockPlayers, mockGames, playerNames } from './mockData';

export async function getPlayers(): Promise<Player[]> {
  return mockPlayers;
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const player = mockPlayers.find((p) => p.id === id);
  return player || null;
}

export async function getPlayerGameHistory(
  playerId: string
): Promise<PlayerGameStats[]> {
  const player = mockPlayers.find((p) => p.id === playerId);
  if (!player) return [];

  // Build a map from gameId -> elo from eloHistory
  const eloMap = new Map<string, number>();
  player.eloHistory.forEach((point) => {
    eloMap.set(point.gameId, point.elo);
  });

  // Build previous elo map for calculating change
  const prevEloMap = new Map<string, number>();
  for (let i = 0; i < player.eloHistory.length; i++) {
    const gameId = player.eloHistory[i].gameId;
    const prevElo =
      i === 0 ? 1500 : player.eloHistory[i - 1].elo;
    prevEloMap.set(gameId, prevElo);
  }

  const playerGames = mockGames
    .filter(
      (game) =>
        game.teamAPlayers.includes(playerId) ||
        game.teamBPlayers.includes(playerId)
    )
    .map((game) => {
      const isTeamA = game.teamAPlayers.includes(playerId);
      const result: 'W' | 'L' =
        (isTeamA && game.winner === 'A') ||
        (!isTeamA && game.winner === 'B')
          ? 'W'
          : 'L';

      const eloAfter = eloMap.get(game.id) ?? 0;
      const prevElo = prevEloMap.get(game.id) ?? 0;
      const eloChange = eloAfter && prevElo ? eloAfter - prevElo : 0;

      const teammates = isTeamA
        ? game.teamAPlayers.filter((id) => id !== playerId)
        : game.teamBPlayers.filter((id) => id !== playerId);
      const opponents = isTeamA ? game.teamBPlayers : game.teamAPlayers;

      return {
        gameId: game.id,
        date: game.date,
        teammates: teammates.map((id) => playerNames[id] || id),
        opponents: opponents.map((id) => playerNames[id] || id),
        result,
        teamScore: isTeamA ? game.teamAScore : game.teamBScore,
        opponentScore: isTeamA ? game.teamBScore : game.teamAScore,
        eloChange,
        eloAfter,
      } as PlayerGameStats;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return playerGames;
}

export async function getAllGames(): Promise<Game[]> {
  return mockGames;
}
