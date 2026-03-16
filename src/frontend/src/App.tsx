import { Toaster } from "@/components/ui/sonner";
// ============================================================
// GULLY SCORER PRO — Main App
// ============================================================
import { useCallback, useEffect, useState } from "react";
import InningsBreak from "./components/InningsBreak";
import ResultScreen from "./components/ResultScreen";
import ScoringScreen from "./components/ScoringScreen";
import SetupScreen from "./components/SetupScreen";
import {
  clearMatch,
  defaultMatchState,
  loadMatch,
  saveMatch,
} from "./lib/storage";
import type { MatchState } from "./types";

export default function App() {
  const [state, setStateRaw] = useState<MatchState>(() => {
    // Try to restore a saved match on page load
    return loadMatch() ?? defaultMatchState();
  });

  // Persist every state change to localStorage
  const setState = useCallback((newState: MatchState) => {
    setStateRaw(newState);
    saveMatch(newState);
  }, []);

  // Apply solar mode class to root element
  useEffect(() => {
    const root = document.documentElement;
    if (state.solarMode) {
      root.classList.add("solar-mode");
    } else {
      root.classList.remove("solar-mode");
    }
  }, [state.solarMode]);

  // ============================================================
  // Start 2nd innings
  // ============================================================
  const startInnings2 = () => {
    setState({
      ...state,
      innings: 2,
      phase: "batting",
      matchHistory: state.matchHistory, // keep 1st innings history!
      currentBatterIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 0,
      retiredBatters: [],
      // Swap teams: team2 bats, team1 bowls
      settings: {
        ...state.settings,
        players: state.settings.bowlers, // team2 now bats
        bowlers: state.settings.players, // team1 now bowls
      },
    });
  };

  // ============================================================
  // New match
  // ============================================================
  const newMatch = () => {
    clearMatch();
    setState(defaultMatchState());
  };

  // ============================================================
  // Render the correct screen
  // ============================================================
  return (
    <div className={state.solarMode ? "solar-mode" : ""}>
      {state.phase === "setup" && (
        <SetupScreen
          state={state}
          onStart={(newState) =>
            setState({
              ...newState,
              phase: newState.phase === "setup" ? "setup" : "batting",
            })
          }
        />
      )}

      {state.phase === "batting" && (
        <ScoringScreen state={state} onChange={setState} />
      )}

      {state.phase === "innings_break" && (
        <InningsBreak state={state} onStartInnings2={startInnings2} />
      )}

      {state.phase === "result" && (
        <ResultScreen state={state} onNewMatch={newMatch} />
      )}

      <Toaster />
    </div>
  );
}
