
export enum CellStatus {
  EMPTY = 'empty',
  TEAM_A = 'team_a',
  TEAM_B = 'team_b',
  BOTH = 'both',
  FAIL = 'fail',
  LOCKED_A = 'locked_a',
  LOCKED_B = 'locked_b'
}

export interface CellData {
  id: number;
  keyword: string;
  status: CellStatus;
}

export type Team = 'A' | 'B';

export interface GameState {
  cells: CellData[];
  teamAScore: number;
  teamBScore: number;
  teamABingoCount: number;
  teamBBingoCount: number;
  teamAChanceUsed: boolean;
  teamBChanceUsed: boolean;
  turn: Team;
}
