// ============================================================
// GULLY SCORER PRO — Core Cricket Logic
// This file contains the brain of the app.
// ============================================================

import type {
  BallEvent,
  BatterStats,
  BowlerStats,
  MatchCalc,
  MatchSettings,
} from "../types";

// ============================================================
// recalculateMatch — THE core function
// Takes the full history array and derives everything.
// Called every time a ball is added, removed, or edited.
// ============================================================
export function recalculateMatch(
  history: BallEvent[],
  settings: MatchSettings,
  inningsSide = 1,
): MatchCalc {
  const innings = history.filter((b) => b.inningsSide === inningsSide);

  let totalRuns = 0;
  let wickets = 0;
  let completedOvers = 0;
  let currentBall = 0; // balls in current over
  let legalBalls = 0; // counts toward over progress
  const extras = { wides: 0, noballs: 0, dead: 0, total: 0 };

  // Maps: batter index -> stats
  const batMap = new Map<number, BatterStats>();
  const bowlMap = new Map<number, BowlerStats>();

  // Helper to init batter
  const getBatter = (i: number): BatterStats => {
    if (!batMap.has(i))
      batMap.set(i, {
        index: i,
        name: settings.players[i] ?? `Batter ${i + 1}`,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        strikeRate: 0,
      });
    return batMap.get(i)!;
  };

  // Helper to init bowler
  const getBowler = (i: number): BowlerStats => {
    if (!bowlMap.has(i))
      bowlMap.set(i, {
        index: i,
        name: settings.bowlers[i] ?? `Bowler ${i + 1}`,
        overs: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
      });
    return bowlMap.get(i)!;
  };

  for (const ball of innings) {
    const batter = getBatter(ball.batterIndex);
    const bowler = getBowler(ball.bowlerIndex);

    // Dead balls don't count for anything
    if (ball.extraType === "dead") {
      extras.dead++;
      continue;
    }

    // Tally runs
    const ballRuns = ball.runs + ball.extras;
    totalRuns += ballRuns;
    bowler.runs += ballRuns;

    // Extras tracking
    if (ball.extraType === "wide") {
      extras.wides += ball.extras;
      extras.total += ball.extras;
      // Wides don't count as batter ball
    } else if (ball.extraType === "noball") {
      extras.noballs += ball.extras;
      extras.total += ball.extras;
      batter.runs += ball.runs; // noball runs count for batter
      batter.balls++; // noball still counts as batter ball in most gully rules
      bowler.balls++; // noball counts in bowler's tally
      // noball does NOT count as a legal delivery
    } else {
      // Normal ball
      batter.runs += ball.runs;
      batter.balls++;
      bowler.balls++;
      legalBalls++;

      // Boundaries
      if (ball.runs === 4) batter.fours++;
      if (ball.runs === 6) batter.sixes++;
    }

    // Wickets
    if (ball.isWicket) {
      wickets++;
      batter.isOut = true;
      bowler.wickets++; // neighbor's house counts as bowler wicket
    }
  }

  // Derive overs from legal balls
  completedOvers = Math.floor(legalBalls / 6);
  currentBall = legalBalls % 6;
  const oversStr = `${completedOvers}.${currentBall}`;

  // Compute strike rates and economy
  const batterStats = Array.from(batMap.values()).map((b) => ({
    ...b,
    name: settings.players[b.index] ?? `Batter ${b.index + 1}`,
    strikeRate: b.balls > 0 ? Math.round((b.runs / b.balls) * 100) : 0,
  }));

  const bowlerStats = Array.from(bowlMap.values()).map((b) => ({
    ...b,
    name: settings.bowlers[b.index] ?? `Bowler ${b.index + 1}`,
    overs: Math.floor(b.balls / 6),
    economy: b.balls > 0 ? Math.round((b.runs / (b.balls / 6)) * 10) / 10 : 0,
  }));

  return {
    totalRuns,
    wickets,
    completedOvers,
    currentBall,
    oversStr,
    batterStats,
    bowlerStats,
    extras,
  };
}

// ============================================================
// Haptic Feedback
// Short buzz for runs, long pattern for wickets
// Change values (ms) to adjust intensity
// ============================================================
export function vibrate(type: "run" | "wicket" | "boundary") {
  if (!navigator.vibrate) return;
  if (type === "run") navigator.vibrate(50);
  if (type === "boundary") navigator.vibrate([60, 30, 60]);
  if (type === "wicket") navigator.vibrate([100, 50, 200, 50, 100]);
}

