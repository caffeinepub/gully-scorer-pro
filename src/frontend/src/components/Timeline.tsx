// ============================================================
// BALL-BY-BALL TIMELINE
// Shows the last 10 balls. Click any ball to edit it.
// ============================================================
import type { BallEvent } from "../types";

interface Props {
  history: BallEvent[];
  onBallClick: (ball: BallEvent, index: number) => void;
  inningsSide: number;
}

function getBallClass(ball: BallEvent): string {
  if (ball.isWicket) return "ball-chip ball-chip-wicket";
  if (ball.extraType === "wide" || ball.extraType === "noball")
    return "ball-chip ball-chip-extra";
  if (ball.runs === 4) return "ball-chip ball-chip-four";
  if (ball.runs === 6) return "ball-chip ball-chip-six";
  if (ball.runs > 0) return "ball-chip ball-chip-run";
  return "ball-chip ball-chip-dot";
}

function getBallLabel(ball: BallEvent): string {
  if (ball.extraType === "dead") return "DB";
  if (ball.isWicket) return "W";
  if (ball.extraType === "wide")
    return `Wd${ball.extras > 1 ? `+${ball.runs}` : ""}`;
  if (ball.extraType === "noball")
    return `Nb${ball.runs > 0 ? `+${ball.runs}` : ""}`;
  return String(ball.runs);
}

export default function Timeline({ history, onBallClick, inningsSide }: Props) {
  const inningsHistory = history.filter((b) => b.inningsSide === inningsSide);
  const last10 = inningsHistory.slice(-10);
  const startIdx = inningsHistory.length - last10.length;

  return (
    <div
      className="timeline-scroll overflow-x-auto flex items-center gap-1.5 px-3 py-2 min-h-[52px]"
      data-ocid="scoring.timeline_panel"
    >
      {last10.length === 0 && (
        <span className="text-muted-foreground text-xs px-2">
          No balls yet — start scoring!
        </span>
      )}
      {last10.map((ball, i) => (
        <button
          type="button"
          key={ball.id}
          className={getBallClass(ball)}
          onClick={() => onBallClick(ball, startIdx + i)}
          title={`Over ${ball.over + 1}.${ball.ball + 1} — click to edit`}
        >
          {getBallLabel(ball)}
        </button>
      ))}
      {/* Upcoming dot */}
      <div
        className="ball-chip ball-chip-dot opacity-30"
        style={{ border: "2px dashed" }}
      />
    </div>
  );
}
