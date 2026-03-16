import { Button } from "@/components/ui/button";
// ============================================================
// SCORING SCREEN — The main live scoring interface
// ============================================================
import { useCallback, useRef, useState } from "react";
import {
  checkInningsEnd,
  encodeMatchState,
  recalculateMatch,
  t,
  uid,
  vibrate,
} from "../lib/cricket";
import type { BallEvent, MatchState } from "../types";
import Timeline from "./Timeline";
import CorrectionModal from "./modals/CorrectionModal";
import QRScannerModal from "./modals/QRScannerModal";
import RulesModal from "./modals/RulesModal";
import SettingsModal from "./modals/SettingsModal";
import ShareLinkModal from "./modals/ShareLinkModal";
import ShareModal from "./modals/ShareModal";
import WicketModal from "./modals/WicketModal";

interface Props {
  state: MatchState;
  onChange: (state: MatchState) => void;
  onNewMatch: () => void;
  onQuickMatch: () => void;
  onRematch: () => void;
}

type Modal =
  | "rules"
  | "settings"
  | "correction"
  | "wicket"
  | "share"
  | "menu"
  | "manual"
  | "shareLink"
  | "shareLiveMatch"
  | "qrScanner"
  | "quickStats"
  | null;

// ============================================================
// MENU DRAWER — Slide-in from left
// ============================================================
interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  solarMode: boolean;
  language: "en" | "hi" | "gu";
  onSetLanguage: (lang: "en" | "hi" | "gu") => void;
  onToggleSolar: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenManual: () => void;
  onNewMatch: () => void;
  onQuickMatch: () => void;
  onRematch: () => void;
  onOpenShareLink: () => void;
  onOpenShareMatch: () => void;
  onOpenQRScanner: () => void;
  onOpenQuickStats: () => void;
}

