"use client";

import { useState, useCallback } from "react";

const THEME = {
  navy: "#0A0A1A",
  offWhite: "#F5F0EB",
  acidRose: "#FF3E7F",
  violet: "#7B5EA7",
  amber: "#E8A838",
};

// --- INCI Safety Database (subset) ---
const SAFETY_DB = {
  "ALCOHOL DENAT": { comedogenicity: 0, irritancy: 4, flag: "danger", note: "Strong irritant; disrupts skin barrier" },
  "FRAGRANCE": { comedogenicity: 1, irritancy: 4, flag: "danger", note: "Common allergen & sensitizer" },
  "PARFUM": { comedogenicity: 1, irritancy: 4, flag: "danger", note: "Common allergen & sensitizer" },
  "SODIUM LAURYL SULFATE": { comedogenicity: 0, irritancy: 5, flag: "danger", note: "Aggressive surfactant" },
  "SLS": { comedogenicity: 0, irritancy: 5, flag: "danger", note: "Aggressive surfactant" },
  "PARABENS": { comedogenicity: 0, irritancy: 2, flag: "warning", note: "Endocrine disruption concern" },
  "METHYLPARABEN": { comedogenicity: 0, irritancy: 2, flag: "warning", note: "Endocrine disruption concern" },
  "PROPYLPARABEN": { comedogenicity: 0, irritancy: 2, flag: "warning", note: "Endocrine disruption concern" },
  "COCONUT OIL": { comedogenicity: 4, irritancy: 0, flag: "warning", note: "High comedogenic rating" },
  "ISOPROPYL MYRISTATE": { comedogenicity: 5, irritancy: 1, flag: "danger", note: "Highly comedogenic" },
  "LANOLIN": { comedogenicity: 1, irritancy: 2, flag: "warning", note: "Potential allergen" },
  "RETINOL": { comedogenicity: 0, irritancy: 3, flag: "warning", note: "Photosensitizing; use PM only" },
  "ASCORBIC ACID": { comedogenicity: 0, irritancy: 2, flag: "info", note: "Vitamin C — pH sensitive" },
  "NIACINAMIDE": { comedogenicity: 0, irritancy: 0, flag: null, note: "Excellent skin-compatible" },
  "HYALURONIC ACID": { comedogenicity: 0, irritancy: 0, flag: null, note: "Non-comedogenic humectant" },
  "CERAMIDE": { comedogenicity: 0, irritancy: 0, flag: null, note: "Barrier-supportive" },
  "GLYCERIN": { comedogenicity: 0, irritancy: 0, flag: null, note: "Safe humectant" },
  "ZINC OXIDE": { comedogenicity: 0, irritancy: 0, flag: null, note: "Safe physical UV filter" },
  "TITANIUM DIOXIDE": { comedogenicity: 0, irritancy: 0, flag: null, note: "Safe physical UV filter" },
  "WATER": { comedogenicity: 0, irritancy: 0, flag: null, note: "Inert solvent" },
  "AQUA": { comedogenicity: 0, irritancy: 0, flag: null, note: "Inert solvent" },
  "DIMETHICONE": { comedogenicity: 1, irritancy: 0, flag: null, note: "Occlusive silicone" },
  "CYCLOPENTASILOXANE": { comedogenicity: 0, irritancy: 0, flag: null, note: "Light silicone carrier" },
  "SALICYLIC ACID": { comedogenicity: 0, irritancy: 2, flag: "info", note: "BHA — avoid around eyes" },
  "BENZOYL PEROXIDE": { comedogenicity: 0, irritancy: 3, flag: "warning", note: "Strong oxidizer; bleaches fabric" },
  "LIMONENE": { comedogenicity: 0, irritancy: 3, flag: "warning", note: "Oxidizes to allergen on air exposure" },
  "LINALOOL": { comedogenicity: 0, irritancy: 3, flag: "warning", note: "Fragrance allergen (EU regulated)" },
};

