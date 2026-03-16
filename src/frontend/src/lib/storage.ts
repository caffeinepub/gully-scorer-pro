// ============================================================
// GULLY SCORER PRO — LocalStorage Helpers
// All match data is stored here — fully offline
// ============================================================

import type { MatchState } from "../types";

const STORAGE_KEY = "gully_scorer_pro_v1";

/** Save the entire match state to localStorage */
export function saveMatch(state: MatchState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save match:", e);
  }
}

/** Load match state from localStorage */
export function loadMatch(): MatchState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MatchState;
  } catch (e) {
    console.warn("Failed to load match:", e);
    return null;
  }
}

/** Clear saved match */
export function clearMatch(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Default match state for a new game */
export function defaultMatchState(): MatchState {
  return {
    settings: {
      team1Name: "Team A",
      team2Name: "Team B",
      players: Array.from({ length: 11 }, (_, i) => `Player ${i + 1}`),
      bowlers: Array.from({ length: 11 }, (_, i) => `Bowler ${i + 1}`),
      maxOvers: 10,
      playersPerSide: 11,
      wideRuns: 1,
      noballRuns: 1,
      lastManStands: true,
    },
    matchHistory: [],
    currentBatterIndex: 0,
    nonStrikerIndex: 1,
    currentBowlerIndex: 0,
    innings: 1,
    phase: "setup",
    language: "en",
    solarMode: false,
    retiredBatters: [],
  };
}
