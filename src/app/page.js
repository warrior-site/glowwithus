"use client"

import { useState, useEffect, useCallback } from "react";
import "./styles/homeHero.css";

// Import Custom Modular Components
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Conditions from "./components/Condition";
import BigText from "./components/BigText";
import StatBlock from "./components/StatBlock";
import Process from "./components/Process";
import CTA from "./components/CTA";

const STATS = [
  { number: 94, suffix: "% accuracy", label: "in skin condition identification vs. clinical dermatologist benchmark" },
  { number: 2,  suffix: "M+ users",   label: "across India tracking their skin transformation" },
  { number: 84, suffix: "% improve",  label: "their primary skin concern within 8 weeks" },
  { number: 12, suffix: "conditions", label: "from acne to hair fall, covered by our diagnostic engine" },
];

export default function App() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorExpanded, setCursorExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const style = document.createElement("style");
    document.head.appendChild(style);
    document.body.style.background = "#08081A";
    document.body.style.color = "#F5F0EB";
    document.body.style.fontFamily = "'Space Grotesk', sans-serif";
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const onMove = e => setCursorPos({ x: e.clientX, y: e.clientY });
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);

  const onHover = useCallback(v => setCursorExpanded(v), []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <Cursor pos={cursorPos} expanded={cursorExpanded} />
      <Nav onHoverLink={onHover} />
      <Hero onHover={onHover} />
      <Marquee />
      <Conditions onHover={onHover} />
      <BigText scrollY={scrollY} />

      {/* Stats Section */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: "0 0" }}>
        {STATS.map((s, i) => <StatBlock key={i} {...s} index={i} />)}
      </section>

      <Process />
      <CTA onHover={onHover} />

      {/* Footer */}
      <footer style={{
        padding: "60px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24,
        background: "var(--navy)",
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
          background: "linear-gradient(135deg, var(--rose), var(--violet))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>DERMA</div>
        <ul style={{ display: "flex", gap: 32, listStyle: "none", flexWrap: "wrap" }}>
          {["Privacy","Terms","Blog","Careers","Contact"].map(l => (
            <li key={l}><a href="#" style={{ color: "rgba(245,240,235,0.4)", textDecoration: "none", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", transition: "color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.color = "var(--cream)"}
              onMouseOut={e => e.currentTarget.style.color = "rgba(245,240,235,0.4)"}
            >{l}</a></li>
          ))}
        </ul>
        <span style={{ color: "rgba(245,240,235,0.25)", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>© 2026 Derma Inc.</span>
      </footer>
    </div>
  );
}