// ============================================================
// VIEW ONLY SCREEN — Read-only match score viewer
// Shown when URL has #match=<base64encoded JSON>
// ============================================================
import { useState } from "react";
import { decodeMatchState, recalculateMatch } from "../lib/cricket";
import type { MatchState } from "../types";

function decodeMatchFromHash(): MatchState | null {
  try {
    const hash = window.location.hash;
    if (!hash.startsWith("#match=")) return null;
    const encoded = hash.slice(7);
    return decodeMatchState(encoded) as MatchState | null;
  } catch {
    return null;
  }
}

export default function ViewOnlyScreen() {
  const [matchState] = useState<MatchState | null>(() => decodeMatchFromHash());

  const appUrl =
    window.location.origin + window.location.pathname.replace(/\/$/, "");

  if (!matchState) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-4xl">🏏</div>
        <h1 className="font-black text-xl text-center">Invalid Match Link</h1>
        <p className="text-sm text-muted-foreground text-center">
          This link does not contain valid match data.
        </p>
        <a
          href={appUrl}
          className="mt-4 rounded-xl bg-green-600 text-white font-bold px-6 py-3 text-sm active:scale-95 transition-transform"
          data-ocid="view_only.primary_button"
        >
          Open Gully Scorer Pro
        </a>
      </div>
    );
  }

  const state = matchState;
  const calc1 = recalculateMatch(state.matchHistory, state.settings, 1);
  const calc2 = recalculateMatch(state.matchHistory, state.settings, 2);
  const calc = recalculateMatch(
    state.matchHistory,
    state.settings,
    state.innings,
  );

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

  // Last 10 balls
  const inningsBalls = state.matchHistory.filter(
    (b) => b.inningsSide === state.innings,
  );
  const last10 = inningsBalls.slice(-10);

  const getBallColor = (b: (typeof last10)[0]) => {
    if (b.isWicket) return "bg-red-600 text-white";
    if (b.runs === 6) return "bg-purple-600 text-white";
    if (b.runs === 4) return "bg-blue-600 text-white";
    if (b.extraType === "wide" || b.extraType === "noball")
      return "bg-yellow-500 text-black";
    if (b.runs === 0) return "bg-muted text-muted-foreground";
    return "bg-secondary text-foreground";
  };

  const getBallLabel = (b: (typeof last10)[0]) => {
    if (b.isWicket) return "W";
    if (b.extraType === "wide") return `Wd+${b.extras}`;
    if (b.extraType === "noball") return `Nb+${b.extras}`;
    if (b.extraType === "dead") return "Db";
    return String(b.runs);
  };

  const isResult = state.phase === "result";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* TOP BANNER — snapshot notice, no misleading auto-refresh */}
      <div
        className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-3 flex items-center justify-between"
        data-ocid="view_only.panel"
      >
        <div>
          <div className="font-black text-amber-400 text-sm">
            👁 View Only — Snapshot
          </div>
          <div className="text-xs text-muted-foreground">
            Ask the scorer to reshare for latest score
          </div>
        </div>
        <a
          href={appUrl}
          className="rounded-xl bg-green-600/80 text-white font-bold text-xs px-3 py-2 active:scale-95 transition-transform"
          data-ocid="view_only.secondary_button"
        >
          Score yours 🏏
        </a>
      </div>

      {/* MATCH RESULT BANNER */}
      {isResult && (
        <div className="bg-green-600/20 border-b border-green-500/30 px-4 py-4 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="font-black text-xl text-green-400">
            Match Completed!
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {state.settings.team1Name} vs {state.settings.team2Name}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Innings Scores */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-3">
            🏏 Match Score
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">
                {state.settings.team1Name}
              </span>
              <span className="font-black text-base">
                {calc1.totalRuns}/{calc1.wickets}
                <span className="text-xs text-muted-foreground ml-1 font-normal">
                  ({calc1.oversStr} ov)
                </span>
              </span>
            </div>
            {state.innings === 2 && (
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {state.settings.team2Name}
                </span>
                <span className="font-black text-base">
                  {calc2.totalRuns}/{calc2.wickets}
                  <span className="text-xs text-muted-foreground ml-1 font-normal">
                    ({calc2.oversStr} ov)
                  </span>
                </span>
              </div>
            )}
          </div>
          {target && runsNeeded !== null && !isResult && (
            <div className="mt-3 bg-accent/10 rounded-xl px-3 py-2 text-xs font-bold text-accent">
              {state.settings.team2Name} needs {runsNeeded} more run
              {runsNeeded !== 1 ? "s" : ""} to win
            </div>
          )}
        </div>

        {/* Current Innings */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
              {state.innings === 1 ? "1st" : "2nd"} Innings —{" "}
              {state.innings === 1
                ? state.settings.team1Name
                : state.settings.team2Name}
            </div>
          </div>

          {/* Big score */}
          <div className="text-center py-2">
            <div className="text-6xl font-black">
              {calc.totalRuns}
              <span className="text-muted-foreground text-3xl">
                /{calc.wickets}
              </span>
            </div>
            <div className="text-muted-foreground text-sm mt-1">
              {calc.oversStr} / {state.settings.maxOvers} overs
            </div>
          </div>

          {/* Batters */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-secondary rounded-xl p-3 border border-primary/30">
              <div className="text-xs text-primary font-bold mb-1">
                ⚔️ {state.settings.players[state.currentBatterIndex]} *
              </div>
              <div className="font-black text-base">
                {strikerStats?.runs ?? 0}
                <span className="text-xs text-muted-foreground ml-1 font-normal">
                  ({strikerStats?.balls ?? 0}b)
                </span>
              </div>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <div className="text-xs text-muted-foreground font-bold mb-1">
                🏏 {state.settings.players[state.nonStrikerIndex]}
              </div>
              <div className="font-black text-base">
                {nonStrikerStats?.runs ?? 0}
                <span className="text-xs text-muted-foreground ml-1 font-normal">
                  ({nonStrikerStats?.balls ?? 0}b)
                </span>
              </div>
            </div>
          </div>

          {/* Bowler */}
          <div className="bg-secondary rounded-xl p-3 mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-bold">
                🎳 Bowling
              </div>
              <div className="font-bold text-sm">
                {state.settings.bowlers[state.currentBowlerIndex]}
              </div>
            </div>
            <div className="text-right">
              <div className="font-black">
                {Math.floor((bowlerStats?.balls ?? 0) / 6)}.
                {(bowlerStats?.balls ?? 0) % 6} ov
              </div>
              <div className="text-xs text-muted-foreground">
                {bowlerStats?.runs ?? 0}r / {bowlerStats?.wickets ?? 0}w
              </div>
            </div>
          </div>
        </div>

        {/* Last 10 Balls Timeline */}
        {last10.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-3">
              Last {last10.length} Balls
            </div>
            <div className="flex flex-wrap gap-2">
              {last10.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-lg px-2 py-1.5 text-xs font-black min-w-[32px] text-center ${getBallColor(b)}`}
                >
                  {getBallLabel(b)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Install App CTA */}
        <div className="bg-green-600/10 border border-green-600/30 rounded-2xl p-4 flex flex-col items-center gap-3">
          <div className="text-center">
            <div className="text-xl mb-1">📲</div>
            <div className="font-black text-sm">Score your own matches!</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Install Gully Scorer Pro — free, offline, one tap
            </div>
          </div>
          <a
            href={appUrl}
            className="w-full rounded-xl bg-green-600 text-white font-black text-sm py-3 text-center active:scale-95 transition-transform"
            data-ocid="view_only.primary_button"
          >
            Install App — It&apos;s Free
          </a>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-6">
          Made with ❤️ by vimal for cricket lovers
        </div>
      </div>
    </div>
  );
}
