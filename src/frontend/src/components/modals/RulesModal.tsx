// ============================================================
// CUSTOM RULES MODAL
// Gully cricket special rules
// ============================================================
import { Button } from "@/components/ui/button";
import { t } from "../../lib/cricket";

interface Props {
  lang: "en" | "hi" | "gu";
  onWallRun: () => void;
  onNeighborsHouse: () => void;
  onDeadBall: () => void;
  onClose: () => void;
}

export default function RulesModal({
  lang,
  onWallRun,
  onNeighborsHouse,
  onDeadBall,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      data-ocid="rules.modal"
    >
      <div className="bg-card rounded-t-2xl w-full max-w-lg p-5 pb-8 fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black">⚡ {t(lang, "rules")}</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-ocid="rules.close_button"
          >
            ✕
          </Button>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            className="w-full h-16 rounded-xl bg-accent/20 border border-accent text-accent-foreground font-bold text-lg flex items-center gap-3 px-5 active:scale-95 transition-transform"
            onClick={onWallRun}
            data-ocid="rules.wall_runs_button"
          >
            <span className="text-2xl">🧱</span>
            <div className="text-left">
              <div className="font-black">{t(lang, "wallRuns")}</div>
              <div className="text-xs opacity-70">
                Ball hits the wall = +1 run
              </div>
            </div>
          </button>
          <button
            type="button"
            className="w-full h-16 rounded-xl bg-destructive/20 border border-destructive text-destructive-foreground font-bold text-lg flex items-center gap-3 px-5 active:scale-95 transition-transform"
            onClick={onNeighborsHouse}
            data-ocid="rules.neighbors_house_button"
          >
            <span className="text-2xl">🏠</span>
            <div className="text-left">
              <div className="font-black">{t(lang, "neighborsHouse")}</div>
              <div className="text-xs opacity-70">
                Ball goes next door = OUT!
              </div>
            </div>
          </button>
          <button
            type="button"
            className="w-full h-16 rounded-xl bg-muted border border-border font-bold text-lg flex items-center gap-3 px-5 active:scale-95 transition-transform"
            onClick={onDeadBall}
            data-ocid="rules.dead_ball_button"
          >
            <span className="text-2xl">🚫</span>
            <div className="text-left">
              <div className="font-black">{t(lang, "deadBall")}</div>
              <div className="text-xs opacity-70">
                Ball doesn't count — re-bowl
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
