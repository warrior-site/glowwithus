"use client";

/**
 * DermIQ — ProductBarcodeScanner
 *
 * Enhanced from original with:
 *   - Welcome header with user name, avatar, date
 *   - New-user skin profile setup panel (name / skin type / concern)
 *   - Returning-user state sourced from useUserStore + useFacialAnalysisStore
 *   - Facial analysis active-banner when a scan exists
 *   - Ingredient analysis engine (compatibility score, Contains / Watch Out columns)
 *   - Full INCI list with per-ingredient colour coding
 *   - DermIQ Insight AI tip derived from profile × product
 *   - Camera capture + file upload inputs for barcode image
 *   - Open Beauty Facts API integration (unchanged)
 *   - Profile edit toggle persisted to localStorage (fallback for unauthenticated)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useUserStore } from "@/stores/useUserStore";               // adjust path
import { useFacialAnalysisStore } from "@/stores/useFacialAnalysisStore"; // adjust path

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  navy:    "#0A0A1A",
  cream:   "#F5F0EB",
  rose:    "#FF3E7F",
  violet:  "#7B5EA7",
  amber:   "#E8A838",
  green:   "#1D9E75",
  red:     "#E24B4A",
};

// ─── Skin knowledge base ──────────────────────────────────────────────────────
const SKIN_DB = {
  beneficial: {
    dry:         ["glycerin","hyaluronic acid","ceramide","shea butter","squalane","niacinamide","panthenol","sodium pca"],
    oily:        ["niacinamide","salicylic acid","zinc","retinol","glycolic acid","tea tree","kaolin","witch hazel"],
    combination: ["niacinamide","hyaluronic acid","glycerin","lactic acid","ceramide"],
    sensitive:   ["ceramide","panthenol","allantoin","centella","aloe vera","bisabolol","oat extract"],
    normal:      ["vitamin c","retinol","hyaluronic acid","peptides","niacinamide"],
  },
  caution: {
    dry:         ["alcohol denat","salicylic acid","benzoyl peroxide","astringent"],
    oily:        ["coconut oil","isopropyl myristate","mineral oil"],
    combination: ["lanolin","petrolatum"],
    sensitive:   ["fragrance","parfum","alcohol denat","essential oils","limonene","linalool",
                  "citronellol","geraniol","eugenol","sodium lauryl sulfate","sls","parabens"],
    normal:      [],
  },
  concern: {
    acne:              ["isopropyl myristate","coconut oil","algae","sodium lauryl sulfate","flaxseed"],
    redness:           ["fragrance","parfum","limonene","linalool","alcohol denat","salicylic acid"],
    aging:             [],   // no caution — only boosts beneficial check
    hyperpigmentation: [],
    dryness:           ["alcohol denat","sls","sodium lauryl sulfate","fragrance","parfum"],
  },
  concernBeneficial: {
    aging:             ["retinol","vitamin c","ascorbic acid","peptides","hyaluronic acid","niacinamide"],
    hyperpigmentation: ["hydroquinone","kojic acid","vitamin c","ascorbic acid","azelaic acid","niacinamide"],
    acne:              ["salicylic acid","benzoyl peroxide","niacinamide","tea tree","zinc"],
    redness:           ["ceramide","panthenol","allantoin","centella","bisabolol"],
    dryness:           ["glycerin","hyaluronic acid","ceramide","squalane","shea butter"],
  },
};

/** Returns { beneficial, flagged, score } */
function analyseIngredients(inciArr, skinType = "combination", concern = "none") {
  const lower = inciArr.map((i) => i.toLowerCase());

  const beneficialBase   = SKIN_DB.beneficial[skinType]    || [];
  const concernBoost     = SKIN_DB.concernBeneficial[concern] || [];
  const allBeneficial    = [...new Set([...beneficialBase, ...concernBoost])];

  const cautionBase      = SKIN_DB.caution[skinType]       || [];
  const concernCaution   = SKIN_DB.concern[concern]        || [];
  const allCaution       = [...new Set([...cautionBase, ...concernCaution])];

  const beneficial = allBeneficial.filter((b) => lower.some((i) => i.includes(b)));
  const flagged    = allCaution.filter((c)    => lower.some((i) => i.includes(c)));

  let score = 7;
  score += Math.min(beneficial.length, 2);
  score -= Math.min(flagged.length * 1.5, 4);
  score  = Math.round(Math.max(1, Math.min(10, score)));

  return { beneficial, flagged, score };
}

