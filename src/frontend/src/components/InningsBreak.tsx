// ============================================================
// INNINGS BREAK SCREEN
// ============================================================
import { Button } from "@/components/ui/button";
import { t } from "../lib/cricket";
import type { MatchState } from "../types";

interface Props {
  state: MatchState;
  onStartInnings2: () => void;
}

export default function InningsBreak({ state, onStartInnings2 }: Props) {
  const lang = state.language;
  const target = (state.team1FinalRuns ?? 0) + 1;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🏏</div>
      <h2 className="text-3xl font-black mb-2">{t(lang, "innings2")}</h2>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm mb-6">
        <div className="text-muted-foreground text-sm mb-1">
          {state.settings.team1Name} scored
        </div>
        <div className="text-5xl font-black text-primary">
          {state.team1FinalRuns}/{state.team1FinalWickets}
        </div>
        <div className="text-muted-foreground text-sm">
          {state.team1FinalOvers} overs
        </div>
        <div className="mt-4 p-3 bg-accent/20 rounded-xl border border-accent">
          <div className="text-accent font-black text-xl">
            {t(lang, "target")}: {target}
          </div>
          <div className="text-sm text-muted-foreground">
            {state.settings.team2Name} needs {target} runs to win
          </div>
        </div>
      </div>
      <Button
        size="lg"
        className="w-full max-w-sm h-16 text-xl font-black"
        onClick={onStartInnings2}
        data-ocid="innings_break.start_button"
      >
        🏏 {t(lang, "startInnings2")}
      </Button>
    </div>
  );
}