function MenuDrawer({
  isOpen,
  onClose,
  solarMode,
  language,
  onSetLanguage,
  onToggleSolar,
  onOpenSettings,
  onOpenShare,
  onOpenManual,
  onNewMatch,
  onQuickMatch,
  onRematch,
  onOpenShareLink,
  onOpenShareMatch,
  onOpenQRScanner,
  onOpenQuickStats,
}: MenuDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close menu"
        data-ocid="menu.backdrop"
      />
      {/* Drawer */}
      <div
        className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col shadow-2xl"
        data-ocid="menu.panel"
      >
        {/* Header */}
        <div className="pt-12 pb-4 px-4 border-b border-border">
          <div className="text-xl font-black">🏏 Gully Scorer Pro</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Street cricket, scoreboard-ready
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-2">
          {/* ── MATCH OPTIONS ── */}
          <div className="text-xs font-bold text-muted-foreground px-1 mt-1 mb-0.5 uppercase tracking-wide">
            Match
          </div>

          {/* Rematch */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-green-600/20 hover:bg-green-600/30 active:scale-95 transition-all px-4 py-3 text-left border border-green-600/30"
            onClick={onRematch}
            data-ocid="menu.rematch_button"
          >
            <span className="text-xl">🔄</span>
            <div className="flex-1">
              <div className="font-bold text-sm text-green-500">Rematch</div>
              <div className="text-xs text-muted-foreground">
                Same teams, fresh scores
              </div>
            </div>
          </button>

          {/* Quick Match */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onQuickMatch}
            data-ocid="menu.quick_match_button"
          >
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Quick Match</div>
              <div className="text-xs text-muted-foreground">
                Edit settings, keep players
              </div>
            </div>
          </button>

          {/* New Match */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onNewMatch}
            data-ocid="menu.new_match_button"
          >
            <span className="text-xl">🏏</span>
            <div className="flex-1">
              <div className="font-bold text-sm">New Match</div>
              <div className="text-xs text-muted-foreground">
                Fresh start with new teams
              </div>
            </div>
          </button>

          {/* ── APP OPTIONS ── */}
          <div className="text-xs font-bold text-muted-foreground px-1 mt-2 mb-0.5 uppercase tracking-wide">
            App
          </div>

          {/* Solar Mode */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onToggleSolar}
            data-ocid="menu.solar_toggle"
          >
            <span className="text-xl">☀️</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Solar Mode</div>
              <div className="text-xs text-muted-foreground">
                High contrast for sunlight
              </div>
            </div>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                solarMode
                  ? "bg-yellow-400 text-black"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {solarMode ? "ON" : "OFF"}
            </span>
          </button>

          {/* Language — 3-way picker */}
          <div
            className="w-full flex items-center gap-3 rounded-xl bg-secondary px-4 py-3"
            data-ocid="menu.language_section"
          >
            <span className="text-xl">🌐</span>
            <div className="flex-1">
              <div className="font-bold text-sm mb-1.5">Language</div>
              <div className="flex gap-1.5">
                {(["en", "hi", "gu"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`flex-1 rounded-lg py-1 text-xs font-black transition-all active:scale-95 ${
                      language === l
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent/30"
                    }`}
                    onClick={() => onSetLanguage(l)}
                    data-ocid={`menu.lang_${l}_button`}
                  >
                    {l === "en" ? "EN" : l === "hi" ? "हि" : "ગુ"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenSettings}
            data-ocid="menu.settings_button"
          >
            <span className="text-xl">⚙️</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Settings</div>
              <div className="text-xs text-muted-foreground">
                Overs, players, rules
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          {/* Share Scorecard */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenShare}
            data-ocid="menu.share_button"
          >
            <span className="text-xl">📤</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Share Scorecard</div>
              <div className="text-xs text-muted-foreground">
                WhatsApp infographic
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          {/* Quick Stats */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenQuickStats}
            data-ocid="menu.quick_stats_button"
          >
            <span className="text-xl">📊</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Quick Stats</div>
              <div className="text-xs text-muted-foreground">
                Player stats & run rate
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          {/* ── SHARE / SCAN ── */}
          <div className="text-xs font-bold text-muted-foreground px-1 mt-2 mb-0.5 uppercase tracking-wide">
            Share &amp; Scan
          </div>

          {/* Share App Link */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenShareLink}
            data-ocid="menu.share_link_button"
          >
            <span className="text-xl">📲</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Share App Link</div>
              <div className="text-xs text-muted-foreground">
                QR code + WhatsApp install link
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          {/* Share Live Match */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenShareMatch}
            data-ocid="menu.share_match_button"
          >
            <span className="text-xl">🔗</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Share Live Match</div>
              <div className="text-xs text-muted-foreground">
                Let others follow the score
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          {/* QR Scanner */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenQRScanner}
            data-ocid="menu.qr_scanner_button"
          >
            <span className="text-xl">📷</span>
            <div className="flex-1">
              <div className="font-bold text-sm">Scan QR</div>
              <div className="text-xs text-muted-foreground">
                Open a shared match link
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>

          {/* User Manual */}
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl bg-secondary hover:bg-accent/20 active:scale-95 transition-all px-4 py-3 text-left"
            onClick={onOpenManual}
            data-ocid="menu.manual_button"
          >
            <span className="text-xl">📖</span>
            <div className="flex-1">
              <div className="font-bold text-sm">User Manual</div>
              <div className="text-xs text-muted-foreground">
                How to use the app
              </div>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border text-center">
          <div className="text-xs text-muted-foreground">
            Made with ❤️ by vimal for cricket lovers
          </div>
          <div className="text-xs text-muted-foreground/50 mt-0.5">v3.0</div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// SHARE LIVE MATCH MODAL — Share current match for view-only
// ============================================================
interface ShareLiveMatchModalProps {
  state: MatchState;
  onClose: () => void;
}

function ShareLiveMatchModal({ state, onClose }: ShareLiveMatchModalProps) {
  const appUrl =
    window.location.origin + window.location.pathname.replace(/\/$/, "");

  const encoded = encodeMatchState(state);
  const matchUrl = `${appUrl}#match=${encoded}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(matchUrl)}&bgcolor=1a1a2e&color=4ade80&margin=16`;
  const waMessage = encodeURIComponent(
    `🏏 *Live Cricket Score* — Follow our match live!\n\n${state.settings.team1Name} vs ${state.settings.team2Name}\n\n👁 View live score (no login needed):\n${matchUrl}`,
  );
  const waUrl = `https://wa.me/?text=${waMessage}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(matchUrl).catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      data-ocid="share_match.modal"
    >
      <div className="bg-card rounded-2xl w-full max-w-sm border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h2 className="font-black text-base">🔗 Share Live Match</h2>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
            onClick={onClose}
            data-ocid="share_match.close_button"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="text-sm font-bold">
              {state.settings.team1Name} vs {state.settings.team2Name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Viewers can see score but cannot edit
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-green-500/30">
            <img
              src={qrUrl}
              alt="Match Share QR Code"
              width={180}
              height={180}
              className="rounded-xl"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Share this QR or the WhatsApp link for live score viewing
          </p>

          {/* URL */}
          <div className="w-full bg-secondary rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {matchUrl.length > 60 ? `${matchUrl.slice(0, 57)}...` : matchUrl}
            </span>
            <button
              type="button"
              className="text-xs font-bold text-primary active:scale-95 transition-transform flex-shrink-0"
              onClick={handleCopy}
              data-ocid="share_match.secondary_button"
            >
              Copy
            </button>
          </div>

          {/* WhatsApp button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-all px-4 py-3 font-black text-white text-sm"
            data-ocid="share_match.primary_button"
          >
            <span className="text-lg">💬</span>
            Share on WhatsApp
          </a>

          <p className="text-xs text-amber-400/80 text-center">
            ⚠️ This is a snapshot. Share again after each over for live updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USER MANUAL MODAL — Bottom-sheet style
// ============================================================
interface UserManualModalProps {
  onClose: () => void;
}

function UserManualModal({ onClose }: UserManualModalProps) {
  const sections = [
    {
      icon: "🏏",
      title: "Starting a Match",
      content: [
        "1. On the Setup screen, enter team names and number of overs.",
        "2. Set players per side (default: 6) and names for batters & bowlers.",
        "3. Optionally enable 'Last Man Stands' so the last batter can bat alone.",
        "4. Tap 'Start Match' — the toss winner bats first automatically.",
      ],
    },
    {
      icon: "📊",
      title: "Scoring Balls",
      content: [
        "Tap 0/1/2/3 for dot balls and singles.",
        "4 (blue) = boundary four | 6 (purple) = maximum six.",
        "OUT (red) = wicket — you'll be asked to select the next batter.",
        "Wide / No Ball add extras automatically (configurable in Settings).",
        "Strike rotates automatically on odd-run hits.",
      ],
    },
    {
      icon: "↩",
      title: "Undo & Corrections",
      content: [
        "Tap '↩ Undo' to remove the last ball instantly.",
        "Tap any ball chip in the timeline to edit it — change runs, extras, or wicket status.",
        "All stats recalculate from the full history on every change.",
      ],
    },
    {
      icon: "⇄",
      title: "Strike Swap",
      content: [
        "Tap '⇄ Swap' to manually rotate strike between batters.",
        "Strike auto-swaps at the end of each over (batters cross).",
        "Strike auto-swaps on odd runs (1, 3 etc.) within an over.",
      ],
    },
    {
      icon: "⚡",
      title: "Gully Rules",
      content: [
        "Tap '⚡ Rules' during scoring to access special gully rules.",
        "Wall Run (+1): Ball hits the wall/boundary — scores 1 run.",
        "Neighbor's House (OUT): Ball lands in neighbor's yard — batter is out!",
        "Dead Ball: Ball is lost or interrupted — no runs, ball not counted.",
      ],
    },
    {
      icon: "🔄",
      title: "Rematch / Quick Match",
      content: [
        "Rematch (☰ menu): Instantly restart with the exact same teams and player names.",
        "Quick Match (☰ menu): Go to setup with current settings pre-filled — edit anything then start.",
        "New Match (☰ menu): Completely fresh start with blank settings.",
      ],
    },
    {
      icon: "📲",
      title: "Share App Link",
      content: [
        "Menu → Share App Link: Shows QR code + WhatsApp button to share install link.",
        "Anyone who scans/clicks can install Gully Scorer Pro on their phone.",
      ],
    },
    {
      icon: "🔗",
      title: "Share Live Match",
      content: [
        "Menu → Share Live Match: Generates a special URL with match snapshot.",
        "Share via WhatsApp — others can view the score in read-only mode.",
        "Re-share after each over to send updated scores.",
      ],
    },
    {
      icon: "📷",
      title: "Scan QR",
      content: [
        "Menu → Scan QR: Opens camera to scan QR codes.",
        "Scanning a match QR takes you straight to the live score viewer.",
        "Works for any URL QR code.",
      ],
    },
    {
      icon: "☀️",
      title: "Solar Mode",
      content: [
        "Solar Mode switches to a high-contrast yellow-on-black theme.",
        "Ideal for outdoor use in bright sunlight.",
        "Toggle it from the menu (☰) at any time during a match.",
      ],
    },
    {
      icon: "🌐",
      title: "Language (EN / हि / ગુ)",
      content: [
        "Switch the entire UI between English, Hindi, and Gujarati.",
        "Access from the hamburger menu (☰) → Language — tap EN, हि, or ગુ.",
        "Your preference is saved between sessions.",
      ],
    },
    {
      icon: "📤",
      title: "Share Score",
      content: [
        "Generate a beautiful scorecard image and share on WhatsApp.",
        "Shows full batting, bowling, and match summary.",
        "Works on both iOS and Android via the Web Share API.",
        "Access from ☰ → Share Scorecard.",
      ],
    },
    {
      icon: "🏆",
      title: "Innings & Result",
      content: [
        "Innings 1 ends when all overs are bowled or all wickets fall.",
        "Innings 2 starts automatically — the target is shown at the top.",
        "Match ends immediately when the chasing team hits the winning run.",
        "Win/loss/tie is shown on the final Result screen with a full scorecard.",
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-end"
      data-ocid="manual.modal"
    >
      <div className="bg-card rounded-t-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
          <h2 className="font-black text-lg">📖 How to Use Gully Scorer Pro</h2>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
            onClick={onClose}
            data-ocid="manual.close_button"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-3 py-3 flex flex-col gap-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-secondary rounded-xl p-4 border border-border"
            >
              <div className="font-black text-sm mb-2">
                {section.icon} {section.title}
              </div>
              <ul className="flex flex-col gap-1">
                {section.content.map((line) => (
                  <li
                    key={line}
                    className="text-xs text-muted-foreground leading-relaxed"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="text-center text-xs text-muted-foreground pb-4 pt-2">
            Made with ❤️ by vimal for cricket lovers • v3.0
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUICK STATS MODAL
// ============================================================
interface QuickStatsModalProps {
  state: MatchState;
  onClose: () => void;
}
function QuickStatsModal({ state, onClose }: QuickStatsModalProps) {
  const calc = recalculateMatch(
    state.matchHistory,
    state.settings,
    state.innings,
  );
  const runRate =
    calc.completedOvers > 0 || calc.currentBall > 0
      ? (
          calc.totalRuns /
          ((calc.completedOvers * 6 + calc.currentBall) / 6)
        ).toFixed(2)
      : "0.00";
  const oversLeft =
    state.settings.maxOvers -
    calc.completedOvers -
    (calc.currentBall > 0 ? 1 : 0);
  const reqRunRate =
    state.innings === 2 && state.team1FinalRuns !== undefined
      ? (() => {
          const needed = state.team1FinalRuns + 1 - calc.totalRuns;
          const ballsLeft =
            state.settings.maxOvers * 6 -
            (calc.completedOvers * 6 + calc.currentBall);
          return ballsLeft > 0 ? ((needed / ballsLeft) * 6).toFixed(2) : "—";
        })()
      : null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      data-ocid="quick_stats.modal"
    >
      <div className="bg-card rounded-t-2xl w-full max-w-lg p-5 pb-8 fade-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">📊 Quick Stats</h2>
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold"
            onClick={onClose}
            data-ocid="quick_stats.close_button"
          >
            ✕
          </button>
        </div>

        {/* Run rate */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Run Rate</div>
            <div className="font-black text-2xl">{runRate}</div>
          </div>
          {reqRunRate !== null ? (
            <div className="bg-secondary rounded-xl p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">
                Req. Rate
              </div>
              <div className="font-black text-2xl">{reqRunRate}</div>
            </div>
          ) : (
            <div className="bg-secondary rounded-xl p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">
                Overs Left
              </div>
              <div className="font-black text-2xl">{oversLeft}</div>
            </div>
          )}
        </div>

        {/* Batting stats */}
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          Batting
        </div>
        <div className="space-y-1.5 mb-4">
          {calc.batterStats
            .sort((a, b) => b.runs - a.runs)
            .map((b) => (
              <div
                key={b.index}
                className="flex items-center bg-secondary rounded-xl px-3 py-2 gap-2"
              >
                <span className="font-bold text-sm flex-1 truncate">
                  {b.name}
                </span>
                <span className="font-black text-sm">{b.runs}</span>
                <span className="text-xs text-muted-foreground">
                  ({b.balls}b)
                </span>
                {b.fours > 0 && (
                  <span className="text-xs text-blue-400">{b.fours}×4</span>
                )}
                {b.sixes > 0 && (
                  <span className="text-xs text-purple-400">{b.sixes}×6</span>
                )}
                {b.isOut && <span className="text-xs text-red-400">OUT</span>}
              </div>
            ))}
        </div>

        {/* Bowling stats */}
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          Bowling
        </div>
        <div className="space-y-1.5">
          {calc.bowlerStats
            .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
            .map((b) => (
              <div
                key={b.index}
                className="flex items-center bg-secondary rounded-xl px-3 py-2 gap-2"
              >
                <span className="font-bold text-sm flex-1 truncate">
                  {b.name}
                </span>
                <span className="font-black text-sm">
                  {Math.floor(b.balls / 6)}.{b.balls % 6} ov
                </span>
                <span className="text-xs text-muted-foreground">{b.runs}r</span>
                <span className="text-xs font-bold text-red-400">
                  {b.wickets}w
                </span>
                <span className="text-xs text-muted-foreground">
                  Eco:{b.economy}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCORING SCREEN
// ============================================================
export default function ScoringScreen({
  state,
  onChange,
  onNewMatch,
  onQuickMatch,
  onRematch,
}: Props) {
  const lang = state.language;
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [correctionBall, setCorrectionBall] = useState<{
    ball: BallEvent;
    index: number;
  } | null>(null);

  // Bug 3: Bowler selection at end of over
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const [showNBRunPicker, setShowNBRunPicker] = useState(false);
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
    // If bowler selection is pending, cancel it first — then undo
    if (showBowlerSelect) {
      pendingStateRef.current = null;
      setShowBowlerSelect(false);
    }
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
      {/* MENU DRAWER */}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        solarMode={state.solarMode}
        language={lang}
        onSetLanguage={(l) => {
          onChange({ ...state, language: l });
          setMenuOpen(false);
        }}
        onToggleSolar={() => {
          onChange({ ...state, solarMode: !state.solarMode });
          setMenuOpen(false);
        }}
        onOpenSettings={() => {
          setMenuOpen(false);
          setActiveModal("settings");
        }}
        onOpenShare={() => {
          setMenuOpen(false);
          setActiveModal("share");
        }}
        onOpenManual={() => {
          setMenuOpen(false);
          setActiveModal("manual");
        }}
        onNewMatch={() => {
          setMenuOpen(false);
          onNewMatch();
        }}
        onQuickMatch={() => {
          setMenuOpen(false);
          onQuickMatch();
        }}
        onRematch={() => {
          setMenuOpen(false);
          onRematch();
        }}
        onOpenShareLink={() => {
          setMenuOpen(false);
          setActiveModal("shareLink");
        }}
        onOpenShareMatch={() => {
          setMenuOpen(false);
          setActiveModal("shareLiveMatch");
        }}
        onOpenQRScanner={() => {
          setMenuOpen(false);
          setActiveModal("qrScanner");
        }}
        onOpenQuickStats={() => {
          setMenuOpen(false);
          setActiveModal("quickStats");
        }}
      />

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-border">
        {/* Hamburger menu on left */}
        <Button
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0 text-xl flex-shrink-0"
          onClick={() => setMenuOpen(true)}
          data-ocid="scoring.menu_button"
        >
          ☰
        </Button>

        {/* Innings label centered */}
        <div className="flex-1 text-center px-2">
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

        {/* Overs info on right (passive) */}
        <div className="text-xs font-bold text-muted-foreground flex-shrink-0 text-right min-w-[52px]">
          {calc.oversStr}
          <div className="text-muted-foreground/50 font-normal">overs</div>
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

      <div className="h-44" />

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
        {/* Secondary row — Wide & No Ball slightly larger for easy tapping */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            className="h-12 rounded-lg bg-muted border border-border font-bold text-sm active:scale-95 transition-transform"
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
            className="h-12 rounded-lg bg-muted border border-border font-bold text-sm active:scale-95 transition-transform"
            onClick={() => setShowNBRunPicker(true)}
            data-ocid="scoring.btn_noball"
          >
            {t(lang, "noball")}
          </button>
          <button
            type="button"
            className="h-12 rounded-lg bg-muted border border-border font-bold text-sm active:scale-95 transition-transform"
            onClick={handleUndo}
            data-ocid="scoring.btn_undo"
          >
            ↩ {t(lang, "undo")}
          </button>
          <button
            type="button"
            className="h-12 rounded-lg bg-muted border border-border font-bold text-sm active:scale-95 transition-transform"
            onClick={handleSwap}
            data-ocid="scoring.btn_swap"
          >
            ⇄ {t(lang, "swap")}
          </button>
          <button
            type="button"
            className="h-12 rounded-lg bg-accent/20 border border-accent font-bold text-sm text-accent active:scale-95 transition-transform"
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
          settings={state.settings}
          onSave={(editedBall, idx) => {
            const newHistory = [...state.matchHistory];
            newHistory[idx] = editedBall;
            let correctedState: MatchState = {
              ...state,
              matchHistory: newHistory,
            };
            // Re-check innings end in case correction changes the result
            const newCalc = recalculateMatch(
              newHistory,
              state.settings,
              state.innings,
            );
            const target2 =
              state.innings === 2 && state.team1FinalRuns !== undefined
                ? state.team1FinalRuns + 1
                : null;
            if (target2 !== null && newCalc.totalRuns >= target2) {
              correctedState = { ...correctedState, phase: "result" };
            } else {
              const end = checkInningsEnd(newCalc, state.settings);
              if (end && state.innings === 1) {
                correctedState = {
                  ...correctedState,
                  phase: "innings_break",
                  team1FinalRuns: newCalc.totalRuns,
                  team1FinalWickets: newCalc.wickets,
                  team1FinalOvers: newCalc.oversStr,
                };
              } else if (end && state.innings === 2) {
                correctedState = { ...correctedState, phase: "result" };
              }
            }
            onChange(correctedState);
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
      {activeModal === "manual" && (
        <UserManualModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "shareLink" && (
        <ShareLinkModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "shareLiveMatch" && (
        <ShareLiveMatchModal
          state={state}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "quickStats" && (
        <QuickStatsModal state={state} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "qrScanner" && (
        <QRScannerModal onClose={() => setActiveModal(null)} />
      )}

      {/* NB RUN PICKER — Batter runs scored off a No Ball */}
      {showNBRunPicker && (
        <div
          className="fixed inset-0 bg-black/60 z-40 flex items-end justify-center"
          data-ocid="nb_picker.modal"
        >
          <div className="bg-card rounded-t-2xl w-full max-w-lg p-5 pb-8 fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black">No Ball — Batter runs?</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  +{state.settings.noballRuns} penalty added automatically
                </p>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm"
                onClick={() => setShowNBRunPicker(false)}
                data-ocid="nb_picker.close_button"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button
                  type="button"
                  key={r}
                  className="h-14 rounded-xl font-black text-xl bg-muted border-2 border-border active:scale-95 transition-transform hover:border-primary"
                  onClick={() => {
                    addBall({
                      extraType: "noball",
                      extras: state.settings.noballRuns,
                      runs: r,
                    });
                    setShowNBRunPicker(false);
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
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
