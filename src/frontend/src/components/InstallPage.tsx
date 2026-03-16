import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  onEnter: () => void;
}

const features = [
  {
    icon: "🏏",
    title: "Ball-by-ball scoring",
    sub: "4, 6, Wide, No Ball, OUT & more",
  },
  { icon: "📴", title: "100% Offline", sub: "No internet needed on the field" },
  { icon: "☀️", title: "Solar Mode", sub: "See clearly in bright sunlight" },
  {
    icon: "📤",
    title: "WhatsApp Scorecard",
    sub: "Share stunning infographics instantly",
  },
  {
    icon: "🏆",
    title: "Gully Rules Built-in",
    sub: "Wall runs, Neighbor's house & more",
  },
  {
    icon: "🎯",
    title: "Free Forever",
    sub: "No ads, no sign-up, just cricket",
  },
];

export default function InstallPage({ onEnter }: Props) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 80);
    setTimeout(() => setPulse(true), 1200);
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setIsIOS(true);
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
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setTimeout(onEnter, 1500);
      }
      setDeferredPrompt(null);
    } else {
      onEnter();
    }
  };

  const canInstall = isIOS || !!deferredPrompt;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #000 0%, #030f05 50%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 36px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Background grid lines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top glow */}
      <div
        style={{
          position: "fixed",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 65%)",
        }}
      />

      {/* Badge */}
      <div
        style={{
          marginTop: 40,
          marginBottom: 12,
          zIndex: 1,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(-16px)",
          transition: "all 0.5s ease",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.35)",
            borderRadius: 100,
            padding: "5px 14px",
            color: "#22c55e",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
              display: "inline-block",
            }}
          />
          Free Cricket Scoring App
        </span>
      </div>

      {/* App icon */}
      <div
        style={{
          zIndex: 1,
          marginBottom: 20,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "scale(1)" : "scale(0.7)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            overflow: "hidden",
            border: "2.5px solid rgba(34,197,94,0.5)",
            boxShadow: pulse
              ? "0 0 0 8px rgba(34,197,94,0.08), 0 0 0 20px rgba(34,197,94,0.04), 0 24px 60px rgba(34,197,94,0.45)"
              : "0 0 0 0px rgba(34,197,94,0.08), 0 24px 60px rgba(34,197,94,0.3)",
            transition: "box-shadow 1.5s ease",
          }}
        >
          <img
            src="/assets/generated/gully-scorer-icon.dim_512x512.png"
            alt="Gully Scorer Pro"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          marginBottom: 8,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease 0.1s",
        }}
      >
        <h1
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: "#fff",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-1px",
          }}
        >
          Gully Scorer<span style={{ color: "#22c55e" }}> Pro</span>
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: 15,
            margin: "10px 0 0",
            lineHeight: 1.5,
          }}
        >
          Score. Track. Share. Win.
        </p>
      </div>

      {/* Star rating */}
      <div
        style={{
          zIndex: 1,
          marginBottom: 28,
          opacity: animIn ? 1 : 0,
          transition: "all 0.6s ease 0.15s",
        }}
      >
        <span style={{ color: "#fbbf24", fontSize: 16, letterSpacing: 2 }}>
          ★★★★★
        </span>
        <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
          Loved by gully cricketers
        </span>
      </div>

      {/* Features grid */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 28,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.65s ease 0.2s",
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "14px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{f.icon}</span>
            <div>
              <div
                style={{
                  color: "#f3f4f6",
                  fontWeight: 700,
                  fontSize: 12,
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: 11,
                  marginTop: 2,
                  lineHeight: 1.35,
                }}
              >
                {f.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          zIndex: 1,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.65s ease 0.35s",
        }}
      >
        {installed ? (
          <div
            style={{
              textAlign: "center",
              color: "#22c55e",
              fontWeight: 800,
              fontSize: 20,
              padding: 20,
            }}
          >
            ✅ Installing... Opening now!
          </div>
        ) : (
          <>
            {canInstall && (
              <button
                type="button"
                onClick={handleInstall}
                style={{
                  width: "100%",
                  padding: "20px",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                  color: "#000",
                  border: "none",
                  borderRadius: 18,
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: "pointer",
                  marginBottom: 10,
                  letterSpacing: "-0.3px",
                  boxShadow:
                    "0 0 0 1px rgba(34,197,94,0.3), 0 12px 40px rgba(34,197,94,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 22 }}>📲</span>
                Install App — It's Free
              </button>
            )}
            <button
              type="button"
              onClick={onEnter}
              style={{
                width: "100%",
                padding: "16px",
                background: "transparent",
                color: "#4b5563",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {canInstall ? "Continue in Browser →" : "Open App →"}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          zIndex: 1,
          marginTop: 24,
          textAlign: "center",
          opacity: animIn ? 0.5 : 0,
          transition: "opacity 0.6s ease 0.5s",
        }}
      >
        <span style={{ color: "#4b5563", fontSize: 12 }}>
          Made with ❤️ by vimal for cricket lovers
        </span>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowIOSGuide(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowIOSGuide(false)}
        >
          <div
            style={{
              background: "#0d1f0f",
              borderRadius: 28,
              padding: "32px 20px 28px",
              width: "100%",
              maxWidth: 440,
              border: "2px solid rgba(34,197,94,0.4)",
              boxShadow: "0 0 60px rgba(34,197,94,0.2)",
              textAlign: "left",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 40 }}>📱</span>
            </div>
            <div
              style={{
                color: "#22c55e",
                fontWeight: 900,
                fontSize: 22,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              Install on iPhone
            </div>
            <div
              style={{
                color: "#6b7280",
                fontSize: 13,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Follow these 3 steps in Safari:
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
                text: 'Scroll and tap "Add to Home Screen"',
              },
              {
                step: "3",
                icon: "✅",
                text: 'Tap "Add" — icon appears on your home screen!',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 12,
                  background: "rgba(34,197,94,0.08)",
                  borderRadius: 16,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: "#22c55e",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    color: "#000",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.4 }}
                >
                  <span style={{ marginRight: 4 }}>{item.icon}</span>
                  {item.text}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                onEnter();
              }}
              style={{
                width: "100%",
                marginTop: 12,
                background: "linear-gradient(135deg, #22c55e, #15803d)",
                color: "#000",
                border: "none",
                borderRadius: 16,
                padding: "18px",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Got it — Open App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