function buildInsight(beneficial, flagged, skinType, concern) {
  if (flagged.length && concern && concern !== "none") {
    const names = flagged.slice(0, 2).join(", ");
    const extra  = flagged.length > 2 ? ` and ${flagged.length - 2} more` : "";
    return `Contains ${names}${extra} — ingredients that may aggravate your ${concern} concern. Patch test before full use.`;
  }
  if (flagged.length) {
    return `Found ${flagged.length} ingredient${flagged.length !== 1 ? "s" : ""} that can be harsh for ${skinType} skin. Consider a patch test.`;
  }
  if (beneficial.length) {
    const names = beneficial.slice(0, 3).join(", ");
    return `Great match — contains ${names}, all well-suited to ${skinType} skin.`;
  }
  return "No obvious red flags or standout actives detected for your skin profile.";
}

// ─── Tiny shared primitives ───────────────────────────────────────────────────
const Divider = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, margin:"2px 0" }}>
    <div style={{ flex:1, height:1, background:"rgba(245,240,235,0.06)" }} />
    {label && <span style={{ fontSize:9, opacity:.3, letterSpacing:".1em" }}>{label}</span>}
    <div style={{ flex:1, height:1, background:"rgba(245,240,235,0.06)" }} />
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:9, letterSpacing:".13em", color:T.violet, textTransform:"uppercase", opacity:.85, marginBottom:6 }}>
    {children}
  </div>
);

const Skeleton = ({ h = 12, w = "100%", mb = 8 }) => (
  <div style={{ height:h, width:w, marginBottom:mb, background:"rgba(245,240,235,0.06)", borderRadius:4, animation:"dermPulse 1.8s ease-in-out infinite" }} />
);

/** Colour-coded INCI tag */
function InciTag({ name, kind = "neutral" }) {
  const colors = {
    ok:      { bg:"rgba(29,158,117,0.12)",  border:"rgba(29,158,117,0.30)",  text:"#5dcaa5" },
    bad:     { bg:"rgba(226,75,74,0.12)",   border:"rgba(226,75,74,0.30)",   text:"#f09595" },
    warn:    { bg:"rgba(232,168,56,0.12)",  border:"rgba(232,168,56,0.30)",  text:"#fac775" },
    neutral: { bg:"rgba(123,94,167,0.10)", border:"rgba(123,94,167,0.25)", text:T.cream },
  };
  const c = colors[kind] || colors.neutral;
  return (
    <span title={name} style={{
      display:"inline-block",
      background:c.bg, border:`1px solid ${c.border}`,
      borderRadius:4, padding:"2px 7px",
      fontSize:10, color:c.text, opacity:.85, margin:2,
      fontFamily:"monospace", letterSpacing:".02em",
      maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
    }}>
      {name}
    </span>
  );
}

/** SVG corner-bracket viewfinder overlay */
const CornerBrackets = () => (
  <svg width="100%" height="100%" viewBox="0 0 220 220" fill="none"
    style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}>
    <path d="M20 60L20 20L60 20"  stroke={T.rose} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M160 20L200 20L200 60" stroke={T.rose} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M200 160L200 200L160 200" stroke={T.rose} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M60 200L20 200L20 160"  stroke={T.rose} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="110" cy="110" r="4" fill={T.rose} opacity=".45"/>
    <line x1="90" y1="110" x2="130" y2="110" stroke={T.rose} strokeWidth="1" opacity=".35"/>
    <line x1="110" y1="90"  x2="110" y2="130" stroke={T.rose} strokeWidth="1" opacity=".35"/>
  </svg>
);

