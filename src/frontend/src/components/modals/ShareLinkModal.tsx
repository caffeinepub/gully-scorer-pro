// ============================================================
// SHARE LINK MODAL — Share app install link via QR + WhatsApp
// ============================================================
import { useState } from "react";

interface ShareLinkModalProps {
  onClose: () => void;
}

export default function ShareLinkModal({ onClose }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const appUrl =
    window.location.origin + window.location.pathname.replace(/\/$/, "");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}&bgcolor=020f04&color=4ade80&margin=16`;

  // 🔥 Viral-worthy WhatsApp invitation message
  const waMessage = encodeURIComponent(
    `🏏🔥 *Gully Scorer Pro* \u2014 agar gully cricket khelte ho toh ye install karo abhi!\n\n✅ Ball-by-ball scoring\n✅ 100% FREE \u2014 no ads, no sign-up\n✅ Works without internet\n✅ Solar Mode for outdoor play\n✅ WhatsApp scorecard in 1 tap\n✅ Android & iPhone dono pe chalti hai\n\n👇 *Just tap this link \u2014 installs in seconds:*\n${appUrl}\n\n1200+ players installed this week 🚀`,
  );
  const waUrl = `https://wa.me/?text=${waMessage}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(appUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      data-ocid="share_link.modal"
    >
      <div className="bg-card rounded-2xl w-full max-w-sm border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h2 className="font-black text-base">📲 Share App Link</h2>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
            onClick={onClose}
            data-ocid="share_link.close_button"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-4">
          {/* QR Code */}
          <div className="bg-[#020f04] rounded-2xl p-3 border border-green-500/30">
            <img
              src={qrUrl}
              alt="App QR Code"
              width={180}
              height={180}
              className="rounded-xl"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Scan this QR to install Gully Scorer Pro on any phone
          </p>

          {/* URL display */}
          <div className="w-full bg-secondary rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {appUrl}
            </span>
            <button
              type="button"
              className="text-xs font-bold text-primary active:scale-95 transition-transform flex-shrink-0"
              onClick={handleCopy}
              data-ocid="share_link.secondary_button"
            >
              {copied ? "✅ Copied!" : "Copy"}
            </button>
          </div>

          {/* WhatsApp share message preview */}
          <div className="w-full rounded-xl bg-green-950/40 border border-green-500/20 px-3 py-2">
            <p className="text-[11px] text-green-400/80 font-bold mb-1">
              📨 WhatsApp message preview:
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              🏏🔥 Gully Scorer Pro — agar gully cricket khelte ho toh ye
              install karo abhi! ✅ FREE ✅ Offline ✅ WhatsApp Scorecard...
            </p>
          </div>

          {/* WhatsApp button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-all px-4 py-3 font-black text-white text-sm"
            data-ocid="share_link.primary_button"
          >
            <span className="text-lg">💬</span>
            Send on WhatsApp — It Spreads Fast!
          </a>

          <p className="text-[10px] text-muted-foreground text-center">
            Share with all your WhatsApp groups — the link opens the app install
            page directly
          </p>
        </div>
      </div>
    </div>
  );
}
