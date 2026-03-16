import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ============================================================
// SETUP SCREEN — Configure match before it starts
// ============================================================
import { useState } from "react";
import { t } from "../lib/cricket";
import type { MatchState } from "../types";

interface Props {
  state: MatchState;
  onStart: (state: MatchState) => void;
}

export default function SetupScreen({ state, onStart }: Props) {
  const lang = state.language;
  const [s, setS] = useState(state.settings);

  const set = <K extends keyof typeof s>(key: K, val: (typeof s)[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  const setPlayer = (i: number, name: string) => {
    const arr = [...s.players];
    arr[i] = name;
    setS((prev) => ({ ...prev, players: arr }));
  };

  const setBowler = (i: number, name: string) => {
    const arr = [...s.bowlers];
    arr[i] = name;
    setS((prev) => ({ ...prev, bowlers: arr }));
  };

  const handleStart = () => {
    const players = Array.from(
      { length: s.playersPerSide },
      (_, i) => s.players[i] ?? `Player ${i + 1}`,
    );
    const bowlers = Array.from(
      { length: s.playersPerSide },
      (_, i) => s.bowlers[i] ?? `Bowler ${i + 1}`,
    );
    onStart({
      ...state,
      settings: { ...s, players, bowlers },
      phase: "batting",
      matchHistory: [],
      currentBatterIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 0,
      innings: 1,
      retiredBatters: [],
    });
  };

  // Generate stable slot arrays for rendering
  const playerSlots = Array.from({ length: s.playersPerSide }, (_, i) => ({
    slot: i,
    name: s.players[i] ?? `Player ${i + 1}`,
  }));
  const bowlerSlots = Array.from({ length: s.playersPerSide }, (_, i) => ({
    slot: i,
    name: s.bowlers[i] ?? `Bowler ${i + 1}`,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6 pb-24 overflow-y-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🏏</div>
        <h1 className="text-4xl font-black text-primary">
          {t(lang, "appName")}
        </h1>
        <p className="text-muted-foreground mt-1">Setup your match</p>
      </div>

      <div className="flex gap-2 justify-center mb-6">
        <Button
          size="sm"
          variant={lang === "en" ? "default" : "outline"}
          onClick={() => onStart({ ...state, settings: s, language: "en" })}
          data-ocid="setup.language_toggle"
        >
          EN
        </Button>
        <Button
          size="sm"
          variant={lang === "hi" ? "default" : "outline"}
          onClick={() => onStart({ ...state, settings: s, language: "hi" })}
        >
          हि
        </Button>
        <Button
          size="sm"
          variant={state.solarMode ? "default" : "outline"}
          onClick={() =>
            onStart({ ...state, settings: s, solarMode: !state.solarMode })
          }
          data-ocid="setup.solar_toggle"
        >
          ☀️ {t(lang, "solarMode")}
        </Button>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1">{t(lang, "team1")}</Label>
            <Input
              value={s.team1Name}
              onChange={(e) => set("team1Name", e.target.value)}
              className="font-bold"
              placeholder="Team A"
            />
          </div>
          <div>
            <Label className="text-xs mb-1">{t(lang, "team2")}</Label>
            <Input
              value={s.team2Name}
              onChange={(e) => set("team2Name", e.target.value)}
              className="font-bold"
              placeholder="Team B"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1">{t(lang, "maxOvers")}</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={s.maxOvers}
              onChange={(e) => set("maxOvers", +e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs mb-1">{t(lang, "playersPerSide")}</Label>
            <Input
              type="number"
              min={2}
              max={11}
              value={s.playersPerSide}
              onChange={(e) => set("playersPerSide", +e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs mb-1">{t(lang, "wideRuns")}</Label>
            <Input
              type="number"
              min={0}
              max={5}
              value={s.wideRuns}
              onChange={(e) => set("wideRuns", +e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs mb-1">{t(lang, "noballRuns")}</Label>
            <Input
              type="number"
              min={0}
              max={5}
              value={s.noballRuns}
              onChange={(e) => set("noballRuns", +e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">
            🏏 {s.team1Name} Batting Order
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {playerSlots.map(({ slot, name }) => (
              <Input
                key={`p${slot}`}
                value={name}
                onChange={(e) => setPlayer(slot, e.target.value)}
                placeholder={`Player ${slot + 1}`}
                className="text-sm"
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">⚾ {s.team2Name} Bowling</h3>
          <div className="grid grid-cols-2 gap-2">
            {bowlerSlots.map(({ slot, name }) => (
              <Input
                key={`b${slot}`}
                value={name}
                onChange={(e) => setBowler(slot, e.target.value)}
                placeholder={`Bowler ${slot + 1}`}
                className="text-sm"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          size="lg"
          className="w-full h-16 text-xl font-black score-btn"
          onClick={handleStart}
          data-ocid="setup.primary_button"
        >
          🏏 {t(lang, "startMatch")}
        </Button>
      </div>
    </div>
  );
}