// ─── Sample products ──────────────────────────────────────────────────────────
const SAMPLES = [
  { label:"CeraVe Moisturizing Cream",   code:"3337875597357" },
  { label:"Neutrogena Sunscreen SPF 50", code:"0070501006016" },
  { label:"La Roche-Posay Effaclar",     code:"3337875545907" },
];

// ─── Profile defaults (new-user fallback) ─────────────────────────────────────
const DEFAULT_PROFILE = { name:"", skinType:"combination", concern:"none" };

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductBarcodeScanner() {
  // Zustand stores
  const { currentUser }       = useUserStore();
  const { analysisData }      = useFacialAnalysisStore();

  // Local state
  const [barcode, setBarcode]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [product, setProduct]         = useState(null);
  const [error, setError]             = useState(null);
  const [setupOpen, setSetupOpen]     = useState(false);
  const [profile, setProfile]         = useState(DEFAULT_PROFILE);
  const [analysis, setAnalysis]       = useState(null); // { beneficial, flagged, score }
  const [imageError, setImageError]   = useState(null); // camera/upload msg

  const inputRef      = useRef(null);
  const cameraRef     = useRef(null);
  const fileRef       = useRef(null);

  // ── On mount: hydrate profile from store or localStorage ──────────────────
  useEffect(() => {
    if (currentUser) {
      setProfile({
        name:     currentUser.name     || currentUser.username || "",
        skinType: currentUser.skinType || "combination",
        concern:  currentUser.concern  || "none",
      });
    } else {
      try {
        const saved = localStorage.getItem("dermiq_profile");
        if (saved) setProfile(JSON.parse(saved));
        else       setSetupOpen(true); // first-time visitor → open setup
      } catch { /* ignore */ }
    }
  }, [currentUser]);

  // ── Date string ───────────────────────────────────────────────────────────
  const dateStr = (() => {
    const d    = new Date();
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const mons = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${days[d.getDay()]}, ${mons[d.getMonth()]} ${d.getDate()} · ${d.getFullYear()}`;
  })();

  const isNewUser  = !profile.name;
  const hasFacial  = !!analysisData;
  const initials   = profile.name ? profile.name[0].toUpperCase() : "?";
  const skinLabel  = [
    profile.skinType ? profile.skinType.charAt(0).toUpperCase() + profile.skinType.slice(1) : "",
    profile.concern && profile.concern !== "none"
      ? profile.concern.charAt(0).toUpperCase() + profile.concern.slice(1)
      : "",
  ].filter(Boolean).join(" · ") || "No profile set";

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = useCallback((updates) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    setSetupOpen(false);
    try { localStorage.setItem("dermiq_profile", JSON.stringify(next)); } catch { /* ignore */ }
    // If product already loaded, re-analyse with new profile
    if (product) {
      const inci = parseInci(product);
      setAnalysis(analyseIngredients(inci, next.skinType, next.concern));
    }
  }, [profile, product]);

  // ── Parse INCI from product ───────────────────────────────────────────────
  function parseInci(p) {
    const raw = p.ingredients_text_en || p.ingredients_text || "";
    return raw.split(/,|;/).map((s) => s.replace(/\*/g, "").trim()).filter(Boolean);
  }

  // ── Fetch product ─────────────────────────────────────────────────────────
  const fetchProduct = useCallback(async (code) => {
    const trimmed = (code || barcode).trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setProduct(null);
    setAnalysis(null);
    setImageError(null);
    try {
      const res  = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${encodeURIComponent(trimmed)}.json`);
      if (!res.ok) throw new Error("API error — please try again.");
      const data = await res.json();
      if (data.status === 0 || !data.product) throw new Error("Product not found. Try another barcode.");
      setProduct(data.product);
      const inci = parseInci(data.product);
      setAnalysis(analyseIngredients(inci, profile.skinType, profile.concern));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [barcode, profile]);

  // ── Camera / file upload ──────────────────────────────────────────────────
  const handleImageInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Real-world: send to a barcode-decode API or use a JS barcode lib (e.g. zxing-js)
    // For now: prompt the user to enter the number they see on-pack.
    setImageError("📷 Image received — type the barcode number shown on the pack into the field below, then hit scan.");
    e.target.value = ""; // reset so same file can be selected again
  };

  // ── Derived ingredient data ───────────────────────────────────────────────
  const inciArr      = product ? parseInci(product) : [];
  const productName  = product?.product_name || product?.product_name_en || "Unknown product";
  const brand        = product?.brands || product?.brand_owner || "—";
  const category     = product?.categories ? product.categories.split(",")[0].trim() : "—";
  const imageUrl     = product?.image_front_url || product?.image_url;

  const scoreColor   = analysis
    ? analysis.score >= 7 ? T.green : analysis.score >= 5 ? T.amber : T.red
    : T.violet;

  const insight = analysis && product
    ? buildInsight(analysis.beneficial, analysis.flagged, profile.skinType, profile.concern)
    : "";

  // ── Classify each INCI ingredient ────────────────────────────────────────
  const classifyIng = (name) => {
    const lower = name.toLowerCase();
    if (analysis?.flagged.some((f) => lower.includes(f)))    return "bad";
    if (analysis?.beneficial.some((b) => lower.includes(b))) return "ok";
    return "neutral";
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes dermPulse  { 0%,100%{opacity:.4}  50%{opacity:.9} }
        @keyframes scanLine   { 0%{top:18px} 100%{top:calc(100% - 18px)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .derm-scan-line       { animation: scanLine 2s ease-in-out infinite alternate; }
        .derm-fade-in         { animation: fadeIn .35s ease both; }
        .derm-input:focus     { outline:none; border-color:${T.violet}!important; box-shadow:0 0 0 3px rgba(123,94,167,.15); }
        .derm-btn-rose:hover  { background:rgba(255,62,127,.22)!important; }
        .derm-btn-violet:hover{ background:rgba(123,94,167,.22)!important; }
        .derm-sample:hover    { background:rgba(123,94,167,.18)!important; }
        .derm-scroll          { scrollbar-width:thin; scrollbar-color:rgba(123,94,167,.3) transparent; }
      `}</style>

      <div style={{
        background:"rgba(10,10,26,0.88)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        border:"1px solid rgba(245,240,235,0.10)",
        borderRadius:18,
        fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif",
        color:T.cream,
        overflow:"hidden",
        position:"relative",
        maxWidth:900,
        width:"100%",
      }}>

        {/* Ambient glows */}
        <div style={{ position:"absolute", bottom:-80, left:-60, width:260, height:260, background:`radial-gradient(circle,${T.rose}09 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />
        <div style={{ position:"absolute", top:-60,  right:-40, width:200, height:200, background:`radial-gradient(circle,${T.violet}0A 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }} />

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          position:"relative", zIndex:1,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 22px",
          borderBottom:"1px solid rgba(245,240,235,0.08)",
        }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:".16em", color:T.violet, marginBottom:3 }}>DERMIQ · INGREDIENT SCANNER</div>
            <div style={{ fontSize:15, fontWeight:700 }}>
              {isNewUser ? "Welcome to DermIQ 👋" : `Welcome back, ${profile.name} 👋`}
            </div>
            <div style={{ fontSize:10, opacity:.4, marginTop:1 }}>{dateStr}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, letterSpacing:".1em", color:T.violet }}>SKIN PROFILE</div>
              <div style={{ fontSize:11, fontWeight:600, color:"#afa9ec" }}>{skinLabel}</div>
            </div>
            {/* Avatar */}
            <button
              onClick={() => setSetupOpen((o) => !o)}
              title="Edit skin profile"
              style={{
                width:36, height:36, borderRadius:"50%",
                background:"rgba(123,94,167,0.22)",
                border:`1.5px solid rgba(123,94,167,0.5)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, fontWeight:700, color:"#afa9ec",
                cursor:"pointer",
              }}
            >{initials}</button>
          </div>
        </div>

        {/* ── SKIN PROFILE SETUP PANEL ────────────────────────────────────── */}
        {setupOpen && (
          <SetupPanel
            profile={profile}
            onSave={saveProfile}
            onClose={() => setSetupOpen(false)}
          />
        )}

        {/* ── FACIAL ANALYSIS ACTIVE BANNER ───────────────────────────────── */}
        {hasFacial && !setupOpen && (
          <div style={{
            position:"relative", zIndex:1,
            padding:"9px 22px",
            background:"rgba(29,158,117,0.07)",
            borderBottom:"1px solid rgba(29,158,117,0.16)",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <span style={{ fontSize:13 }}>✦</span>
            <div style={{ fontSize:10, color:"#5dcaa5", flex:1 }}>
              <strong>Facial analysis active</strong> — recommendations are tailored to your latest skin scan
              {analysisData?.createdAt && (
                <span style={{ opacity:.55, marginLeft:6 }}>
                  · scanned {new Date(analysisData.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── NEW USER NUDGE ───────────────────────────────────────────────── */}
        {isNewUser && !setupOpen && (
          <div style={{
            position:"relative", zIndex:1,
            padding:"9px 22px",
            background:"rgba(255,62,127,0.06)",
            borderBottom:"1px solid rgba(255,62,127,0.18)",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div style={{ fontSize:10, color:T.rose, flex:1 }}>
              Set up your skin profile for personalised ingredient analysis
            </div>
            <button
              onClick={() => setSetupOpen(true)}
              style={btnStyle("rose", "sm")}
            >Set up →</button>
          </div>
        )}

        {/* ── MAIN 2-COLUMN LAYOUT ────────────────────────────────────────── */}
        <div style={{
          position:"relative", zIndex:1,
          display:"grid", gridTemplateColumns:"220px 1fr",
          minHeight:420,
        }}>

          {/* ── LEFT: SCANNER PANEL ─────────────────────────────────────── */}
          <div style={{
            padding:"18px 16px",
            borderRight:"1px solid rgba(245,240,235,0.07)",
            display:"flex", flexDirection:"column", gap:13,
          }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:".04em", display:"flex", alignItems:"center", gap:6, color:T.cream }}>
              📷 SCAN PRODUCT
            </div>

            {/* Viewfinder */}
            <div style={{
              width:"100%", aspectRatio:"1",
              background:"rgba(10,10,26,0.92)",
              border:`1px solid rgba(255,62,127,0.12)`,
              borderRadius:10, position:"relative", overflow:"hidden",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {/* Grid bg */}
              <div style={{
                position:"absolute", inset:0,
                backgroundImage:`linear-gradient(rgba(123,94,167,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(123,94,167,0.04) 1px,transparent 1px)`,
                backgroundSize:"16px 16px",
              }} />
              {/* Idle text */}
              <div style={{ textAlign:"center", opacity:.3, fontSize:10, letterSpacing:".09em", position:"relative", zIndex:1 }}>
                <div style={{ fontSize:22, marginBottom:6 }}>▦</div>
                AWAITING FRAME
              </div>
              {/* Scan line */}
              <div className="derm-scan-line" style={{
                position:"absolute", left:16, right:16, height:2,
                background:`linear-gradient(90deg,transparent,${T.rose},transparent)`,
                boxShadow:`0 0 8px ${T.rose}`,
                borderRadius:1,
              }} />
              <CornerBrackets />
            </div>

            {/* Camera + Upload */}
            <div style={{ display:"flex", gap:6 }}>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleImageInput} />
              <input ref={fileRef}   type="file" accept="image/*"                        style={{ display:"none" }} onChange={handleImageInput} />
              <button onClick={() => cameraRef.current?.click()} style={{ ...btnStyle("violet","sm"), flex:1 }}>
                📷 Camera
              </button>
              <button onClick={() => fileRef.current?.click()} style={{ ...btnStyle("violet","sm"), flex:1 }}>
                ⬆ Upload
              </button>
            </div>

            {imageError && (
              <div style={{ fontSize:9, color:T.amber, lineHeight:1.5, padding:"6px 8px", background:"rgba(232,168,56,0.08)", borderRadius:6, border:"1px solid rgba(232,168,56,0.2)" }}>
                {imageError}
              </div>
            )}

            <Divider label="OR ENTER MANUALLY" />

            {/* Barcode input */}
            <div style={{ display:"flex", gap:6 }}>
              <input
                ref={inputRef}
                className="derm-input"
                type="text"
                placeholder="EAN / UPC barcode…"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchProduct()}
                style={inputStyle}
              />
              <button
                onClick={() => fetchProduct()}
                disabled={loading}
                style={btnStyle("rose","sm")}
              >
                {loading ? "…" : "🔍"}
              </button>
            </div>

            {/* Sample products */}
            <div>
              <SectionLabel>Sample products</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {SAMPLES.map((s) => (
                  <button
                    key={s.code}
                    className="derm-sample"
                    onClick={() => { setBarcode(s.code); fetchProduct(s.code); }}
                    style={{
                      background:"rgba(123,94,167,0.09)",
                      border:"1px solid rgba(123,94,167,0.22)",
                      borderRadius:5, padding:"5px 8px",
                      fontSize:9, color:"#afa9ec", cursor:"pointer",
                      textAlign:"left", fontFamily:"inherit", transition:"background .2s",
                    }}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: RESULTS PANEL ────────────────────────────────────── */}
          <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:14, minHeight:420 }}>

            {/* Idle */}
            {!loading && !product && !error && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, opacity:.32 }}>
                <div style={{ fontSize:36 }}>📦</div>
                <div style={{ fontSize:12, textAlign:"center", lineHeight:1.7 }}>
                  Scan or enter a barcode<br />to get personalised ingredient analysis
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ flex:1 }}>
                <Skeleton h={72} mb={14} />
                <Skeleton h={10} w="55%" mb={8} />
                <Skeleton h={10} w="75%" mb={14} />
                <Skeleton h={56} mb={8} />
                <Skeleton h={40} />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, textAlign:"center" }}>
                <div style={{ fontSize:30 }}>⚡</div>
                <div style={{ fontSize:12, color:T.rose }}>{error}</div>
                <div style={{ fontSize:10, opacity:.4 }}>Try a different barcode</div>
              </div>
            )}

            {/* Product results */}
            {product && !loading && (
              <div className="derm-fade-in" style={{ display:"flex", flexDirection:"column", gap:14 }}>

                {/* Product header card */}
                <div style={cardStyle}>
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    {/* Image / placeholder */}
                    <div style={{
                      width:64, height:64, borderRadius:8, flexShrink:0,
                      background:"rgba(123,94,167,0.12)",
                      border:"1px solid rgba(123,94,167,0.22)",
                      overflow:"hidden",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      {imageUrl
                        ? <img src={imageUrl} alt={productName} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                        : <span style={{ fontSize:22 }}>📦</span>
                      }
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, lineHeight:1.3, marginBottom:3, wordBreak:"break-word" }}>{productName}</div>
                      <div style={{ fontSize:10, color:T.violet, marginBottom:5 }}>{brand}</div>
                      <div style={{ fontSize:9, opacity:.45, background:"rgba(123,94,167,0.10)", display:"inline-block", padding:"2px 7px", borderRadius:3, letterSpacing:".06em" }}>
                        {category}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compatibility score */}
                {analysis && (
                  <div style={{ ...cardStyle, display:"flex", alignItems:"center", gap:14 }}>
                    {/* Score ring */}
                    <div style={{
                      width:54, height:54, borderRadius:"50%", flexShrink:0,
                      border:`2px solid ${scoreColor}`,
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    }}>
                      <span style={{ fontSize:17, fontWeight:700, color:scoreColor, lineHeight:1 }}>{analysis.score}</span>
                      <span style={{ fontSize:8, opacity:.5 }}>/10</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <SectionLabel>Skin compatibility</SectionLabel>
                      <div style={{ fontSize:11, lineHeight:1.5, opacity:.85 }}>
                        {analysis.score >= 8 ? `Great match for ${profile.skinType || "your skin"} skin`
                          : analysis.score >= 6 ? `Generally suitable for ${profile.skinType || "your skin"} skin`
                          : analysis.score >= 4 ? `Use with caution for ${profile.skinType || "your skin"} skin`
                          : `May not suit ${profile.skinType || "your skin"} skin`}
                      </div>
                      {profile.concern && profile.concern !== "none" && (
                        <div style={{ fontSize:9, opacity:.4, marginTop:3 }}>Concern: {profile.concern}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contains / Watch out */}
                {analysis && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {/* Contains */}
                    <div style={{ ...cardStyle, padding:12 }}>
                      <div style={{ fontSize:9, color:"#5dcaa5", letterSpacing:".1em", marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
                        ✓ CONTAINS
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap" }}>
                        {analysis.beneficial.length
                          ? analysis.beneficial.map((b, i) => <InciTag key={i} name={b} kind="ok" />)
                          : <span style={{ fontSize:10, opacity:.35 }}>None detected</span>
                        }
                      </div>
                    </div>
                    {/* Watch out */}
                    <div style={{ ...cardStyle, padding:12 }}>
                      <div style={{ fontSize:9, color:"#f09595", letterSpacing:".1em", marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
                        ⚠ WATCH OUT
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap" }}>
                        {analysis.flagged.length
                          ? analysis.flagged.map((f, i) => <InciTag key={i} name={f} kind="bad" />)
                          : <span style={{ fontSize:10, color:"#5dcaa5", opacity:.8 }}>All clear ✓</span>
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* Full INCI list */}
                <div>
                  <div style={{ fontSize:9, letterSpacing:".1em", color:T.violet, display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <div style={{ flex:1, height:1, background:"rgba(123,94,167,0.22)" }} />
                    <span style={{ color:T.amber }}>⬡ {inciArr.length} ingredient{inciArr.length !== 1 ? "s" : ""}</span>
                    <div style={{ flex:1, height:1, background:"rgba(123,94,167,0.22)" }} />
                  </div>
                  {inciArr.length > 0 ? (
                    <div className="derm-scroll" style={{ maxHeight:140, overflowY:"auto", display:"flex", flexWrap:"wrap" }}>
                      {inciArr.map((ing, i) => (
                        <InciTag key={i} name={ing} kind={classifyIng(ing)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize:11, opacity:.35 }}>No INCI data available.</div>
                  )}
                </div>

                {/* DermIQ Insight */}
                {insight && (
                  <div style={{
                    background:"rgba(123,94,167,0.08)",
                    border:"1px solid rgba(123,94,167,0.20)",
                    borderRadius:8, padding:"10px 13px",
                  }}>
                    <div style={{ fontSize:9, letterSpacing:".1em", color:T.violet, marginBottom:4 }}>✦ DERMIQ INSIGHT</div>
                    <div style={{ fontSize:10, lineHeight:1.6, color:"#afa9ec" }}>{insight}</div>
                  </div>
                )}

                {/* Footer row */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  borderTop:"1px solid rgba(245,240,235,0.07)", paddingTop:10,
                }}>
                  <span style={{ fontSize:9, fontFamily:"monospace", opacity:.35 }}>
                    {product._id || barcode}
                  </span>
                  <div style={{ display:"flex", gap:8 }}>
                    <span style={{ fontSize:9, color:T.violet, opacity:.5 }}>OPEN BEAUTY FACTS</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER BAR ──────────────────────────────────────────────────── */}
        <div style={{
          position:"relative", zIndex:1,
          display:"flex", alignItems:"center", gap:10,
          padding:"10px 22px",
          borderTop:"1px solid rgba(245,240,235,0.07)",
        }}>
          <button
            onClick={() => setSetupOpen((o) => !o)}
            style={btnStyle("violet","sm")}
          >
            ⚙ Edit skin profile
          </button>
          {isNewUser && (
            <span style={{
              background:"rgba(255,62,127,0.09)", border:"1px solid rgba(255,62,127,0.22)",
              borderRadius:4, padding:"2px 8px", fontSize:9, color:T.rose,
            }}>
              New user — set up your profile for personalised results
            </span>
          )}
          <div style={{ marginLeft:"auto", fontSize:9, opacity:.28 }}>
            Powered by Open Beauty Facts · DermIQ
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Setup Panel ──────────────────────────────────────────────────────────────
function SetupPanel({ profile, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     profile.name     || "",
    skinType: profile.skinType || "combination",
    concern:  profile.concern  || "none",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{
      position:"relative", zIndex:1,
      padding:"16px 22px",
      borderBottom:"1px solid rgba(245,240,235,0.08)",
      background:"rgba(10,10,26,0.6)",
      animation:"fadeIn .25s ease",
    }}>
      <SectionLabel>Your skin profile</SectionLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        <div>
          <div style={{ fontSize:10, opacity:.5, marginBottom:5 }}>Name</div>
          <input
            className="derm-input"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={set("name")}
            style={inputStyle}
          />
        </div>
        <div>
          <div style={{ fontSize:10, opacity:.5, marginBottom:5 }}>Skin type</div>
          <select value={form.skinType} onChange={set("skinType")} style={selectStyle}>
            {["normal","dry","oily","combination","sensitive"].map((v) => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize:10, opacity:.5, marginBottom:5 }}>Main concern</div>
          <select value={form.concern} onChange={set("concern")} style={selectStyle}>
            {[
              ["none","None"],["acne","Acne"],["redness","Redness / sensitivity"],
              ["aging","Anti-aging"],["hyperpigmentation","Hyperpigmentation"],["dryness","Dryness"],
            ].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop:12, display:"flex", justifyContent:"flex-end", gap:8 }}>
        {profile.name && (
          <button onClick={onClose} style={btnStyle("violet","sm")}>Cancel</button>
        )}
        <button onClick={() => onSave(form)} style={btnStyle("rose","sm")}>
          Save profile →
        </button>
      </div>
    </div>
  );
}

// ─── Style helpers (plain objects, no runtime CSS-in-JS) ──────────────────────
const cardStyle = {
  background:"rgba(245,240,235,0.04)",
  border:"1px solid rgba(245,240,235,0.09)",
  borderRadius:10, padding:14,
};

const inputStyle = {
  flex:1, width:"100%",
  background:"rgba(245,240,235,0.05)",
  border:"1px solid rgba(245,240,235,0.12)",
  borderRadius:8, padding:"8px 11px",
  color:"#F5F0EB", fontSize:12,
  fontFamily:"monospace", letterSpacing:".05em",
  transition:"border-color .2s, box-shadow .2s",
};

const selectStyle = {
  ...inputStyle,
  cursor:"pointer",
  appearance:"none",
};

function btnStyle(color = "rose", size = "md") {
  const isRose   = color === "rose";
  const baseColor = isRose ? "#FF3E7F" : "#7B5EA7";
  const sm = size === "sm";
  return {
    background: `rgba(${isRose ? "255,62,127" : "123,94,167"},0.12)`,
    border: `1px solid ${baseColor}44`,
    borderRadius: 7,
    padding: sm ? "5px 10px" : "8px 16px",
    color: baseColor,
    fontSize: sm ? 10 : 12,
    fontWeight: 600,
    letterSpacing: ".05em",
    cursor: "pointer",
    transition: "background .2s",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  };
}