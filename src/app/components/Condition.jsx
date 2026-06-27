import { useInView } from "../hooks/useInView";
import ConditionCard from "./ConditionCard";

const CONDITIONS = [
  { icon: "💥", title: "Acne & Breakouts",    desc: "From whiteheads to cystic acne — we map your triggers and build a targeted protocol around your skin's unique chemistry.", accent: "#FF3E7F" },
  { icon: "🌀", title: "Hair Fall & Thinning", desc: "Scalp health, DHT sensitivity, nutrient deficiencies — our AI identifies root causes, not just symptoms.", accent: "#7B5EA7" },
  { icon: "🌑", title: "Dark Spots & Melasma", desc: "Post-inflammatory hyperpigmentation, sun damage, hormonal melasma. We target the right pathway for your skin tone.", accent: "#E8A838" },
  { icon: "💧", title: "Oily & Pore Congestion",desc: "Regulating sebum without stripping the barrier. We rebuild — not just blot — for lasting balance.", accent: "#3EC6FF" },
  { icon: "🌸", title: "Rosacea & Redness",    desc: "Calm reactive, chronically flushed skin. Trigger mapping, anti-inflammatory routines, and barrier repair.", accent: "#7BEA7F" },
  { icon: "🧩", title: "Uneven Texture & Tone", desc: "Refine rough patches, enlarged pores, and dull tone with actives that actually penetrate and resurface at depth.", accent: "#FF6B3E" },
];

export default function Conditions({ onHover }) {
  const [labelRef, labelVisible] = useInView();
  const [titleRef, titleVisible] = useInView();
  return (
    <section id="conditions" style={{ padding: "140px 48px", background: "var(--navy)" }}>
      <span ref={labelRef} style={{
        fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--rose)",
        marginBottom: 24, display: "block",
        opacity: labelVisible ? 1 : 0, transform: labelVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s, transform 0.6s", fontFamily: "'Space Grotesk', sans-serif",
      }}>Skin Conditions We Treat</span>
      <h2 ref={titleRef} style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(40px, 6vw, 88px)", fontWeight: 800, lineHeight: 1, letterSpacing: -2,
        marginBottom: 80, maxWidth: 800, color: "var(--cream)",
        opacity: titleVisible ? 1 : 0, transform: titleVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s 0.2s, transform 0.8s 0.2s",
      }}>
        Every problem<br />has a <span style={{ color: "var(--rose)" }}>solution.</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {CONDITIONS.map((c, i) => <ConditionCard key={i} condition={c} index={i} onHover={onHover} />)}
      </div>
    </section>
  );
}