// ============================================================
// SHARE LINK MODAL — Share app install link via QR + WhatsApp
// ============================================================
interface ShareLinkModalProps {
  onClose: () => void;
}

export default function ShareLinkModal({ onClose }: ShareLinkModalProps) {
  const appUrl =
    window.location.origin + window.location.pathname.replace(/\/$/, "");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}&bgcolor=1a1a2e&color=4ade80&margin=16`;
  const waMessage = encodeURIComponent(
    `🏏 *Gully Scorer Pro* — The ultimate street cricket scoring app!\n\nScore your gully cricket matches like a pro. Free, offline, works on any phone!\n\n👉 Install now: ${appUrl}`,
  );
  const waUrl = `https://wa.me/?text=${waMessage}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(appUrl).catch(() => {});
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
          <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-green-500/30">
            <img
              src={qrUrl}
              alt="App QR Code"
              width={180}
              height={180}
              className="rounded-xl"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Scan to install Gully Scorer Pro on any phone
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
              Copy
            </button>
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
            Share on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
