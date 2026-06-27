import { useState, useEffect } from "react";

const FLOATING_TAGS = [
  { text: "🔬 AI-Powered Analysis", style: { top: "20%", left: "4%", animationDuration: "7s" } },
  { text: "✨ Personalized Routine", style: { top: "35%", right: "4%", animationDuration: "9s", animationDelay: "1s" } },
  { text: "💧 Hydration Tracking",   style: { top: "65%", left: "6%", animationDuration: "8s", animationDelay: "2s" } },
  { text: "🧴 Expert Formulas",      style: { top: "75%", right: "6%", animationDuration: "7.5s", animationDelay: "0.5s" } },
  { text: "🌿 Clean Ingredients",    style: { top: "50%", left: "2%", animationDuration: "6.5s", animationDelay: "1.5s" } },
];

const MORPH_WORDS = ["UNDERSTOOD", "DIAGNOSED", "HEALED", "TRANSFORMED"];

export default function Hero({ onHover }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % MORPH_WORDS.length);
        setWordVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const word = MORPH_WORDS[wordIdx];

  return (
    <section id="hero" style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      position: "relative", overflow: "hidden",
      padding: "120px 48px 80px",
      textAlign: "center",
      background: "var(--navy)",
    }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(123,94,167,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 70%, rgba(255,62,127,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 20%, rgba(232,168,56,0.08) 0%, transparent 60%)",
      }} />
      {[
        { size: 400, bg: "var(--violet)", top: -100, left: -100, dur: "18s" },
        { size: 300, bg: "var(--rose)", bottom: 0, right: "5%", dur: "22s", dir: "reverse" },
        { size: 250, bg: "var(--amber)", top: "40%", left: "60%", dur: "26s" },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", width: b.size, height: b.size,
          borderRadius: "50%", background: b.bg,
          filter: "blur(80px)", opacity: 0.25,
          top: b.top, left: b.left, bottom: b.bottom, right: b.right,
          animation: `floatBlob ${b.dur} linear ${b.dir || ""} infinite`,
          zIndex: 0,
        }} />
      ))}
      {FLOATING_TAGS.map((t, i) => (
        <div key={i} style={{
          position: "absolute", zIndex: 1, pointerEvents: "none",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          borderRadius: 100,
          padding: "10px 20px",
          fontSize: 12, fontWeight: 500,
          color: "rgba(245,240,235,0.6)",
          whiteSpace: "nowrap",
          animation: `tagFloat ease-in-out infinite`,
          fontFamily: "'Space Grotesk', sans-serif",
          ...t.style,
        }}>{t.text}</div>
      ))}

      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase",
        color: "var(--rose)", marginBottom: 24, position: "relative", zIndex: 1,
        animation: "fadeUp 0.8s ease 0.3s both",
        fontFamily: "'Space Grotesk', sans-serif",
      }}>Skin Intelligence Platform</span>

      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(60px, 11vw, 160px)",
        fontWeight: 800, lineHeight: 0.9, letterSpacing: -4,
        position: "relative", zIndex: 1, marginBottom: 32,
        color: "var(--cream)",
      }}>
        {["YOUR SKIN", "FINALLY"].map((line, i) => (
          <span key={i} style={{
            display: "block",
            animation: `slideUp 0.9s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.2}s both`,
            ...(i === 1 ? { color: "transparent", WebkitTextStroke: "1.5px rgba(245,240,235,0.4)" } : {}),
          }}>{line}</span>
        ))}
        <span
          className="glitch-parent"
          data-text={word}
          style={{
            display: "block",
            animation: `slideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.9s both`,
            background: "linear-gradient(135deg, var(--rose) 0%, var(--violet) 60%, var(--amber) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            opacity: wordVisible ? 1 : 0,
            transform: wordVisible ? "translateY(0) skewX(0deg)" : "translateY(10px) skewX(-5deg)",
            transition: "opacity 0.4s, transform 0.4s",
          }}
        >{word}</span>
      </h1>

      <p style={{
        fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(245,240,235,0.55)",
        maxWidth: 520, lineHeight: 1.7, fontWeight: 400,
        marginBottom: 48, position: "relative", zIndex: 1,
        animation: "fadeUp 0.8s ease 1.2s both",
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        Precision diagnostics for acne, hair fall, dark spots, pigmentation and more — powered by dermatologist-trained AI.
      </p>

      <div style={{
        display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
        position: "relative", zIndex: 1,
        animation: "fadeUp 0.8s ease 1.4s both",
      }}>
        <a href="#conditions"
          onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
          style={{
            background: "linear-gradient(135deg, var(--rose), var(--violet))",
            color: "#fff", border: "none", padding: "18px 40px",
            borderRadius: 100, fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 16, fontWeight: 600, textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.3s", display: "inline-block",
          }}
          onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(255,62,127,0.4)"; }}
          onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
        >Analyze My Skin Free</a>
        <a href="#conditions"
          onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
          style={{
            background: "transparent", color: "var(--cream)",
            border: "1px solid rgba(245,240,235,0.2)", padding: "18px 40px",
            borderRadius: 100, fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 16, fontWeight: 500, textDecoration: "none",
            transition: "border-color 0.2s, background 0.2s", display: "inline-block",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(245,240,235,0.5)"; e.currentTarget.style.background = "rgba(245,240,235,0.05)"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(245,240,235,0.2)"; e.currentTarget.style.background = "transparent"; }}
        >Explore Conditions</a>
      </div>

      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "fadeUp 0.8s ease 2s both", zIndex: 1,
      }}>
        <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--muted)", fontFamily: "'Space Grotesk', sans-serif" }}>scroll</span>
        <div style={{
          width: 1, height: 60,
          background: "linear-gradient(to bottom, var(--rose), transparent)",
          animation: "scrollPulse 2s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}