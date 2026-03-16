import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  const closeGuide = () => setShowIOSGuide(false);

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)",
          borderTop: "2px solid #22c55e",
          padding: "16px",
          boxShadow: "0 -8px 32px rgba(34,197,94,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <img
            src="/assets/generated/gully-scorer-icon.dim_512x512.png"
            alt="icon"
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              border: "2px solid #22c55e",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#22c55e",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              Gully Scorer Pro
            </div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>
              Install for offline scoring &amp; faster access
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstall}
            style={{
              background: "#22c55e",
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              background: "transparent",
              color: "#6b7280",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <button
          type="button"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            border: "none",
            cursor: "default",
            width: "100%",
          }}
          onClick={closeGuide}
        >
          <div
            style={{
              background: "#111827",
              borderRadius: 20,
              padding: "24px 20px",
              width: "100%",
              maxWidth: 440,
              border: "1.5px solid #22c55e",
              boxShadow: "0 0 40px rgba(34,197,94,0.25)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                color: "#22c55e",
                fontWeight: 800,
                fontSize: 18,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              🏏 Install on iPhone
            </div>
            <div
              style={{
                color: "#9ca3af",
                fontSize: 13,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Follow these 3 quick steps:
            </div>
            {[
              {
                step: "1",
                icon: "⬆️",
                text: "Tap the Share button at the bottom of Safari",
              },
              {
                step: "2",
                icon: "➕",
                text: 'Scroll down and tap "Add to Home Screen"',
              },
              {
                step: "3",
                icon: "✅",
                text: 'Tap "Add" in the top-right corner — done!',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 14,
                  background: "rgba(34,197,94,0.08)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "#22c55e",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#000",
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.4 }}
                >
                  <span style={{ fontSize: 18, marginRight: 6 }}>
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeGuide();
              }}
              style={{
                width: "100%",
                marginTop: 8,
                background: "#22c55e",
                color: "#000",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Got it!
            </button>
          </div>
        </button>
      )}
    </>
  );
}
