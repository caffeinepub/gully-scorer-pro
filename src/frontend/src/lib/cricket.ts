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

  // Use canonical team arrays so innings 1 names are always correct
  // even after the player/bowler arrays are swapped for innings 2
  const batterNames =
    inningsSide === 1
      ? (settings.team1Players ?? settings.players)
      : (settings.team2Players ?? settings.players);
  const bowlerNames =
    inningsSide === 1
      ? (settings.team2Players ?? settings.bowlers)
      : (settings.team1Players ?? settings.bowlers);

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
        name: batterNames[i] ?? `Batter ${i + 1}`,
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
        name: bowlerNames[i] ?? `Bowler ${i + 1}`,
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
      bowler.balls++; // noball counts in bowler's tally (but not legal delivery)
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
    name: batterNames[b.index] ?? `Batter ${b.index + 1}`,
    strikeRate: b.balls > 0 ? Math.round((b.runs / b.balls) * 100) : 0,
  }));

  const bowlerStats = Array.from(bowlMap.values()).map((b) => ({
    ...b,
    name: bowlerNames[b.index] ?? `Bowler ${b.index + 1}`,
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
// TRANSLATIONS — English, Hindi, and Gujarati
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
    quickMatch: "Quick Match",
    rematch: "Rematch",
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
    noBallRuns: "Runs off No Ball",
    quickStats: "Quick Stats",
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
    quickMatch: "त्वरित मैच",
    rematch: "रीमैच",
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
    noBallRuns: "नो बॉल पर रन",
    quickStats: "त्वरित आँकड़े",
  },
  gu: {
    appName: "ગલ્લી સ્કોરર પ્રો",
    runs: "રન",
    wickets: "વિકેટ",
    overs: "ઓવર",
    striker: "સ્ટ્રાઇકર ★",
    nonStriker: "નોન-સ્ટ્રાઇકર",
    bowler: "બોલર",
    undo: "પૂર્વવત",
    swap: "સ્વૅપ",
    rules: "નિયમ",
    wide: "વાઇડ",
    noball: "નો બૉલ",
    out: "આઉટ",
    wallRuns: "દીવાલ રન +1",
    neighborsHouse: "પડોશીનું ઘર",
    deadBall: "ડેડ બૉલ",
    settings: "સેટિંગ્સ",
    share: "શૅર",
    lastManStands: "છેલ્લો માણસ!",
    newMatch: "નવી મૅચ",
    quickMatch: "ઝડપી મૅચ",
    rematch: "રિમૅચ",
    target: "લક્ષ્ય",
    won: "જીત્યા!",
    startMatch: "મૅચ શરૂ",
    innings1: "પ્રથમ દાવ",
    innings2: "બીજો દાવ",
    editName: "નવું નામ દાખલ કરો:",
    extras: "એક્સ્ટ્રા",
    scorecard: "સ્કોરકાર્ડ",
    topBatter: "ટોપ બેટ્સમૅન",
    topBowler: "ટોપ બોલર",
    correction: "બૉલ સંપાદિત કરો",
    save: "સેવ",
    cancel: "રદ",
    selectBatter: "આગળનો બેટ્સમૅન પસંદ કરો",
    nextBatter: "આગળનો બેટ્સમૅન",
    startInnings2: "બીજો દાવ શરૂ",
    matchResult: "મૅચ પરિણામ",
    selectBowler: "આગળના ઓવર માટે બોલર પસંદ કરો",
    solarMode: "સોલર મોડ",
    language: "ભાષા",
    maxOvers: "મહત્તમ ઓવર",
    playersPerSide: "ટીમ દીઠ ખેલાડી",
    wideRuns: "વાઇડ રન",
    noballRuns: "નો-બૉલ રન",
    team1: "ટીમ ૧",
    team2: "ટીમ ૨",
    totalExtras: "કુલ એક્સ્ટ્રા",
    matchSummary: "મૅચ સારાંશ",
    shareWhatsApp: "WhatsApp પર શૅર",
    download: "ડાઉનલોડ",
    batting: "બૅટિંગ",
    bowling: "બૉલિંગ",
    batter: "બેટ્સમૅન",
    r: "ર",
    b: "બ",
    sr: "SR",
    bowl: "બોલર",
    o: "ઓ",
    w: "વિ",
    eco: "ઇકો",
    startInnings: "દાવ શરૂ",
    noBallRuns: "નો બૉલ પર રન",
    quickStats: "ઝડપી આંકડા",
  },
};

export function t(lang: "en" | "hi" | "gu", key: string): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

// ============================================================
// Unique ID generator for ball events
// ============================================================
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// Safe base64 encode/decode that handles Unicode (Hindi/Gujarati)
// ============================================================
export function encodeMatchState(state: unknown): string {
  try {
    const json = JSON.stringify(state);
    // encodeURIComponent -> percent-encode UTF-8 chars, unescape -> latin1 bytes
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return "";
  }
}

export function decodeMatchState(encoded: string): unknown | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ============================================================
// Check if innings is over
// Returns: 'overs' | 'allout' | null
// lastManStands = true: innings ends when ALL batters are out
// (no partner needed for the last batter)
// lastManStands = false: innings ends when playersPerSide - 1 wickets fall
// ============================================================
export function checkInningsEnd(
  calc: MatchCalc,
  settings: MatchSettings,
): "overs" | "allout" | null {
  const maxLegalBalls = settings.maxOvers * 6;
  const legalBallsBowled = calc.completedOvers * 6 + calc.currentBall;
  if (legalBallsBowled >= maxLegalBalls) return "overs";
  // lastManStands: all players must be out (full playersPerSide wickets)
  // normal mode: innings ends at playersPerSide - 1 wickets
  const maxWickets = settings.lastManStands
    ? settings.playersPerSide
    : settings.playersPerSide - 1;
  if (calc.wickets >= maxWickets) return "allout";
  return null;
}
