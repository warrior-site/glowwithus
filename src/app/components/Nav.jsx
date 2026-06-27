import Link from "next/link";

export default function Nav({ onHoverLink }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "24px 48px",
      backdropFilter: "blur(20px)",
      background: "rgba(8,8,26,0.6)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: -1,
        background: "linear-gradient(135deg, var(--rose), var(--violet))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>DERMA</div>
      <ul style={{ display: "flex", gap: 40, listStyle: "none" }}>
        {["Conditions", "How it Works", "Results"].map(l => (
          <li key={l}><a
            href={`#${l.toLowerCase().replace(/ /g,"-")}`}
            onMouseEnter={() => onHoverLink(true)}
            onMouseLeave={() => onHoverLink(false)}
            style={{ color: "rgba(245,240,235,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500, letterSpacing: 0.5, transition: "color 0.3s", fontFamily: "'Space Grotesk', sans-serif" }}
          >{l}</a></li>
        ))}
      </ul>
      <Link href={"/facial-analysis"}>
      <button
        onMouseEnter={() => onHoverLink(true)}
        onMouseLeave={() => onHoverLink(false)}
        style={{
          background: "var(--rose)", color: "#fff", border: "none",
          padding: "12px 28px", borderRadius: 100,
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14,
          cursor: "none", transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseOver={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(255,62,127,0.5)"; }}
        onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
      >Get Skin Analysis</button>
      </Link>
      
    </nav>
  );
}