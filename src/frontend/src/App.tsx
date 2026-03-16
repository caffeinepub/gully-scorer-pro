import { Toaster } from "@/components/ui/sonner";
// ============================================================
// GULLY SCORER PRO — Main App
// ============================================================
import { useCallback, useEffect, useState } from "react";
import InningsBreak from "./components/InningsBreak";
import InstallBanner from "./components/InstallBanner";
import InstallPage from "./components/InstallPage";
import ResultScreen from "./components/ResultScreen";
import ScoringScreen from "./components/ScoringScreen";
import SetupScreen from "./components/SetupScreen";
import ViewOnlyScreen from "./components/ViewOnlyScreen";
import {
  clearMatch,
  defaultMatchState,
  loadMatch,
  saveMatch,
} from "./lib/storage";
import type { MatchState } from "./types";

export default function App() {
  // Check if this is a view-only share link
  const isViewOnly = window.location.hash.startsWith("#match=");
  if (isViewOnly) {
    return (
      <>
        <ViewOnlyScreen />
        <Toaster />
      </>
    );
  }
  return <MainApp />;
}

function MainApp() {
  const [state, setStateRaw] = useState<MatchState>(() => {
    return loadMatch() ?? defaultMatchState();
  });

  // Show install page only on first visit (not in standalone/installed mode)
  const [showInstallPage, setShowInstallPage] = useState(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const hasDismissed = localStorage.getItem("install_page_dismissed");
    return !isStandalone && !hasDismissed;
  });

  const handleEnterApp = () => {
    localStorage.setItem("install_page_dismissed", "1");
    setShowInstallPage(false);
  };

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

  const startInnings2 = () => {
    setState({
      ...state,
      innings: 2,
      phase: "batting",
      matchHistory: state.matchHistory,
      currentBatterIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 0,
      retiredBatters: [],
      settings: {
        ...state.settings,
        // Swap: Team 2 now bats, Team 1 bowls
        players: state.settings.bowlers,
        bowlers: state.settings.players,
        // Preserve canonical arrays for correct scorecard name display
        team1Players: state.settings.team1Players ?? state.settings.players,
        team2Players: state.settings.team2Players ?? state.settings.bowlers,
      },
    });
  };

  // New Match — completely fresh start, goes to setup
  const newMatch = () => {
    clearMatch();
    setState(defaultMatchState());
  };

  // Quick Match — keeps current settings pre-filled, goes to setup screen
  const quickMatch = () => {
    const fresh = defaultMatchState();
    setState({
      ...fresh,
      settings: state.settings,
      language: state.language,
      solarMode: state.solarMode,
      phase: "setup",
    });
  };

  // Rematch — same teams & players, immediately starts batting
  // If innings 2 was played, players/bowlers arrays are swapped — restore them.
  const rematch = () => {
    const fresh = defaultMatchState();
    const team1 = state.settings.team1Players ?? state.settings.players;
    const team2 = state.settings.team2Players ?? state.settings.bowlers;
    // Restore: Team 1 bats first again in innings 1
    const restoredPlayers =
      state.innings === 2 ? team1 : state.settings.players;
    const restoredBowlers =
      state.innings === 2 ? team2 : state.settings.bowlers;
    setState({
      ...fresh,
      settings: {
        ...state.settings,
        players: restoredPlayers,
        bowlers: restoredBowlers,
        team1Players: team1,
        team2Players: team2,
      },
      language: state.language,
      solarMode: state.solarMode,
      phase: "batting",
      innings: 1,
    });
  };

  if (showInstallPage) {
    return <InstallPage onEnter={handleEnterApp} />;
  }

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
        <ScoringScreen
          state={state}
          onChange={setState}
          onNewMatch={newMatch}
          onQuickMatch={quickMatch}
          onRematch={rematch}
        />
      )}

      {state.phase === "innings_break" && (
        <InningsBreak state={state} onStartInnings2={startInnings2} />
      )}

      {state.phase === "result" && (
        <ResultScreen
          state={state}
          onNewMatch={newMatch}
          onQuickMatch={quickMatch}
          onRematch={rematch}
        />
      )}

      <InstallBanner />
      <Toaster />
    </div>
  );
}