const SAMPLE_INGREDIENTS = "Aqua, Niacinamide, Glycerin, Dimethicone, Isopropyl Myristate, Fragrance, Methylparaben, Retinol, Zinc Oxide, Limonene";

// --- Inline SVGs ---
const IconFlask = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={THEME.violet} strokeWidth="1.5" strokeLinecap="round">
    <path d="M9 3h6M9 3v8L4.5 19a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L15 11V3"/>
    <line x1="6" y1="14" x2="18" y2="14"/>
  </svg>
);

const IconStar = ({ filled, color }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconGemini = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={THEME.offWhite} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={THEME.offWhite} strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

// --- Score Dots ---
function ScoreDots({ value, max = 5, color }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <IconStar key={i} filled={i < value} color={color} />
      ))}
    </div>
  );
}

// --- Flag Chip ---
function FlagChip({ flag }) {
  if (!flag) return null;
  const map = {
    danger: { bg: "rgba(255,62,127,0.14)", border: THEME.acidRose, text: THEME.acidRose, label: "⚠ HIGH" },
    warning: { bg: "rgba(232,168,56,0.14)", border: THEME.amber, text: THEME.amber, label: "◈ MOD" },
    info: { bg: "rgba(123,94,167,0.14)", border: THEME.violet, text: THEME.violet, label: "◉ NOTE" },
  };
  const c = map[flag];
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, borderRadius: 3, padding: "2px 5px",
    }}>
      {c.label}
    </span>
  );
}

// --- Skeleton ---
function Skeleton({ h = 12, w = "100%", mb = 8 }) {
  return (
    <div style={{
      height: h, width: w, marginBottom: mb,
      background: "rgba(245,240,235,0.06)",
      borderRadius: 4,
      animation: "dermPulse 1.8s ease-in-out infinite",
    }} />
  );
}

// --- Makeup API Product Card ---
function AlternativeCard({ product }) {
  return (
    <div style={{
      minWidth: 160,
      maxWidth: 180,
      background: "rgba(245,240,235,0.04)",
      border: "1px solid rgba(245,240,235,0.08)",
      borderRadius: 10,
      padding: 12,
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = `${THEME.violet}44`;
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "rgba(245,240,235,0.08)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
    >
      {product.image_link && (
        <img
          src={product.image_link}
          alt={product.name}
          style={{ width: "100%", height: 80, objectFit: "contain", borderRadius: 6, marginBottom: 8, background: "rgba(245,240,235,0.04)" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      )}
      <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.3, marginBottom: 3, color: THEME.offWhite }}>{product.name}</div>
      <div style={{ fontSize: 9, color: THEME.violet, marginBottom: 6, opacity: 0.8 }}>{product.brand}</div>
      {product.price && (
        <div style={{ fontSize: 10, color: THEME.amber, fontWeight: 700 }}>${product.price}</div>
      )}
      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 6 }}>
        {product.vegan && <span style={{ fontSize: 7, padding: "1px 4px", background: "rgba(123,94,167,0.15)", border: "1px solid rgba(123,94,167,0.3)", borderRadius: 2, color: THEME.violet, letterSpacing: "0.08em" }}>VEGAN</span>}
        {product.natural && <span style={{ fontSize: 7, padding: "1px 4px", background: "rgba(232,168,56,0.12)", border: "1px solid rgba(232,168,56,0.3)", borderRadius: 2, color: THEME.amber, letterSpacing: "0.08em" }}>NATURAL</span>}
      </div>
    </div>
  );
}

// --- Tab Button ---
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(123,94,167,0.2)" : "transparent",
        border: `1px solid ${active ? THEME.violet : "rgba(245,240,235,0.08)"}`,
        borderRadius: 6,
        padding: "5px 12px",
        color: active ? THEME.offWhite : `${THEME.offWhite}55`,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

