import { Button } from "@/components/ui/button";
// ============================================================
// CORRECTION MODAL
// Edit a specific ball in the timeline
// ============================================================
import { useState } from "react";
import { t } from "../../lib/cricket";
import type { BallEvent, MatchSettings } from "../../types";

interface Props {
  ball: BallEvent;
  ballIndex: number;
  lang: "en" | "hi" | "gu";
  settings: MatchSettings;
  onSave: (ball: BallEvent, index: number) => void;
  onClose: () => void;
}

export default function CorrectionModal({
  ball,
  ballIndex,
  lang,
  settings,
  onSave,
  onClose,
}: Props) {
  const [edited, setEdited] = useState<BallEvent>({ ...ball });

  const setRuns = (r: number) =>
    setEdited((b) => ({ ...b, runs: r, isWicket: false }));
  const setWicket = () =>
    setEdited((b) => ({ ...b, runs: 0, isWicket: true, extraType: "none" }));
  const setExtra = (type: BallEvent["extraType"]) =>
    setEdited((b) => ({
      ...b,
      extraType: type,
      isWicket: false,
      // Auto-fill the extras value when switching to wide/noball
      extras:
        type === "wide"
          ? settings.wideRuns
          : type === "noball"
            ? settings.noballRuns
            : 0,
    }));

  const runBtns = [0, 1, 2, 3, 4, 6];

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      data-ocid="correction.modal"
    >
      <div className="bg-card rounded-2xl w-full max-w-sm p-5 fade-up">
        <h2 className="text-xl font-black mb-1">{t(lang, "correction")}</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Over {ball.over + 1}, Ball {ball.ball + 1}
        </p>

        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          Runs
        </p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {runBtns.map((r) => (
            <button
              type="button"
              key={r}
              className={`h-12 rounded-lg font-black text-lg border-2 transition-all ${
                edited.runs === r && !edited.isWicket
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border"
              }`}
              onClick={() => setRuns(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`w-full h-12 rounded-lg font-black text-lg border-2 mb-3 transition-all ${
            edited.isWicket
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-muted border-border"
          }`}
          onClick={setWicket}
        >
          OUT / W
        </button>

        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          Extra Type
        </p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {(["none", "wide", "noball", "dead"] as BallEvent["extraType"][]).map(
            (et) => (
              <button
                type="button"
                key={et}
                className={`h-10 rounded-lg font-bold text-sm border-2 transition-all ${
                  edited.extraType === et
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-muted border-border"
                }`}
                onClick={() => setExtra(et)}
              >
                {et === "none"
                  ? "None"
                  : et === "wide"
                    ? "Wide"
                    : et === "noball"
                      ? "NB"
                      : "Dead"}
              </button>
            ),
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="correction.cancel_button"
          >
            {t(lang, "cancel")}
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSave(edited, ballIndex)}
            data-ocid="correction.save_button"
          >
            {t(lang, "save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
