import { Button } from "@/components/ui/button";
// ============================================================
// SHARE MODAL
// Generate WhatsApp-shareable match summary
// Uses html2canvas loaded from CDN
// ============================================================
import { useRef } from "react";
import { recalculateMatch, t } from "../../lib/cricket";
import type { MatchState } from "../../types";

interface Props {
  state: MatchState;
  onClose: () => void;
}

export default function ShareModal({ state, onClose }: Props) {
  const lang = state.language;
  const cardRef = useRef<HTMLDivElement>(null);

  const calc1 = recalculateMatch(state.matchHistory, state.settings, 1);
  const calc2 =
    state.innings === 2
      ? recalculateMatch(state.matchHistory, state.settings, 2)
      : null;

  const topBatter = [...calc1.batterStats].sort((a, b) => b.runs - a.runs)[0];
  const topBowler = [...calc1.bowlerStats].sort(
    (a, b) => b.wickets - a.wickets || a.runs - b.runs,
  )[0];

  // Determine winner
  let resultText = "";
  if (calc2) {
    const target = calc1.totalRuns + 1;
    if (calc2.totalRuns >= target) {
      resultText = `${state.settings.team2Name} won by ${state.settings.playersPerSide - 1 - calc2.wickets} wickets`;
    } else if (
      calc2.wickets >= state.settings.playersPerSide - 1 ||
      calc2.completedOvers * 6 + calc2.currentBall >=
        state.settings.maxOvers * 6
    ) {
      const diff = calc1.totalRuns - calc2.totalRuns;
      if (diff > 0)
        resultText = `${state.settings.team1Name} won by ${diff} runs`;
      else resultText = "Match Tied!";
    }
  }

  const handleShare = async () => {
    if (!cardRef.current) return;

    // Dynamically load html2canvas from CDN
    if (!(window as unknown as Record<string, unknown>).html2canvas) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load html2canvas"));
        document.head.appendChild(script);
      });
    }

    const h2c = (window as unknown as Record<string, unknown>).html2canvas as (
      el: HTMLElement,
      opts?: object,
    ) => Promise<HTMLCanvasElement>;

    try {
      const canvas = await h2c(cardRef.current, {
        backgroundColor: "#000",
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "gully-match.png", { type: "image/png" });

        // Try Web Share API first
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title: "Match Summary — Gully Scorer Pro",
              text: `${state.settings.team1Name} vs ${state.settings.team2Name}\n${resultText}`,
              files: [file],
            });
            return;
          } catch {
            /* fall through to download */
          }
        }

        // Fallback: download image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gully-match.png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (e) {
      console.error("Screenshot failed:", e);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
      data-ocid="share.modal"
    >
      <div className="w-full max-w-sm">
        {/* The share card — html2canvas will capture this */}
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden bg-[#0a0a0a] border border-yellow-400 p-5 mb-4"
          style={{ fontFamily: "sans-serif" }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">🏏</div>
            <div className="text-yellow-400 font-black text-xl tracking-wide">
              GULLY SCORER PRO
            </div>
            <div className="text-white font-bold text-base mt-1">
              {state.settings.team1Name} vs {state.settings.team2Name}
            </div>
          </div>

          {/* Score(s) */}
          <div className="bg-[#111] rounded-xl p-4 mb-3">
            <div className="text-yellow-400 text-xs font-bold uppercase mb-1">
              1st Innings — {state.settings.team1Name}
            </div>
            <div className="text-white font-black text-4xl">
              {calc1.totalRuns}/{calc1.wickets}
            </div>
            <div className="text-gray-400 text-sm">{calc1.oversStr} overs</div>
          </div>

          {calc2 && (
            <div className="bg-[#111] rounded-xl p-4 mb-3">
              <div className="text-yellow-400 text-xs font-bold uppercase mb-1">
                2nd Innings — {state.settings.team2Name}
              </div>
              <div className="text-white font-black text-4xl">
                {calc2.totalRuns}/{calc2.wickets}
              </div>
              <div className="text-gray-400 text-sm">
                {calc2.oversStr} overs
              </div>
            </div>
          )}

          {/* Result */}
          {resultText && (
            <div className="bg-yellow-400 rounded-xl p-3 mb-3 text-center">
              <div className="text-black font-black text-lg">{resultText}</div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            {topBatter && (
              <div className="bg-[#111] rounded-lg p-3">
                <div className="text-yellow-400 text-xs font-bold">
                  {t(lang, "topBatter")}
                </div>
                <div className="text-white font-black text-sm mt-1">
                  {topBatter.name}
                </div>
                <div className="text-gray-300 text-xs">
                  {topBatter.runs} ({topBatter.balls}b)
                </div>
              </div>
            )}
            {topBowler && (
              <div className="bg-[#111] rounded-lg p-3">
                <div className="text-yellow-400 text-xs font-bold">
                  {t(lang, "topBowler")}
                </div>
                <div className="text-white font-black text-sm mt-1">
                  {topBowler.name}
                </div>
                <div className="text-gray-300 text-xs">
                  {topBowler.wickets}w / {topBowler.overs}ov
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-3 text-gray-600 text-xs">
            gullyscorerpro.app
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 h-12 bg-green-600 hover:bg-green-500 text-white font-bold"
            onClick={handleShare}
            data-ocid="share.whatsapp_button"
          >
            📤 {t(lang, "shareWhatsApp")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={handleShare}
            data-ocid="share.download_button"
          >
            💾
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={onClose}
            data-ocid="share.close_button"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