export default function IngredientSafetyAnalyzer() {
  const [inputText, setInputText] = useState(SAMPLE_INGREDIENTS);
  const [analyzed, setAnalyzed] = useState(null);
  const [altLoading, setAltLoading] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [altFilter, setAltFilter] = useState("vegan");
  const [altError, setAltError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("scoreboard"); // scoreboard | alternatives | compiler

  const analyze = useCallback(() => {
    const raw = inputText.trim();
    if (!raw) return;
    const list = raw.split(/,|;|\n/).map(s => s.trim()).filter(Boolean);
    const results = list.map(name => {
      const key = name.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
      const match = Object.entries(SAFETY_DB).find(([k]) => key.includes(k) || k.includes(key));
      if (match) {
        return { name, ...match[1], matched: true };
      }
      // Unknown: mild defaults
      return { name, comedogenicity: 0, irritancy: 0, flag: null, note: "No data — likely safe", matched: false };
    });
    setAnalyzed(results);
    setActiveTab("scoreboard");
  }, [inputText]);

  const fetchAlternatives = useCallback(async (filter) => {
    setAltLoading(true);
    setAltError(null);
    setAlternatives([]);
    try {
      const url = `https://makeup-api.herokuapp.com/api/v1/products.json?${filter}=true&product_type=moisturizer`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Makeup API unavailable");
      const data = await res.json();
      setAlternatives(data.slice(0, 12));
    } catch (e) {
      setAltError("Could not reach Makeup API. It may be temporarily unavailable.");
    } finally {
      setAltLoading(false);
    }
  }, []);

  const handleAltFilterChange = (f) => {
    setAltFilter(f);
    fetchAlternatives(f);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "alternatives" && alternatives.length === 0 && !altLoading) {
      fetchAlternatives(altFilter);
    }
  };

  // Derive scoreboard stats
  const dangerCount = analyzed?.filter(i => i.flag === "danger").length || 0;
  const warningCount = analyzed?.filter(i => i.flag === "warning").length || 0;
  const avgComedogenicity = analyzed ? Math.round((analyzed.reduce((s, i) => s + i.comedogenicity, 0) / analyzed.length) * 10) / 10 : null;
  const avgIrritancy = analyzed ? Math.round((analyzed.reduce((s, i) => s + i.irritancy, 0) / analyzed.length) * 10) / 10 : null;

  // Gemini compiler text
  const geminiText = analyzed ? `[DermAI Ingredient Safety Analysis]
Ingredients analyzed: ${analyzed.length}
High-risk flags: ${dangerCount} | Moderate warnings: ${warningCount}
Avg Comedogenicity: ${avgComedogenicity}/5 | Avg Irritancy: ${avgIrritancy}/5

FLAGGED INGREDIENTS:
${analyzed.filter(i => i.flag).map(i => `- ${i.name.toUpperCase()}: Comedogenicity ${i.comedogenicity}/5, Irritancy ${i.irritancy}/5. Note: ${i.note}`).join("\n")}

RAW INCI:
${analyzed.map(i => i.name).join(", ")}

[Prompt: Based on the flagged ingredients above, provide personalized clean-beauty switch-out recommendations and explain the safety concerns for each flagged ingredient.]` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(geminiText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <style>{`
        @keyframes dermPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        .derm-scroll::-webkit-scrollbar { height: 4px; }
        .derm-scroll::-webkit-scrollbar-track { background: transparent; }
        .derm-scroll::-webkit-scrollbar-thumb { background: rgba(123,94,167,0.4); border-radius: 2px; }
        .derm-analyze-btn:hover {
          background: rgba(255,62,127,0.22) !important;
          border-color: ${THEME.acidRose} !important;
        }
        .derm-ingredient-row:hover {
          background: rgba(245,240,235,0.04) !important;
        }
      `}</style>

      <div style={{
        background: "rgba(10,10,26,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(245,240,235,0.10)",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 800,
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        color: THEME.offWhite,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: -80, right: -80, width: 280, height: 280,
          background: `radial-gradient(circle, ${THEME.amber}0D 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <IconFlask />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>INGREDIENT SAFETY ANALYZER</div>
            <div style={{ fontSize: 9, opacity: 0.4, letterSpacing: "0.1em" }}>INCI PARSER · FORMULATION AUDIT · CLEAN-BEAUTY ENGINE</div>
          </div>
        </div>

        {/* Input area */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, opacity: 0.35, letterSpacing: "0.1em", marginBottom: 6 }}>PASTE INCI INGREDIENT LIST (comma or semicolon separated)</div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={3}
            placeholder="e.g. Aqua, Niacinamide, Glycerin, Fragrance, Retinol..."
            style={{
              width: "100%",
              background: "rgba(245,240,235,0.04)",
              border: "1px solid rgba(245,240,235,0.10)",
              borderRadius: 8,
              padding: "10px 12px",
              color: THEME.offWhite,
              fontSize: 11,
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
              lineHeight: 1.6,
              letterSpacing: "0.03em",
            }}
            onFocus={e => { e.target.style.borderColor = THEME.violet; }}
            onBlur={e => { e.target.style.borderColor = "rgba(245,240,235,0.10)"; }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button
            className="derm-analyze-btn"
            onClick={analyze}
            style={{
              background: "rgba(255,62,127,0.12)",
              border: `1px solid ${THEME.acidRose}55`,
              borderRadius: 8,
              padding: "9px 20px",
              color: THEME.acidRose,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              fontFamily: "inherit",
            }}
          >
            ◎ RUN SAFETY AUDIT
          </button>

          {analyzed && (
            <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
              <span style={{ color: THEME.acidRose }}>⚠ {dangerCount} HIGH-RISK</span>
              <span style={{ color: THEME.amber }}>◈ {warningCount} WARNINGS</span>
              <span style={{ opacity: 0.4 }}>{analyzed.length} TOTAL</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        {analyzed && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              <Tab active={activeTab === "scoreboard"} onClick={() => handleTabChange("scoreboard")}>SCOREBOARD</Tab>
              <Tab active={activeTab === "alternatives"} onClick={() => handleTabChange("alternatives")}>ALTERNATIVES</Tab>
              <Tab active={activeTab === "compiler"} onClick={() => handleTabChange("compiler")}>GEMINI COMPILER</Tab>
            </div>

            {/* === SCOREBOARD TAB === */}
            {activeTab === "scoreboard" && (
              <div>
                {/* Summary row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "AVG COMEDOGENICITY", value: avgComedogenicity, max: 5, color: THEME.acidRose },
                    { label: "AVG IRRITANCY", value: avgIrritancy, max: 5, color: THEME.amber },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: "rgba(245,240,235,0.04)",
                      border: "1px solid rgba(245,240,235,0.07)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}>
                      <div style={{ fontSize: 8, opacity: 0.4, letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
                        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          <ScoreDots value={Math.round(s.value)} max={5} color={s.color} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ingredient table */}
                <div style={{ maxHeight: 340, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${THEME.violet}44 transparent` }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(245,240,235,0.06)" }}>
                        {["INGREDIENT", "COMEDOGENICITY", "IRRITANCY", "FLAG", "NOTE"].map(h => (
                          <th key={h} style={{
                            fontSize: 8, letterSpacing: "0.1em", opacity: 0.35,
                            padding: "6px 8px", textAlign: "left", fontWeight: 600, color: THEME.offWhite,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analyzed.map((ing, i) => (
                        <tr
                          key={i}
                          className="derm-ingredient-row"
                          style={{
                            borderBottom: "1px solid rgba(245,240,235,0.04)",
                            background: ing.flag === "danger"
                              ? "rgba(255,62,127,0.04)"
                              : ing.flag === "warning"
                              ? "rgba(232,168,56,0.03)"
                              : "transparent",
                            transition: "background 0.15s",
                          }}
                        >
                          <td style={{ padding: "8px 8px", fontFamily: "monospace", fontSize: 10, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ing.name}
                          </td>
                          <td style={{ padding: "8px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <ScoreDots value={ing.comedogenicity} max={5} color={THEME.acidRose} />
                              <span style={{ fontSize: 9, opacity: 0.5 }}>{ing.comedogenicity}</span>
                            </div>
                          </td>
                          <td style={{ padding: "8px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <ScoreDots value={ing.irritancy} max={5} color={THEME.amber} />
                              <span style={{ fontSize: 9, opacity: 0.5 }}>{ing.irritancy}</span>
                            </div>
                          </td>
                          <td style={{ padding: "8px 8px" }}><FlagChip flag={ing.flag} /></td>
                          <td style={{ padding: "8px 8px", fontSize: 9, opacity: 0.5, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ing.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === ALTERNATIVES TAB === */}
            {activeTab === "alternatives" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {[
                    { key: "vegan", label: "VEGAN" },
                    { key: "natural", label: "NATURAL" },
                    { key: "gluten_free", label: "GLUTEN-FREE" },
                    { key: "organic", label: "ORGANIC" },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => handleAltFilterChange(f.key)}
                      style={{
                        background: altFilter === f.key ? "rgba(123,94,167,0.2)" : "transparent",
                        border: `1px solid ${altFilter === f.key ? THEME.violet : "rgba(245,240,235,0.08)"}`,
                        borderRadius: 5,
                        padding: "4px 10px",
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        color: altFilter === f.key ? THEME.offWhite : `${THEME.offWhite}44`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {altLoading && (
                  <div style={{ display: "flex", gap: 10, overflow: "hidden" }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} h={160} w={160} mb={0} />)}
                  </div>
                )}

                {altError && (
                  <div style={{ fontSize: 11, color: THEME.acidRose, padding: "20px 0" }}>{altError}</div>
                )}

                {!altLoading && !altError && alternatives.length > 0 && (
                  <div
                    className="derm-scroll"
                    style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}
                  >
                    {alternatives.map(p => <AlternativeCard key={p.id} product={p} />)}
                  </div>
                )}

                {!altLoading && !altError && alternatives.length === 0 && (
                  <div style={{ fontSize: 11, opacity: 0.4, padding: "20px 0" }}>No results found for this filter.</div>
                )}
              </div>
            )}

            {/* === GEMINI COMPILER TAB === */}
            {activeTab === "compiler" && (
              <div>
                <div style={{ fontSize: 9, opacity: 0.35, letterSpacing: "0.1em", marginBottom: 10 }}>
                  STRUCTURED PROMPT READY FOR GEMINI LLM INJECTION
                </div>
                <div style={{
                  background: "rgba(245,240,235,0.03)",
                  border: "1px solid rgba(245,240,235,0.08)",
                  borderRadius: 8,
                  padding: 14,
                  maxHeight: 280,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${THEME.violet}44 transparent`,
                  marginBottom: 12,
                }}>
                  <pre style={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    color: THEME.offWhite,
                    opacity: 0.75,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                    lineHeight: 1.7,
                  }}>{geminiText}</pre>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? "rgba(123,94,167,0.25)" : "rgba(123,94,167,0.12)",
                      border: `1px solid ${THEME.violet}55`,
                      borderRadius: 7,
                      padding: "8px 16px",
                      color: THEME.offWhite,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "background 0.2s",
                      fontFamily: "inherit",
                    }}
                  >
                    <IconCopy />
                    {copied ? "COPIED ✓" : "COPY PROMPT"}
                  </button>
                  <button
                    style={{
                      background: "rgba(255,62,127,0.10)",
                      border: `1px solid ${THEME.acidRose}44`,
                      borderRadius: 7,
                      padding: "8px 16px",
                      color: THEME.acidRose,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "inherit",
                    }}
                  >
                    <IconGemini />
                    SEND TO GEMINI
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Idle state */}
        {!analyzed && (
          <div style={{ textAlign: "center", opacity: 0.3, padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧪</div>
            <div style={{ fontSize: 11, lineHeight: 1.6 }}>
              Paste an INCI ingredient list above<br />and run the safety audit to begin.
            </div>
          </div>
        )}
      </div>
    </>
  );
}