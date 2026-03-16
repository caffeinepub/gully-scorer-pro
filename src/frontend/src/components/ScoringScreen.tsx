import { Button } from "@/components/ui/button";
// ============================================================
// SCORING SCREEN — The main live scoring interface
// ============================================================
import { useCallback, useRef, useState } from "react";
import {
  checkInningsEnd,
  recalculateMatch,
  t,
  uid,
  vibrate,
} from "../lib/cricket";
import type { BallEvent, MatchState } from "../types";
import Timeline from "./Timeline";
import CorrectionModal from "./modals/CorrectionModal";
import RulesModal from "./modals/RulesModal";
import SettingsModal from "./modals/SettingsModal";
import ShareModal from "./modals/ShareModal";
import WicketModal from "./modals/WicketModal";

interface Props {
  state: MatchState;
  onChange: (state: MatchState) => void;
}

type Modal = "rules" | "settings" | "correction" | "wicket" | "share" | null;

export default function ScoringScreen({ state, onChange }: Props) {
  const lang = state.language;
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [correctionBall, setCorrectionBall] = useState<{
    ball: BallEvent;
    index: number;
  } | null>(null);

  // Bug 3: Bowler selection at end of over
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const pendingStateRef = useRef<MatchState | null>(null);

  const calc = recalculateMatch(
    state.matchHistory,
    state.settings,
    state.innings,
  );
  const inningsLabel =
    state.innings === 1
      ? `${state.settings.team1Name} Batting`
      : `${state.settings.team2Name} Batting`;

  // ============================================================
  // addBall — adds a ball to the timeline and recalculates
  // ============================================================
  const addBall = useCallback(
    (partial: Partial<BallEvent>) => {
      const legalBalls = calc.completedOvers * 6 + calc.currentBall;
      const overNum = Math.floor(legalBalls / 6);
      const ballNum = legalBalls % 6;

      const ball: BallEvent = {
        id: uid(),
        over: overNum,
        ball: ballNum,
        runs: 0,
        extras: 0,
        extraType: "none",
        isWicket: false,
        isWallRun: false,
        isNeighborsHouse: false,
        batterIndex: state.currentBatterIndex,
        nonStrikerIndex: state.nonStrikerIndex,
        bowlerIndex: state.currentBowlerIndex,
        inningsSide: state.innings,
        timestamp: Date.now(),
        ...partial,
      };

      const newHistory = [...state.matchHistory, ball];
      let newState: MatchState = { ...state, matchHistory: newHistory };

      if (ball.isWicket) {
        vibrate("wicket");
        const newCalc = recalculateMatch(
          newHistory,
          state.settings,
          state.innings,
        );

        // Bug 1: Check if 2nd innings team reached target on this wicket ball
        const target2 =
          state.innings === 2 && state.team1FinalRuns !== undefined
            ? state.team1FinalRuns + 1
            : null;
        if (target2 !== null && newCalc.totalRuns >= target2) {
          onChange({ ...newState, phase: "result" });
          return;
        }

        const end = checkInningsEnd(newCalc, state.settings);
        if (end) {
          if (state.innings === 1) {
            newState = {
              ...newState,
              phase: "innings_break",
              team1FinalRuns: newCalc.totalRuns,
              team1FinalWickets: newCalc.wickets,
              team1FinalOvers: newCalc.oversStr,
            };
          } else {
            newState = { ...newState, phase: "result" };
          }
          onChange(newState);
          return;
        }
        onChange(newState);
        setActiveModal("wicket");
        return;
      }

      vibrate(ball.runs >= 4 ? "boundary" : "run");

      // Auto-swap strike for odd runs
      if (ball.runs % 2 !== 0 && ball.extraType === "none") {
        newState = {
          ...newState,
          currentBatterIndex: state.nonStrikerIndex,
          nonStrikerIndex: state.currentBatterIndex,
        };
      }

      const newCalc = recalculateMatch(
        newHistory,
        state.settings,
        state.innings,
      );

      // Bug 1: Check if 2nd innings team reached target after this ball
      const target =
        state.innings === 2 && state.team1FinalRuns !== undefined
          ? state.team1FinalRuns + 1
          : null;
      if (target !== null && newCalc.totalRuns >= target) {
        onChange({ ...newState, phase: "result" });
        return;
      }

      const end = checkInningsEnd(newCalc, state.settings);
      if (end) {
        if (state.innings === 1) {
          newState = {
            ...newState,
            phase: "innings_break",
            team1FinalRuns: newCalc.totalRuns,
            team1FinalWickets: newCalc.wickets,
            team1FinalOvers: newCalc.oversStr,
          };
        } else {
          newState = { ...newState, phase: "result" };
        }
        onChange(newState);
        return;
      }

      // End of over: swap strike automatically, then prompt for bowler
      if (
        newCalc.currentBall === 0 &&
        newCalc.completedOvers > calc.completedOvers
      ) {
        newState = {
          ...newState,
          currentBatterIndex: newState.nonStrikerIndex,
          nonStrikerIndex: newState.currentBatterIndex,
        };
        // Bug 3: Show bowler selection modal instead of immediately committing
        pendingStateRef.current = newState;
        setShowBowlerSelect(true);
        return;
      }

      onChange(newState);
    },
    [state, calc, onChange],
  );

  const handleUndo = () => {
    if (state.matchHistory.length === 0) return;
    vibrate("run");
    const newHistory = state.matchHistory.slice(0, -1);
    const lastBall = state.matchHistory[state.matchHistory.length - 1];
    let newState = { ...state, matchHistory: newHistory };
    if (lastBall?.isWicket) {
      newState = {
        ...newState,
        currentBatterIndex: lastBall.batterIndex,
        nonStrikerIndex: lastBall.nonStrikerIndex,
      };
    }
    onChange(newState);
  };

  const handleSwap = () => {
    vibrate("run");
    onChange({
      ...state,
      currentBatterIndex: state.nonStrikerIndex,
      nonStrikerIndex: state.currentBatterIndex,
    });
  };

  const editBatterName = (index: number) => {
    const current = state.settings.players[index];
    const newName = window.prompt(t(lang, "editName"), current);
    if (!newName || newName === current) return;
    const players = [...state.settings.players];
    players[index] = newName;
    onChange({ ...state, settings: { ...state.settings, players } });
  };

  const editBowlerName = (index: number) => {
    const current = state.settings.bowlers[index];
    const newName = window.prompt(t(lang, "editName"), current);
    if (!newName || newName === current) return;
    const bowlers = [...state.settings.bowlers];
    bowlers[index] = newName;
    onChange({ ...state, settings: { ...state.settings, bowlers } });
  };

  const editBowler = () => {
    const list = state.settings.bowlers
      .map((n, i) => `${i + 1}. ${n}`)
      .join("\n");
    const idx = window.prompt(
      `Select bowler (1-${state.settings.playersPerSide}):\n${list}`,
    );
    if (!idx) return;
    const i = Number.parseInt(idx) - 1;
    if (i >= 0 && i < state.settings.playersPerSide) {
      onChange({ ...state, currentBowlerIndex: i });
    }
  };

  const handleWicketSelect = (nextIndex: number) => {
    setActiveModal(null);
    if (nextIndex === -1) {
      const newCalc = recalculateMatch(
        state.matchHistory,
        state.settings,
        state.innings,
      );
      if (state.innings === 1) {
        onChange({
          ...state,
          phase: "innings_break",
          team1FinalRuns: newCalc.totalRuns,
          team1FinalWickets: newCalc.wickets,
          team1FinalOvers: newCalc.oversStr,
        });
      } else {
        onChange({ ...state, phase: "result" });
      }
      return;
    }
    onChange({ ...state, currentBatterIndex: nextIndex });
  };

  const strikerStats = calc.batterStats.find(
    (b) => b.index === state.currentBatterIndex,
  );
  const nonStrikerStats = calc.batterStats.find(
    (b) => b.index === state.nonStrikerIndex,
  );
  const bowlerStats = calc.bowlerStats.find(
    (b) => b.index === state.currentBowlerIndex,
  );

  const target =
    state.innings === 2 && state.team1FinalRuns !== undefined
      ? state.team1FinalRuns + 1
      : null;
  const runsNeeded = target ? target - calc.totalRuns : null;

  // Build bowler list with stable keys (position-based label)
  const bowlerListItems = state.settings.bowlers
    .slice(0, state.settings.playersPerSide)
    .map((name, i) => ({ name, i, key: `bowler-slot-${i}` }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-border">
        <div>
          <div className="font-black text-xs text-muted-foreground uppercase tracking-wide">
            {state.innings === 1 ? t(lang, "innings1") : t(lang, "innings2")} —{" "}
            {inningsLabel}
          </div>
          {target && (
            <div className="text-xs text-accent font-bold">
              {t(lang, "target")}: {target} ({runsNeeded} needed)
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-lg"
            onClick={() => onChange({ ...state, solarMode: !state.solarMode })}
            data-ocid="scoring.solar_toggle"
          >
            ☀️
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs font-bold"
            onClick={() =>
              onChange({ ...state, language: lang === "en" ? "hi" : "en" })
            }
            data-ocid="scoring.language_toggle"
          >
            {lang === "en" ? "हि" : "EN"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-lg"
            onClick={() => setActiveModal("settings")}
            data-ocid="scoring.settings_button"
          >
            ⚙️
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-lg"
            onClick={() => setActiveModal("share")}
          >
            📤
          </Button>
        </div>
      </div>

      {/* BIG SCORE */}
      <div className="text-center py-3 px-4">
        <div className="score-display text-7xl text-foreground">
          {calc.totalRuns}
          <span className="text-muted-foreground text-4xl">
            /{calc.wickets}
          </span>
        </div>
        <div className="text-muted-foreground text-sm font-bold mt-1">
          {calc.oversStr} / {state.settings.maxOvers} {t(lang, "overs")}
          {calc.extras.total > 0 && (
            <span className="ml-2 text-accent">
              • Extras: {calc.extras.total}
            </span>
          )}
        </div>
      </div>

      {/* BATTERS */}
      <div className="px-3 grid grid-cols-2 gap-2 mb-2">
        <div
          className="bg-card rounded-xl p-3 border border-primary/40"
          data-ocid="scoring.striker_card"
        >
          <div className="text-xs text-primary font-bold uppercase mb-1">
            {t(lang, "striker")}
          </div>
          <button
            type="button"
            className="player-name-btn font-black text-sm truncate block w-full text-left"
            onClick={() => editBatterName(state.currentBatterIndex)}
          >
            {state.settings.players[state.currentBatterIndex]}
          </button>
          <div className="text-xl font-black mt-1">
            {strikerStats?.runs ?? 0}
            <span className="text-xs text-muted-foreground ml-1">
              ({strikerStats?.balls ?? 0}b)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            4s: {strikerStats?.fours ?? 0} | 6s: {strikerStats?.sixes ?? 0}
          </div>
        </div>
        <div
          className="bg-card rounded-xl p-3 border border-border"
          data-ocid="scoring.nonstriker_card"
        >
          <div className="text-xs text-muted-foreground font-bold uppercase mb-1">
            {t(lang, "nonStriker")}
          </div>
          <button
            type="button"
            className="player-name-btn font-black text-sm truncate block w-full text-left"
            onClick={() => editBatterName(state.nonStrikerIndex)}
          >
            {state.settings.players[state.nonStrikerIndex]}
          </button>
          <div className="text-xl font-black mt-1">
            {nonStrikerStats?.runs ?? 0}
            <span className="text-xs text-muted-foreground ml-1">
              ({nonStrikerStats?.balls ?? 0}b)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            4s: {nonStrikerStats?.fours ?? 0} | 6s:{" "}
            {nonStrikerStats?.sixes ?? 0}
          </div>
        </div>
      </div>

      {/* BOWLER */}
      <div className="px-3 mb-2">
        <div
          className="bg-card rounded-xl p-3 border border-border flex items-center justify-between"
          data-ocid="scoring.bowler_card"
        >
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase">
              {t(lang, "bowler")}
            </div>
            <button
              type="button"
              className="player-name-btn font-bold text-sm"
              onClick={() => editBowlerName(state.currentBowlerIndex)}
            >
              {state.settings.bowlers[state.currentBowlerIndex]}
            </button>
          </div>
          <div className="text-right">
            <div className="font-black">
              {Math.floor((bowlerStats?.balls ?? 0) / 6)}.
              {(bowlerStats?.balls ?? 0) % 6} ov
            </div>
            <div className="text-xs text-muted-foreground">
              {bowlerStats?.runs ?? 0}r | {bowlerStats?.wickets ?? 0}w
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-2 text-xs"
            onClick={editBowler}
          >
            Change
          </Button>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="px-3 mb-2">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="text-xs text-muted-foreground font-bold px-3 pt-2">
            Last 10 Balls
          </div>
          <Timeline
            history={state.matchHistory}
            inningsSide={state.innings}
            onBallClick={(ball, index) => {
              setCorrectionBall({ ball, index });
              setActiveModal("correction");
            }}
          />
        </div>
      </div>

      <div className="h-36" />

      {/* THUMB ZONE */}
      <div className="thumb-zone">
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {[0, 1, 2, 3].map((r) => (
            <button
              type="button"
              key={r}
              className="score-btn bg-secondary rounded-xl border border-border"
              onClick={() => addBall({ runs: r })}
              data-ocid={`scoring.btn_${r}`}
            >
              {r}
            </button>
          ))}
          <button
            type="button"
            className="score-btn score-btn-four rounded-xl border-0"
            onClick={() => addBall({ runs: 4 })}
            data-ocid="scoring.btn_4"
          >
            4
          </button>
          <button
            type="button"
            className="score-btn score-btn-six rounded-xl border-0"
            onClick={() => addBall({ runs: 6 })}
            data-ocid="scoring.btn_6"
          >
            6
          </button>
          <button
            type="button"
            className="score-btn score-btn-out rounded-xl border-0"
            onClick={() => addBall({ runs: 0, isWicket: true })}
            data-ocid="scoring.btn_out"
          >
            {t(lang, "out")}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            className="h-10 rounded-lg bg-muted border border-border font-bold text-xs active:scale-95 transition-transform"
            onClick={() =>
              addBall({
                extraType: "wide",
                extras: state.settings.wideRuns,
                runs: 0,
              })
            }
            data-ocid="scoring.btn_wide"
          >
            {t(lang, "wide")}
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-muted border border-border font-bold text-xs active:scale-95 transition-transform"
            onClick={() =>
              addBall({
                extraType: "noball",
                extras: state.settings.noballRuns,
                runs: 0,
              })
            }
            data-ocid="scoring.btn_noball"
          >
            {t(lang, "noball")}
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-muted border border-border font-bold text-xs active:scale-95 transition-transform"
            onClick={handleUndo}
            data-ocid="scoring.btn_undo"
          >
            ↩ {t(lang, "undo")}
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-muted border border-border font-bold text-xs active:scale-95 transition-transform"
            onClick={handleSwap}
            data-ocid="scoring.btn_swap"
          >
            ⇄ {t(lang, "swap")}
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-accent/20 border border-accent font-bold text-xs text-accent active:scale-95 transition-transform"
            onClick={() => setActiveModal("rules")}
            data-ocid="scoring.btn_rules"
          >
            ⚡ {t(lang, "rules")}
          </button>
        </div>
      </div>

      {/* MODALS */}
      {activeModal === "rules" && (
        <RulesModal
          lang={lang}
          onWallRun={() => {
            addBall({ runs: 1, isWallRun: true });
            setActiveModal(null);
          }}
          onNeighborsHouse={() => {
            addBall({ runs: 0, isWicket: true, isNeighborsHouse: true });
            setActiveModal(null);
          }}
          onDeadBall={() => {
            addBall({ extraType: "dead", runs: 0, extras: 0 });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "settings" && (
        <SettingsModal
          lang={lang}
          settings={state.settings}
          onSave={(s) => {
            onChange({ ...state, settings: s });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "correction" && correctionBall && (
        <CorrectionModal
          ball={correctionBall.ball}
          ballIndex={correctionBall.index}
          lang={lang}
          onSave={(editedBall, idx) => {
            const newHistory = [...state.matchHistory];
            newHistory[idx] = editedBall;
            onChange({ ...state, matchHistory: newHistory });
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "wicket" && (
        <WicketModal
          state={state}
          onSelect={handleWicketSelect}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "share" && (
        <ShareModal state={state} onClose={() => setActiveModal(null)} />
      )}

      {/* Bug 3: Bowler selection modal at end of over */}
      {showBowlerSelect && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end"
          data-ocid="bowler_select.modal"
        >
          <div className="bg-card rounded-t-2xl p-4 pb-8 max-h-[70vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="text-2xl mb-1">🎳</div>
              <h2 className="font-black text-lg">End of Over</h2>
              <p className="text-sm text-muted-foreground">
                {t(lang, "selectBowler")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {bowlerListItems.map(({ name, i, key }) => (
                <button
                  key={key}
                  type="button"
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-left font-bold text-sm active:scale-95 transition-transform flex items-center justify-between"
                  onClick={() => {
                    const pending = pendingStateRef.current;
                    if (!pending) return;
                    const finalState: MatchState = {
                      ...pending,
                      currentBowlerIndex: i,
                    };
                    pendingStateRef.current = null;
                    setShowBowlerSelect(false);
                    onChange(finalState);
                  }}
                  data-ocid="bowler_select.confirm_button"
                >
                  <span>{name}</span>
                  {i === state.currentBowlerIndex && (
                    <span className="text-xs text-muted-foreground">
                      (current)
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-border bg-muted p-3 font-bold text-sm text-muted-foreground active:scale-95 transition-transform"
              onClick={() => {
                const pending = pendingStateRef.current;
                if (!pending) return;
                pendingStateRef.current = null;
                setShowBowlerSelect(false);
                onChange(pending);
              }}
              data-ocid="bowler_select.cancel_button"
            >
              Skip (Keep Current Bowler)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
