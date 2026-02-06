export interface EloHistoryPoint {
  date: string;
  elo: number;
  gameId: string;
}

export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  elo: number;
  gamesPlayed: number;
  winPercentage: number;
  streak: number; // positive = win streak, negative = loss streak
  lastPlayed: string; // ISO date
  eloHistory: EloHistoryPoint[];
}

export interface Game {
  id: string;
  date: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  teamAScore: number;
  teamBScore: number;
  winner: 'A' | 'B';
}

export interface PlayerGameStats {
  gameId: string;
  date: string;
  teammates: string[];
  opponents: string[];
  result: 'W' | 'L';
  teamScore: number;
  opponentScore: number;
  eloChange: number;
  eloAfter: number;
}

export type SortKey =
  | 'rank'
  | 'name'
  | 'wins'
  | 'losses'
  | 'elo'
  | 'streak'
  | 'gamesPlayed'
  | 'winPercentage'
  | 'lastPlayed';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export type GameSortKey = 'date' | 'result' | 'eloChange' | 'eloAfter';

export interface GameSortConfig {
  key: GameSortKey;
  direction: SortDirection;
}

export type AllGamesSortKey = 'date' | 'teamA' | 'score' | 'teamB' | 'winner';

export interface AllGamesSortConfig {
  key: AllGamesSortKey;
  direction: SortDirection;
}

export interface ReapingEvent {
  id: string;
  date: string;
}

export interface ReapingPlayer {
  reapingId: string;
  playerId: string;
  excluded: boolean;
}