// ============================================================
// TRANSLATIONS — English and Hindi
// To add more languages, copy one block and translate
// ============================================================
export const translations: Record<string, Record<string, string>> = {
  en: {
    appName: "Gully Scorer Pro",
    runs: "Runs",
    wickets: "Wkts",
    overs: "Overs",
    striker: "Striker ★",
    nonStriker: "Non-Striker",
    bowler: "Bowler",
    undo: "Undo",
    swap: "Swap",
    rules: "Rules",
    wide: "Wide",
    noball: "No Ball",
    out: "OUT",
    wallRuns: "Wall Runs +1",
    neighborsHouse: "Neighbor's House",
    deadBall: "Dead Ball",
    settings: "Settings",
    share: "Share",
    lastManStands: "Last Man Stands!",
    newMatch: "New Match",
    target: "Target",
    won: "won!",
    startMatch: "Start Match",
    innings1: "1st Innings",
    innings2: "2nd Innings",
    editName: "Enter new name:",
    extras: "Extras",
    scorecard: "Scorecard",
    topBatter: "Top Batter",
    topBowler: "Top Bowler",
    correction: "Edit Ball",
    save: "Save",
    cancel: "Cancel",
    selectBatter: "Select Next Batter",
    nextBatter: "Next Batter",
    startInnings2: "Start 2nd Innings",
    matchResult: "Match Result",
    selectBowler: "Select Bowler for Next Over",
    solarMode: "Solar Mode",
    language: "भाषा",
    maxOvers: "Max Overs",
    playersPerSide: "Players Per Side",
    wideRuns: "Wide Runs",
    noballRuns: "No-Ball Runs",
    team1: "Team 1",
    team2: "Team 2",
    totalExtras: "Total Extras",
    matchSummary: "Match Summary",
    shareWhatsApp: "Share to WhatsApp",
    download: "Download",
    batting: "Batting",
    bowling: "Bowling",
    batter: "Batter",
    r: "R",
    b: "B",
    sr: "SR",
    bowl: "Bowler",
    o: "O",
    w: "W",
    eco: "Eco",
    startInnings: "Start Innings",
  },
  hi: {
    appName: "गली स्कोरर प्रो",
    runs: "रन",
    wickets: "विकेट",
    overs: "ओवर",
    striker: "स्ट्राइकर ★",
    nonStriker: "नॉन-स्ट्राइकर",
    bowler: "गेंदबाज",
    undo: "पूर्ववत",
    swap: "स्वैप",
    rules: "नियम",
    wide: "वाइड",
    noball: "नो बॉल",
    out: "आउट",
    wallRuns: "दीवार रन +1",
    neighborsHouse: "पड़ोसी का घर",
    deadBall: "डेड बॉल",
    settings: "सेटिंग्स",
    share: "शेयर",
    lastManStands: "लास्ट मैन!",
    newMatch: "नया मैच",
    target: "लक्ष्य",
    won: "जीता!",
    startMatch: "मैच शुरू",
    innings1: "पहली पारी",
    innings2: "दूसरी पारी",
    editName: "नया नाम दर्ज करें:",
    extras: "एक्स्ट्रा",
    scorecard: "स्कोरकार्ड",
    topBatter: "टॉप बल्लेबाज",
    topBowler: "टॉप गेंदबाज",
    correction: "बॉल संपादित करें",
    save: "सेव",
    cancel: "रद्द",
    selectBatter: "अगला बल्लेबाज चुनें",
    nextBatter: "अगला बल्लेबाज",
    startInnings2: "दूसरी पारी शुरू",
    matchResult: "मैच परिणाम",
    selectBowler: "अगले ओवर का गेंदबाज चुनें",
    solarMode: "सोलर मोड",
    language: "Lang",
    maxOvers: "अधिकतम ओवर",
    playersPerSide: "खिलाड़ी प्रति टीम",
    wideRuns: "वाइड रन",
    noballRuns: "नो-बॉल रन",
    team1: "टीम 1",
    team2: "टीम 2",
    totalExtras: "कुल एक्स्ट्रा",
    matchSummary: "मैच सारांश",
    shareWhatsApp: "WhatsApp पर शेयर",
    download: "डाउनलोड",
    batting: "बल्लेबाजी",
    bowling: "गेंदबाजी",
    batter: "बल्लेबाज",
    r: "र",
    b: "ब",
    sr: "SR",
    bowl: "गेंदबाज",
    o: "ओ",
    w: "वि",
    eco: "इको",
    startInnings: "पारी शुरू",
  },
};

export function t(lang: "en" | "hi", key: string): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

// ============================================================
// Unique ID generator for ball events
// ============================================================
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// Check if innings is over
// Returns: 'overs' | 'allout' | null
// NOTE: Both lastManStands branches result in the same wicket
// threshold (playersPerSide - 1). This is intentional — the
// "last man stands" difference is handled in WicketModal, which
// allows the final batter to continue without a partner rather
// than forcing innings end at that point.
// ============================================================
export function checkInningsEnd(
  calc: MatchCalc,
  settings: MatchSettings,
): "overs" | "allout" | null {
  const maxLegalBalls = settings.maxOvers * 6;
  const legalBallsBowled = calc.completedOvers * 6 + calc.currentBall;
  if (legalBallsBowled >= maxLegalBalls) return "overs";
  // Both modes end at playersPerSide - 1 wickets; last-man-stands
  // UI difference is in WicketModal (shows "last man" scenario).
  const maxWickets = settings.lastManStands
    ? settings.playersPerSide - 1
    : settings.playersPerSide - 1;
  if (calc.wickets >= maxWickets) return "allout";
  return null;
}
