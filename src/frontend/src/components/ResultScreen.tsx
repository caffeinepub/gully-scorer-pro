import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// ============================================================
// RESULT / FINAL SCORECARD SCREEN
// ============================================================
import React, { useState } from "react";
import { recalculateMatch, t } from "../lib/cricket";
import type { MatchState } from "../types";
import ShareModal from "./modals/ShareModal";

interface Props {
  state: MatchState;
  onNewMatch: () => void;
}

export default function ResultScreen({ state, onNewMatch }: Props) {
  const lang = state.language;
  const [showShare, setShowShare] = useState(false);

  const calc1 = recalculateMatch(state.matchHistory, state.settings, 1);
  const calc2 = recalculateMatch(state.matchHistory, state.settings, 2);

  const target = calc1.totalRuns + 1;
  let resultText = "";
  let winnerTeam = "";
  if (calc2.totalRuns >= target) {
    const wicketsLeft = state.settings.playersPerSide - 1 - calc2.wickets;
    resultText = `Won by ${wicketsLeft} wickets`;
    winnerTeam = state.settings.team2Name;
  } else {
    const diff = calc1.totalRuns - calc2.totalRuns;
    if (diff > 0) {
      resultText = `Won by ${diff} runs`;
      winnerTeam = state.settings.team1Name;
    } else {
      resultText = "Match Tied!";
      winnerTeam = "";
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Result banner */}
      <div className="bg-primary text-primary-foreground text-center py-6 px-4">
        <div className="text-4xl mb-2">🏆</div>
        <h1 className="text-3xl font-black">{winnerTeam || "Match Tied"}</h1>
        <p className="text-lg font-bold opacity-90">{resultText}</p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-xs text-muted-foreground font-bold mb-1">
            {state.settings.team1Name}
          </div>
          <div className="text-3xl font-black">
            {calc1.totalRuns}/{calc1.wickets}
          </div>
          <div className="text-xs text-muted-foreground">
            {calc1.oversStr} ov
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-xs text-muted-foreground font-bold mb-1">
            {state.settings.team2Name}
          </div>
          <div className="text-3xl font-black">
            {calc2.totalRuns}/{calc2.wickets}
          </div>
          <div className="text-xs text-muted-foreground">
            {calc2.oversStr} ov
          </div>
        </div>
      </div>

      {/* Scorecard tabs */}
      <div className="px-4">
        <Tabs defaultValue="bat1">
          <TabsList className="w-full grid grid-cols-4 mb-3">
            <TabsTrigger value="bat1" className="text-xs">
              {state.settings.team1Name} Bat
            </TabsTrigger>
            <TabsTrigger value="bowl1" className="text-xs">
              Bowl
            </TabsTrigger>
            <TabsTrigger value="bat2" className="text-xs">
              {state.settings.team2Name} Bat
            </TabsTrigger>
            <TabsTrigger value="bowl2" className="text-xs">
              Bowl
            </TabsTrigger>
          </TabsList>

          {/* Bug 4: Use React.Fragment with explicit key instead of bare fragments */}
          {[1, 2].map((inn) => (
            <React.Fragment key={inn}>
              <TabsContent value={`bat${inn}`}>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-5 gap-1 px-3 py-2 bg-muted text-xs font-bold text-muted-foreground">
                    <span className="col-span-2">{t(lang, "batter")}</span>
                    <span className="text-right">{t(lang, "r")}</span>
                    <span className="text-right">{t(lang, "b")}</span>
                    <span className="text-right">{t(lang, "sr")}</span>
                  </div>
                  {(inn === 1 ? calc1 : calc2).batterStats.map((b) => (
                    <div
                      key={b.index}
                      className="grid grid-cols-5 gap-1 px-3 py-2 border-t border-border text-sm"
                    >
                      <span className="col-span-2 font-medium truncate">
                        {b.name}
                        {b.isOut && (
                          <span className="text-destructive text-xs ml-1">
                            out
                          </span>
                        )}
                      </span>
                      <span className="text-right font-bold">{b.runs}</span>
                      <span className="text-right text-muted-foreground">
                        {b.balls}
                      </span>
                      <span className="text-right text-muted-foreground">
                        {b.strikeRate}
                      </span>
                    </div>
                  ))}
                  <div className="px-3 py-2 border-t border-border text-sm text-muted-foreground">
                    Extras: {(inn === 1 ? calc1 : calc2).extras.total} (W:{" "}
                    {(inn === 1 ? calc1 : calc2).extras.wides}, NB:{" "}
                    {(inn === 1 ? calc1 : calc2).extras.noballs})
                  </div>
                </div>
              </TabsContent>

              <TabsContent value={`bowl${inn}`}>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-5 gap-1 px-3 py-2 bg-muted text-xs font-bold text-muted-foreground">
                    <span className="col-span-2">{t(lang, "bowl")}</span>
                    <span className="text-right">{t(lang, "o")}</span>
                    <span className="text-right">{t(lang, "w")}</span>
                    <span className="text-right">{t(lang, "eco")}</span>
                  </div>
                  {(inn === 1 ? calc1 : calc2).bowlerStats.map((b) => (
                    <div
                      key={b.index}
                      className="grid grid-cols-5 gap-1 px-3 py-2 border-t border-border text-sm"
                    >
                      <span className="col-span-2 font-medium truncate">
                        {b.name}
                      </span>
                      <span className="text-right">
                        {b.overs}.{b.balls % 6}
                      </span>
                      <span className="text-right font-bold text-destructive">
                        {b.wickets}
                      </span>
                      <span className="text-right text-muted-foreground">
                        {b.economy}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </React.Fragment>
          ))}
        </Tabs>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-2">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 h-14 font-bold"
          onClick={() => setShowShare(true)}
          data-ocid="result.share_button"
        >
          📤 {t(lang, "share")}
        </Button>
        <Button
          size="lg"
          className="flex-1 h-14 font-bold"
          onClick={onNewMatch}
          data-ocid="result.new_match_button"
        >
          🏏 {t(lang, "newMatch")}
        </Button>
      </div>

      {showShare && (
        <ShareModal state={state} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
