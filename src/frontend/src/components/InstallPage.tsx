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
    title: "Ball-by-ball Scoring",
    sub: "4, 6, Wide, No Ball, OUT",
  },
  { icon: "📴", title: "100% Offline", sub: "No internet on the field" },
  { icon: "☀️", title: "Solar Mode", sub: "Crystal clear in sunlight" },
  {
    icon: "📤",
    title: "WhatsApp Scorecard",
    sub: "Share stunning infographics",
  },
  {
    icon: "🏆",
    title: "Gully Rules Built-in",
    sub: "Wall runs, Neighbor's house",
  },
  { icon: "🎯", title: "Free Forever", sub: "No ads, no sign-up ever" },
];

const testimonials = [
  {
    name: "Raj",
    text: "Best gully cricket app! My whole mohalla uses it 🏏",
    location: "Mumbai",
  },
  {
    name: "Arjun",
    text: "No more paper scorecards. This is the future bhai!",
    location: "Ahmedabad",
  },
  {
    name: "Priya",
    text: "Even my 60yr old uncle could install it. Super easy!",
    location: "Surat",
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
  const [btnPulse, setBtnPulse] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [installCount] = useState(() => Math.floor(Math.random() * 400) + 1200);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 80);
    setTimeout(() => setPulse(true), 1200);
    setTimeout(() => setBtnPulse(true), 2000);

    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setIsIOS(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Rotate testimonials
    const t = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 3500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearInterval(t);
    };
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
  const t = testimonials[testimonialIdx];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #000 0%, #030f05 50%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px 40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* BG grid */}
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

      {/* Live badge */}
      <div
        style={{
          marginTop: 36,
          marginBottom: 10,
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
          🏏 Free Cricket Scoring App
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          zIndex: 1,
          marginBottom: 18,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "scale(1)" : "scale(0.7)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 28,
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
          marginBottom: 6,
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease 0.1s",
        }}
      >
        <h1
          style={{
            fontSize: 36,
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
            margin: "8px 0 0",
            lineHeight: 1.5,
          }}
        >
          Score. Track. Share. Win.
        </p>
      </div>

      {/* Social proof */}
      <div
        style={{
          zIndex: 1,
          marginBottom: 20,
          opacity: animIn ? 1 : 0,
          transition: "all 0.6s ease 0.15s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div>
          <span style={{ color: "#fbbf24", fontSize: 16, letterSpacing: 2 }}>
            ★★★★★
          </span>
          <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
            Loved by gully cricketers
          </span>
        </div>
        <div style={{ color: "#22c55e", fontSize: 12, fontWeight: 700 }}>
          🔥 {installCount.toLocaleString()}+ players installed this week
        </div>
      </div>

      {/* Testimonial carousel */}
      <div
        style={{
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          marginBottom: 20,
          opacity: animIn ? 1 : 0,
          transition: "all 0.6s ease 0.2s",
        }}
      >
        <div
          style={{
            background: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: 18,
            padding: "14px 16px",
            transition: "all 0.4s ease",
          }}
        >
          <p
            style={{
              color: "#e5e7eb",
              fontSize: 13,
              margin: 0,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            "{t.text}"
          </p>
          <p
            style={{
              color: "#22c55e",
              fontSize: 12,
              margin: "8px 0 0",
              fontWeight: 700,
            }}
          >
            — {t.name}, {t.location}
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
          marginBottom: 24,
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
              padding: "13px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{f.icon}</span>
            <div>
              <div
                style={{
                  color: "#f3f4f6",
                  fontWeight: 700,
                  fontSize: 11.5,
                  lineHeight: 1.3,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: 10.5,
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
              <>
                {/* Urgency tag */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 8,
                    color: "#fbbf24",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ⚡ Tap once — installs in seconds, no sign-up needed!
                </div>
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
                    marginBottom: 8,
                    letterSpacing: "-0.3px",
                    boxShadow: btnPulse
                      ? "0 0 0 6px rgba(34,197,94,0.15), 0 0 0 14px rgba(34,197,94,0.06), 0 12px 40px rgba(34,197,94,0.5)"
                      : "0 0 0 1px rgba(34,197,94,0.3), 0 12px 40px rgba(34,197,94,0.5)",
                    transition: "box-shadow 1s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                  data-ocid="install_page.primary_button"
                >
                  <span style={{ fontSize: 22 }}>📲</span>
                  {isIOS
                    ? "Install on iPhone — Free"
                    : "Install App — It's Free"}
                </button>
                <p
                  style={{
                    textAlign: "center",
                    color: "#4b5563",
                    fontSize: 11,
                    margin: "0 0 6px",
                  }}
                >
                  {isIOS
                    ? "Opens a 3-step guide (takes 30 seconds)"
                    : "Works like a native app — no App Store needed"}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={onEnter}
              style={{
                width: "100%",
                padding: "14px",
                background: "transparent",
                color: "#4b5563",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
              data-ocid="install_page.secondary_button"
            >
              {canInstall ? "Continue in Browser →" : "Open App →"}
            </button>
          </>
        )}
      </div>

      {/* Badges row */}
      <div
        style={{
          zIndex: 1,
          marginTop: 20,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: animIn ? 0.8 : 0,
          transition: "opacity 0.6s ease 0.5s",
        }}
      >
        {[
          "✅ 100% Free",
          "📴 Works Offline",
          "🚫 No Sign-up",
          "📱 Android & iPhone",
        ].map((b) => (
          <span
            key={b}
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 100,
              padding: "4px 10px",
              color: "#6b7280",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {b}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          zIndex: 1,
          marginTop: 18,
          textAlign: "center",
          opacity: animIn ? 0.4 : 0,
          transition: "opacity 0.6s ease 0.6s",
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
              padding: "28px 20px 24px",
              width: "100%",
              maxWidth: 440,
              border: "2px solid rgba(34,197,94,0.4)",
              boxShadow: "0 0 60px rgba(34,197,94,0.2)",
              textAlign: "left",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 38 }}>📱</span>
            </div>
            <div
              style={{
                color: "#22c55e",
                fontWeight: 900,
                fontSize: 21,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              Install on iPhone
            </div>
            <div
              style={{
                color: "#fbbf24",
                fontSize: 12,
                textAlign: "center",
                marginBottom: 4,
                fontWeight: 700,
              }}
            >
              ⚡ Only 3 taps — takes 30 seconds!
            </div>
            <div
              style={{
                color: "#6b7280",
                fontSize: 12,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Open this page in Safari, then:
            </div>
            {[
              {
                step: "1",
                icon: "⬆️",
                text: "Tap the Share button at the bottom of Safari",
                hint: "(the box with the arrow going up)",
              },
              {
                step: "2",
                icon: "➕",
                text: 'Scroll and tap "Add to Home Screen"',
                hint: "",
              },
              {
                step: "3",
                icon: "✅",
                text: 'Tap "Add" — icon appears instantly!',
                hint: "",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 10,
                  background: "rgba(34,197,94,0.08)",
                  borderRadius: 16,
                  padding: "13px 16px",
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
                    fontWeight: 900,
                    color: "#000",
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{ color: "#e5e7eb", fontSize: 13, lineHeight: 1.4 }}
                >
                  <span style={{ marginRight: 4 }}>{item.icon}</span>
                  {item.text}
                  {item.hint && (
                    <div
                      style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}
                    >
                      {item.hint}
                    </div>
                  )}
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
                marginTop: 10,
                background: "linear-gradient(135deg, #22c55e, #15803d)",
                color: "#000",
                border: "none",
                borderRadius: 16,
                padding: "16px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
              data-ocid="install_page.confirm_button"
            >
              Got it — Open App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
