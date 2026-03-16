import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// ============================================================
// SETTINGS MODAL
// Editable mid-match settings
// ============================================================
import { useState } from "react";
import { t } from "../../lib/cricket";
import type { MatchSettings } from "../../types";

interface Props {
  lang: "en" | "hi";
  settings: MatchSettings;
  onSave: (s: MatchSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({
  lang,
  settings,
  onSave,
  onClose,
}: Props) {
  const [s, setS] = useState(settings);
  const set = <K extends keyof MatchSettings>(key: K, val: MatchSettings[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      data-ocid="settings.modal"
    >
      <div className="bg-card rounded-t-2xl w-full max-w-lg p-5 pb-8 fade-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black">⚙️ {t(lang, "settings")}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t(lang, "maxOvers")}</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={s.maxOvers}
                onChange={(e) => set("maxOvers", +e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">{t(lang, "playersPerSide")}</Label>
              <Input
                type="number"
                min={2}
                max={11}
                value={s.playersPerSide}
                onChange={(e) => set("playersPerSide", +e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">{t(lang, "wideRuns")}</Label>
              <Input
                type="number"
                min={0}
                max={5}
                value={s.wideRuns}
                onChange={(e) => set("wideRuns", +e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">{t(lang, "noballRuns")}</Label>
              <Input
                type="number"
                min={0}
                max={5}
                value={s.noballRuns}
                onChange={(e) => set("noballRuns", +e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Switch
              checked={s.lastManStands}
              onCheckedChange={(v) => set("lastManStands", v)}
            />
            <div>
              <div className="font-bold text-sm">
                {t(lang, "lastManStands")}
              </div>
              <div className="text-xs text-muted-foreground">
                Last batter can continue alone
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="settings.cancel_button"
          >
            {t(lang, "cancel")}
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSave(s)}
            data-ocid="settings.save_button"
          >
            {t(lang, "save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
