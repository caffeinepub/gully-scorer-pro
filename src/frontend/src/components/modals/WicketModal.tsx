// ============================================================
// WICKET MODAL
// Select the next batter when a wicket falls
// ============================================================
import { Button } from "@/components/ui/button";
import { recalculateMatch, t } from "../../lib/cricket";
import type { MatchState } from "../../types";

interface Props {
  state: MatchState;
  onSelect: (batterIndex: number) => void;
  onClose: () => void;
}

export default function WicketModal({ state, onSelect, onClose }: Props) {
  const lang = state.language;
  const calc = recalculateMatch(
    state.matchHistory,
    state.settings,
    state.innings,
  );

  const outIndices = new Set(
    calc.batterStats.filter((b) => b.isOut).map((b) => b.index),
  );
  const onField = new Set([state.currentBatterIndex, state.nonStrikerIndex]);
  const available = Array.from(
    { length: state.settings.playersPerSide },
    (_, i) => i,
  ).filter((i) => !outIndices.has(i) && !onField.has(i));

  // Show "last man" banner when only 1 batter is available
  const isLastMan = available.length === 1 && state.settings.lastManStands;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      data-ocid="wicket.modal"
    >
      <div className="bg-card rounded-t-2xl w-full max-w-lg p-5 pb-8 fade-up">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black">🏏 {t(lang, "selectBatter")}</h2>
          <div className="flex items-center gap-2">
            <span className="text-4xl">💥</span>
            {/* Close / Undo button — dismisses modal without selecting a batter */}
            <button
              type="button"
              className="h-9 w-9 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
              onClick={onClose}
              title="Undo / Cancel"
              data-ocid="wicket.close_button"
            >
              ✕
            </button>
          </div>
        </div>
        {isLastMan && (
          <div className="bg-accent/20 border border-accent rounded-lg p-3 mb-4 text-sm font-bold">
            ⚡ {t(lang, "lastManStands")} — Last batter can continue alone!
          </div>
        )}
        {calc.wickets >= state.settings.playersPerSide - 1 ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-3">💀</div>
            <p className="font-bold text-xl">All Out!</p>
            <Button className="mt-4 w-full" onClick={() => onSelect(-1)}>
              End Innings
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {available.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-6xl mb-3">💀</div>
                <p className="font-bold text-xl">All Out!</p>
                <Button className="mt-4 w-full" onClick={() => onSelect(-1)}>
                  End Innings
                </Button>
              </div>
            ) : (
              available.map((playerIdx, listIdx) => (
                <button
                  type="button"
                  key={playerIdx}
                  className="w-full h-14 bg-muted rounded-xl font-bold text-left px-4 flex items-center gap-3 active:scale-95 transition-transform border border-border hover:border-primary"
                  onClick={() => onSelect(playerIdx)}
                  data-ocid={`wicket.confirm_button.${listIdx + 1}`}
                >
                  <span className="text-2xl">🏏</span>
                  <span>{state.settings.players[playerIdx]}</span>
                  <span className="ml-auto text-muted-foreground text-sm">
                    #{playerIdx + 1}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
