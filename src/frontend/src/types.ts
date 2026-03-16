// ============================================================
// GULLY SCORER PRO — TypeScript Types
// ============================================================

/** A single ball event stored in the timeline */
export interface BallEvent {
  id: string; // unique identifier
  over: number; // which over (0-indexed)
  ball: number; // ball number within over (0-indexed)
  runs: number; // runs scored off the bat (0,1,2,3,4,6)
  extras: number; // extra runs (wide/noball value from settings)
  extraType: "none" | "wide" | "noball" | "dead"; // type of extra
  isWicket: boolean; // did the batter get out?
  isWallRun: boolean; // gully rule: hit the wall = +1
  isNeighborsHouse: boolean; // gully rule: hit into neighbor's = OUT
  batterIndex: number; // which batter (index in settings.players)
  nonStrikerIndex: number; // non-striker index
  bowlerIndex: number; // which bowler (index in settings.bowlers)
  inningsSide: number; // 1 or 2
  timestamp: number; // Date.now()
}

/** Match configuration — editable at any time */
export interface MatchSettings {
  team1Name: string;
  team2Name: string;
  players: string[]; // batting team player names (up to playersPerSide)
  bowlers: string[]; // bowling team player names
  maxOvers: number; // e.g., 10
  playersPerSide: number; // default 11
  wideRuns: number; // runs for a wide (default 1)
  noballRuns: number; // runs for a no-ball (default 1)
  lastManStands: boolean; // allow 10th batter to bat alone
}

/** Derived stats for a single batter */
export interface BatterStats {
  index: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  strikeRate: number;
}

/** Derived stats for a single bowler */
export interface BowlerStats {
  index: number;
  name: string;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
  economy: number;
}

/** Result of recalculateMatch() */
export interface MatchCalc {
  totalRuns: number;
  wickets: number;
  completedOvers: number;
  currentBall: number;
  oversStr: string; // e.g., "4.3"
  batterStats: BatterStats[];
  bowlerStats: BowlerStats[];
  extras: { wides: number; noballs: number; dead: number; total: number };
}

/** Full match state persisted to localStorage */
export interface MatchState {
  settings: MatchSettings;
  matchHistory: BallEvent[]; // THE timeline — source of truth
  currentBatterIndex: number; // striker index
  nonStrikerIndex: number;
  currentBowlerIndex: number;
  innings: 1 | 2;
  phase: "setup" | "batting" | "innings_break" | "result";
  language: "en" | "hi";
  solarMode: boolean;
  team1FinalRuns?: number;
  team1FinalWickets?: number;
  team1FinalOvers?: string;
  retiredBatters: number[]; // indices of dismissed batters
}

/** Language keys for i18n */
export type LangKey =
  | "appName"
  | "runs"
  | "wickets"
  | "overs"
  | "striker"
  | "nonStriker"
  | "bowler"
  | "undo"
  | "swap"
  | "rules"
  | "wide"
  | "noball"
  | "out"
  | "wallRuns"
  | "neighborsHouse"
  | "deadBall"
  | "settings"
  | "share"
  | "lastManStands"
  | "newMatch"
  | "target"
  | "won"
  | "startMatch"
  | "innings1"
  | "innings2"
  | "editName"
  | "extras"
  | "scorecard"
  | "topBatter"
  | "topBowler"
  | "correction"
  | "save"
  | "cancel"
  | "selectBatter"
  | "nextBatter"
  | "startInnings2"
  | "matchResult"
  | "selectBowler";
