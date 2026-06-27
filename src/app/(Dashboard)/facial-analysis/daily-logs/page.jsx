"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Sun, Moon, Droplet, Smile, Sparkles, AlertTriangle,
  CheckCircle, Flame, Plus, Minus, Lock, Zap, Activity,
  ChevronLeft, ChevronRight, Calendar, TrendingUp, Star,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useDailyLogStore } from "@/stores/useDailyLogStore";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#0A0A1A",
  offWhite: "#F5F0EB",
  rose:     "#FF3E7F",
  violet:   "#7B5EA7",
  amber:    "#E8A838",
  card:     "rgba(255,255,255,0.035)",
  border:   "rgba(255,255,255,0.072)",
  borderHi: "rgba(255,255,255,0.14)",
  muted:    "rgba(245,240,235,0.42)",
  dimmed:   "rgba(245,240,235,0.18)",
  green:    "#22C55E",
  sky:      "#38BDF8",
};

// ─── View State Machine ───────────────────────────────────────────────────────
const VIEW = {
  LOADING:   "loading",
  FORM:      "form",       // Case D — today, no log yet
  COMPLETED: "completed",  // Case C — today, log already saved
  ARCHIVED:  "archived",   // Case A — past date, log exists
  MISSED:    "missed",     // Case B — past date, nothing logged
};

// ─── Constants ────────────────────────────────────────────────────────────────
const HABITS = [
  "Drank 3L Water", "No Dairy", "Changed Pillowcase", "No Sugar",
  "8hrs Sleep", "Exercise", "SPF Applied", "Stress-Free",
  "No Alcohol", "Gua Sha",
];

const METRICS = {
  mood: {
    label: "Mood", Icon: Smile, color: C.amber,
    levels: ["Rough","Low","Neutral","Good","Glowing"],
    emoji:  ["😞","😕","😐","😊","🌟"],
  },
  skin_rating: {
    label: "Skin", Icon: Sparkles, color: C.violet,
    levels: ["Troubled","Dull","Okay","Clear","Radiant"],
    emoji:  ["😰","😟","😐","✨","💎"],
  },
  hydration_level: {
    label: "Hydration", Icon: Droplet, color: C.sky,
    levels: ["Parched","Dry","Normal","Plump","Dewy"],
    emoji:  ["🏜️","💨","💧","💦","🌊"],
  },
  redness_level: {
    label: "Redness", Icon: Flame, color: C.rose,
    levels: ["Intense","Noticeable","Mild","Faint","Clear"],
    emoji:  ["🔴","🟠","🟡","🟢","✅"],
  },
};

const AI_REMARKS = [
  "Your skin metrics signal real progress. Morning-routine consistency is directly reflected in today's skin_rating uplift. Consider boosting hydration by ~20% — it should knock that residual redness down a full point. Mood-to-skin correlation flagged: your clearest days track with lower stress scores. Stress reduction may be your highest-leverage move this week.",
  "Excellent habit discipline. Breakout count is trending downward — the no-dairy commitment is showing measurable results across the last 5 logs. Your evening-routine completion streak is now 4 days. Recommendation: slot a niacinamide serum before your night moisturizer. Based on your hydration profile, you should see clarity gains within 72 hours.",
  "Balanced session today. Hydration dipped slightly — prioritise electrolytes before your next log. Skin-rating of 4 aligns with the 7 habits you completed; that's a strong signal that consistency compounds. Note: the redness reading may correlate with the 'No Sugar' miss yesterday. An anti-inflammatory focus tomorrow should close the gap.",
];

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD in the user's local timezone — never UTC. */
const toLocalDate = (d = new Date()) => {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const humanDate = (dateStr) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

const makeEmptyForm = (date) => ({
  log_date:        date,
  morning_done:    false,
  night_done:      false,
  habits_done:     [],
  mood:            3,
  skin_rating:     3,
  hydration_level: 3,
  breakout_count:  0,
  redness_level:   2,
  notes:           "",
  ai_daily_remark: "",
});

const calcScore = (log) => Math.round(
  (log.morning_done               ? 14 : 0) +
  (log.night_done                 ? 14 : 0) +
  ((log.habits_done?.length || 0) / HABITS.length) * 36 +
  ((log.mood            || 0) / 5) * 12 +
  ((log.skin_rating     || 0) / 5) * 12 +
  ((log.notes?.length   || 0) > 10 ? 12 : 0)
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  *{box-sizing:border-box;-webkit-font-smoothing:antialiased}

  @keyframes fadeUp    {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn    {from{opacity:0}to{opacity:1}}
  @keyframes scaleIn   {from{opacity:0;transform:scale(0.78)}to{opacity:1;transform:scale(1)}}
  @keyframes spinArc   {to{transform:rotate(360deg)}}
  @keyframes typeBlip  {0%,100%{opacity:1}50%{opacity:0}}
  @keyframes ambPulse  {0%,100%{box-shadow:0 0 22px rgba(123,94,167,0.18)}50%{box-shadow:0 0 44px rgba(123,94,167,0.44),0 0 66px rgba(255,62,127,0.12)}}
  @keyframes confettiFall{0%{transform:translateY(-30px) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(740deg);opacity:0}}
  @keyframes float     {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes breathe   {0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.85;transform:scale(1.04)}}
  @keyframes successRing{0%{stroke-dashoffset:138}to{stroke-dashoffset:0}}
  @keyframes skeletonPulse{0%,100%{opacity:.06}50%{opacity:.14}}

  .view-enter .s1{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .04s both}
  .view-enter .s2{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .10s both}
  .view-enter .s3{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .16s both}
  .view-enter .s4{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .22s both}
  .view-enter .s5{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .28s both}
  .view-enter .s6{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .34s both}
  .view-enter .s7{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .40s both}
  .view-enter .s8{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .46s both}
  .view-enter .s9{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) .52s both}

  .rtn-card{transition:transform .22s cubic-bezier(.34,1.56,.64,1),border-color .2s,background .2s}
  .rtn-card:hover:not(.locked){transform:translateY(-3px) scale(1.01)}
  .rtn-card:active:not(.locked){transform:scale(.96)}
  .habit-chip{transition:all .18s cubic-bezier(.34,1.56,.64,1)}
  .habit-chip:hover:not(:disabled){transform:scale(1.05)}
  .habit-chip:active:not(:disabled){transform:scale(.93)}
  .mseg{transition:all .16s cubic-bezier(.34,1.56,.64,1);cursor:pointer}
  .mseg:hover:not(:disabled){filter:brightness(1.35)}
  .mseg:active:not(:disabled){transform:scale(.91)}
  .ctr-btn{transition:all .15s cubic-bezier(.34,1.56,.64,1)}
  .ctr-btn:hover:not(:disabled){transform:scale(1.12);background:rgba(255,255,255,0.1)!important}
  .ctr-btn:active:not(:disabled){transform:scale(.88)}
  .save-btn{transition:all .22s cubic-bezier(.34,1.56,.64,1)}
  .save-btn:hover:not(:disabled){transform:translateY(-2px) scale(1.01)}
  .save-btn:active:not(:disabled){transform:scale(.97)}
  .nav-btn{transition:all .15s cubic-bezier(.34,1.56,.64,1)}
  .nav-btn:hover:not(:disabled){background:rgba(255,255,255,0.1)!important;transform:scale(1.08)}
  .nav-btn:active:not(:disabled){transform:scale(.9)}
  .nav-btn:disabled{opacity:.24;cursor:not-allowed}

  textarea{scrollbar-width:none}
  textarea::-webkit-scrollbar{display:none}
  .skeleton-bar{animation:skeletonPulse 1.6s ease-in-out infinite;background:rgba(255,255,255,0.08);border-radius:6px}
`;

// ─── Shared Atoms ─────────────────────────────────────────────────────────────

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: [C.rose, C.violet, C.amber, C.sky, "#4ADE80", "#F472B6"][i % 6],
      delay: Math.random() * 1.6,
      dur:   2.4 + Math.random() * 2,
      size:  5 + Math.random() * 7,
      round: Math.random() > 0.5,
    })), []
  );
  return (
    <>
      {particles.map(p => (
        <div key={p.id} style={{
          position:"fixed", left:`${p.x}%`, top:"-30px",
          width:`${p.size}px`, height:`${p.size}px`,
          borderRadius: p.round ? "50%" : "2px",
          background: p.color, zIndex:9999, pointerEvents:"none",
          animation:`confettiFall ${p.dur}s ${p.delay}s ease forwards`,
        }} />
      ))}
    </>
  );
}

function CompletionRing({ score }) {
  const R    = 22, CX = 26;
  const circ = 2 * Math.PI * R;
  const color = score >= 75 ? C.green : score >= 45 ? C.amber : C.rose;
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ position:"relative", width:"54px", height:"54px" }}>
        <svg width="54" height="54" style={{ transform:"rotate(-90deg)" }}>
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <circle cx={CX} cy={CX} r={R} fill="none"
            stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - score / 100)}
            style={{ transition:"stroke-dashoffset .6s ease, stroke .4s ease" }}
          />
        </svg>
        <div style={{
          position:"absolute", inset:0, display:"flex",
          flexDirection:"column", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:"11px", fontWeight:800, color:C.offWhite, lineHeight:1 }}>{score}%</span>
        </div>
      </div>
      <span style={{
        fontSize:"8px", fontWeight:700, color:C.dimmed,
        letterSpacing:"0.1em", display:"block", marginTop:"3px",
      }}>LOG SCORE</span>
    </div>
  );
}

// ─── Date Navigation Bar ──────────────────────────────────────────────────────

function DateNavBar({ selectedDate, today, onDateChange, score }) {
  const label   = humanDate(selectedDate);
  const isToday = selectedDate === today;

  const shift = (days) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    const next = toLocalDate(d);
    // Hard-block forward past today
    if (next > today) return;
    onDateChange(next);
  };

  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
      <div style={{ flex:1 }}>
        {/* Eyebrow */}
        <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"6px" }}>
          <Activity size={12} color={C.violet} strokeWidth={2} />
          <span style={{
            fontSize:"10px", fontWeight:800, color:C.violet,
            letterSpacing:"0.12em", textTransform:"uppercase",
          }}>Luminary</span>
        </div>

        {/* Title */}
        <h1 style={{
          margin:"0 0 10px", fontSize:"clamp(19px,5vw,23px)",
          fontWeight:800, letterSpacing:"-0.03em",
          background:`linear-gradient(135deg, ${C.offWhite} 30%, rgba(245,240,235,0.5) 100%)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Daily Skin Log
        </h1>

        {/* Nav row */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <button className="nav-btn" type="button" onClick={() => shift(-1)} style={{
            width:"26px", height:"26px", borderRadius:"7px", border:"1px solid rgba(255,255,255,0.08)",
            background:"rgba(255,255,255,0.04)", color:C.muted, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <ChevronLeft size={13} strokeWidth={2} />
          </button>

          <div>
            <div style={{ fontSize:"14px", fontWeight:700, color:C.offWhite, letterSpacing:"-0.01em" }}>
              {label}
            </div>
            {isToday && (
              <div style={{ fontSize:"10px", color:C.violet, fontWeight:600, marginTop:"1px" }}>Today</div>
            )}
          </div>

          {/* Forward-date lock: disabled when already on today */}
          <button
            className="nav-btn"
            type="button"
            onClick={() => shift(1)}
            disabled={isToday}
            style={{
              width:"26px", height:"26px", borderRadius:"7px", border:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.04)", color:isToday ? C.dimmed : C.muted,
              cursor: isToday ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}
          >
            <ChevronRight size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div style={{ flexShrink:0, marginLeft:"16px" }}>
        <CompletionRing score={score} />
      </div>
    </div>
  );
}

// ─── Form Sub-components ──────────────────────────────────────────────────────

function RoutineCard({ icon: Icon, label, subLabel, checked, onChange, color }) {
  return (
    <button type="button" className="rtn-card"
      onClick={() => onChange(!checked)}
      style={{
        flex:1, padding:"18px 14px", borderRadius:"18px", border:"none",
        outline:`1.5px solid ${checked ? color + "66" : C.border}`,
        background: checked
          ? `linear-gradient(145deg, ${color}1A 0%, ${color}09 100%)`
          : C.card,
        cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
        position:"relative", overflow:"hidden", textAlign:"center",
      }}
    >
      {checked && (
        <div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          width:"80%", height:"1px",
          background:`linear-gradient(90deg, transparent, ${color}80, transparent)`,
        }} />
      )}
      <div style={{
        width:"44px", height:"44px", borderRadius:"14px",
        background: checked ? `${color}28` : "rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all .28s cubic-bezier(.34,1.56,.64,1)",
        transform: checked ? "scale(1.12) rotate(-4deg)" : "scale(1) rotate(0deg)",
        boxShadow: checked ? `0 0 20px ${color}40` : "none",
      }}>
        <Icon size={20} color={checked ? color : C.dimmed} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize:"12px", fontWeight:700, color: checked ? C.offWhite : C.muted }}>
          {label}
        </div>
        <div style={{ fontSize:"10px", color: checked ? color : C.dimmed, marginTop:"2px", fontWeight:500 }}>
          {checked ? "Done ✓" : subLabel}
        </div>
      </div>
      {checked && (
        <div style={{ position:"absolute", top:"9px", right:"9px", animation:"scaleIn .3s cubic-bezier(.34,1.56,.64,1)" }}>
          <CheckCircle size={13} color={color} strokeWidth={2.5} />
        </div>
      )}
    </button>
  );
}

function MetricSlider({ metricKey, value, onChange }) {
  const cfg = METRICS[metricKey];
  const [hover, setHover] = useState(null);
  const display = hover ?? value;

  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"15px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"11px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
          <cfg.Icon size={13} color={cfg.color} strokeWidth={2} />
          <span style={{ fontSize:"10px", fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>
            {cfg.label}
          </span>
        </div>
        <span style={{
          fontSize:"11px", fontWeight:700, color:cfg.color,
          background:`${cfg.color}18`, padding:"2px 9px", borderRadius:"99px",
          transition:"all .15s ease",
        }}>
          {cfg.emoji[display - 1]} {cfg.levels[display - 1]}
        </span>
      </div>
      <div style={{ display:"flex", gap:"5px" }}>
        {[1, 2, 3, 4, 5].map(n => {
          const isActive  = n <= value;
          const isHovered = hover !== null && n <= hover;
          const isCurrent = n === value;
          return (
            <button key={n} type="button" className="mseg"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(n)}
              style={{
                flex:1, height:"26px", borderRadius:"6px", border:"none",
                background: isHovered
                  ? `${cfg.color}70`
                  : isActive
                    ? `${cfg.color}${isCurrent ? "EE" : "66"}`
                    : "rgba(255,255,255,0.055)",
                cursor:"pointer", position:"relative",
                transform: isCurrent ? "scaleY(1.18)" : "scaleY(1)",
                boxShadow: isCurrent ? `0 0 10px ${cfg.color}66` : "none",
              }}
            >
              {isCurrent && (
                <div style={{
                  position:"absolute", top:"-4px", left:"50%", transform:"translateX(-50%)",
                  width:"4px", height:"4px", borderRadius:"50%",
                  background:cfg.color, boxShadow:`0 0 7px ${cfg.color}`,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BreakoutCounter({ value, onChange }) {
  const [bump, setBump] = useState(false);
  const trigger = (fn) => { fn(); setBump(true); setTimeout(() => setBump(false), 220); };
  const danger  = value > 3 ? C.rose : value > 0 ? C.amber : C.dimmed;

  return (
    <div style={{
      background:C.card,
      border:`1px solid ${value > 0 ? (value > 3 ? C.rose : C.amber) + "40" : C.border}`,
      borderRadius:"16px", padding:"14px 16px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"border-color .3s ease",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
        <div style={{
          width:"38px", height:"38px", borderRadius:"11px",
          background: value > 0 ? `${C.amber}1E` : "rgba(255,255,255,0.05)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .3s ease",
          boxShadow: value > 3 ? `0 0 16px ${C.rose}44` : "none",
        }}>
          <AlertTriangle size={16} color={danger} strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize:"12px", fontWeight:700, color:C.muted }}>Breakout Count</div>
          <div style={{ fontSize:"10px", color:C.dimmed, marginTop:"1px" }}>Visible pimples today</div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <button type="button" className="ctr-btn"
          disabled={value <= 0}
          onClick={() => trigger(() => onChange(Math.max(0, value - 1)))}
          style={{
            width:"30px", height:"30px", borderRadius:"8px",
            border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
            color: value <= 0 ? C.dimmed : C.offWhite,
            cursor: value <= 0 ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        ><Minus size={12} strokeWidth={2.5} /></button>

        <span style={{
          fontSize:"26px", fontWeight:800, minWidth:"38px", textAlign:"center",
          color:danger, transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
          transform: bump ? "scale(1.28)" : "scale(1)", display:"inline-block",
          textShadow: value > 0 ? `0 0 20px ${danger}88` : "none",
        }}>
          {value}
        </span>

        <button type="button" className="ctr-btn"
          onClick={() => trigger(() => onChange(value + 1))}
          style={{
            width:"30px", height:"30px", borderRadius:"8px",
            border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
            color:C.offWhite, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        ><Plus size={12} strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}

function AIRemarkBox({ text, isTyping }) {
  const hasContent = text.length > 0 || isTyping;
  return (
    <div style={{
      background: hasContent
        ? "linear-gradient(140deg, rgba(123,94,167,0.13) 0%, rgba(255,62,127,0.07) 100%)"
        : C.card,
      border:`1px solid ${hasContent ? C.violet + "44" : C.border}`,
      borderRadius:"18px", padding:"18px",
      minHeight:"108px", position:"relative", overflow:"hidden",
      transition:"all .4s ease",
      animation: hasContent ? "ambPulse 3.5s ease-in-out infinite" : "none",
    }}>
      {hasContent && (
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"1px",
          background:`linear-gradient(90deg, transparent, ${C.violet}88, ${C.rose}55, transparent)`,
        }} />
      )}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
        <div style={{
          width:"27px", height:"27px", borderRadius:"8px",
          background: hasContent ? `${C.violet}2E` : "rgba(255,255,255,0.05)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .3s",
        }}>
          <Sparkles size={12} color={hasContent ? C.violet : C.dimmed} strokeWidth={2} />
        </div>
        <span style={{
          fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase",
          color: hasContent ? C.violet : C.dimmed,
        }}>AI Daily Remark</span>
        {isTyping && (
          <div style={{
            marginLeft:"auto", width:"6px", height:"6px", borderRadius:"50%",
            background:C.violet, animation:"ambPulse 1s infinite",
          }} />
        )}
      </div>

      {!hasContent ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"8px", gap:"8px" }}>
          <div style={{
            width:"36px", height:"36px", borderRadius:"50%", background:`${C.violet}14`,
            display:"flex", alignItems:"center", justifyContent:"center",
            animation:"breathe 2.5s ease-in-out infinite",
          }}>
            <Sparkles size={16} color={C.dimmed} strokeWidth={1.5} />
          </div>
          <span style={{ fontSize:"12px", color:C.dimmed, textAlign:"center" }}>
            Submit your log to receive AI-powered skin insights
          </span>
        </div>
      ) : (
        <p style={{ margin:0, fontSize:"13px", lineHeight:"1.72", color:C.offWhite, opacity:0.88 }}>
          {text}
          {isTyping && (
            <span style={{
              display:"inline-block", width:"2px", height:"13px", marginLeft:"2px",
              background:C.violet, verticalAlign:"middle",
              animation:"typeBlip .65s step-start infinite",
            }} />
          )}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function LoadingView() {
  const bar = (w, h = 14, mt = 0) => (
    <div className="skeleton-bar" style={{ width:w, height:`${h}px`, marginTop:`${mt}px` }} />
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"14px", paddingTop:"8px" }}>
      {bar("55%", 22)}
      {bar("38%", 12, 4)}
      <div style={{ height:"1px", background:C.border, margin:"4px 0" }} />
      <div style={{ display:"flex", gap:"10px" }}>
        <div className="skeleton-bar" style={{ flex:1, height:"96px", borderRadius:"18px" }} />
        <div className="skeleton-bar" style={{ flex:1, height:"96px", borderRadius:"18px" }} />
      </div>
      <div className="skeleton-bar" style={{ height:"120px", borderRadius:"18px" }} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="skeleton-bar" style={{ height:"68px", borderRadius:"16px" }} />
        ))}
      </div>
      {bar("100%", 48, 4)}
    </div>
  );
}

// ─── Case B: Missed Log View ──────────────────────────────────────────────────

function MissedView({ selectedDate }) {
  const label = humanDate(selectedDate);
  return (
    <div className="view-enter" style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"48px 24px", textAlign:"center", gap:"0",
    }}>
      {/* Ghost illustration */}
      <div className="s1" style={{ animation:"float 3.2s ease-in-out infinite", marginBottom:"28px" }}>
        <div style={{
          width:"88px", height:"88px", borderRadius:"50%",
          background:"rgba(255,255,255,0.035)",
          border:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          position:"relative",
        }}>
          <Calendar size={32} color={C.dimmed} strokeWidth={1.4} />
          {/* X badge */}
          <div style={{
            position:"absolute", top:"-4px", right:"-4px",
            width:"22px", height:"22px", borderRadius:"50%",
            background:"rgba(10,10,26,0.9)",
            border:`1.5px solid ${C.amber}55`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontSize:"11px", color:C.amber, fontWeight:800, lineHeight:1 }}>!</span>
          </div>
        </div>
      </div>

      <div className="s2" style={{ marginBottom:"10px" }}>
        <div style={{ fontSize:"10px", fontWeight:700, color:C.amber, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"8px" }}>
          Missed Log
        </div>
        <div style={{ fontSize:"18px", fontWeight:800, color:C.offWhite, letterSpacing:"-0.02em", lineHeight:1.3 }}>
          No log recorded on this day.
        </div>
      </div>

      <div className="s3" style={{
        fontSize:"13px", lineHeight:"1.7", color:C.muted, maxWidth:"320px", marginBottom:"28px",
      }}>
        You didn't log your skin wellness on{" "}
        <span style={{ color:C.offWhite, fontWeight:600 }}>{label}</span>.
        Consistency is key to seeing patterns — keep your streak going forward.
      </div>

      {/* Motivational metric strip */}
      <div className="s4" style={{
        display:"flex", gap:"10px", width:"100%", maxWidth:"340px",
      }}>
        {[
          { label:"Track Tomorrow", icon:"🌅" },
          { label:"Build the Habit", icon:"🔗" },
          { label:"Skin Improves", icon:"✨" },
        ].map((item, i) => (
          <div key={i} style={{
            flex:1, padding:"12px 8px", borderRadius:"14px",
            background:C.card, border:`1px solid ${C.border}`,
            textAlign:"center",
          }}>
            <div style={{ fontSize:"18px", marginBottom:"5px" }}>{item.icon}</div>
            <div style={{ fontSize:"9px", fontWeight:700, color:C.dimmed, letterSpacing:"0.06em" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared: Read-Only Metric Display ────────────────────────────────────────

function ReadOnlyMetricCard({ metricKey, value }) {
  const cfg = METRICS[metricKey];
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"14px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"10px" }}>
        <cfg.Icon size={12} color={cfg.color} strokeWidth={2} />
        <span style={{ fontSize:"10px", fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {cfg.label}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"20px" }}>{cfg.emoji[value - 1]}</span>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"13px", fontWeight:700, color:C.offWhite }}>{cfg.levels[value - 1]}</div>
          <div style={{ display:"flex", gap:"3px", marginTop:"4px", justifyContent:"flex-end" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{
                width:"16px", height:"4px", borderRadius:"2px",
                background: n <= value ? `${cfg.color}DD` : "rgba(255,255,255,0.07)",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyLogBody({ log, aiText, isTyping }) {
  const score = calcScore(log);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

      {/* Score strip */}
      <div className="s2" style={{
        display:"flex", gap:"10px",
      }}>
        {/* Routines */}
        {[
          { icon:Sun,  label:"Morning", done:log.morning_done, color:C.amber },
          { icon:Moon, label:"Night",   done:log.night_done,   color:C.violet },
        ].map(({ icon:Icon, label, done, color }) => (
          <div key={label} style={{
            flex:1, padding:"14px", borderRadius:"16px",
            outline:`1.5px solid ${done ? color + "55" : C.border}`,
            background: done ? `${color}11` : C.card,
            display:"flex", alignItems:"center", gap:"10px",
          }}>
            <div style={{
              width:"36px", height:"36px", borderRadius:"11px",
              background: done ? `${color}22` : "rgba(255,255,255,0.05)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Icon size={17} color={done ? color : C.dimmed} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize:"11px", fontWeight:700, color: done ? C.offWhite : C.muted }}>{label}</div>
              <div style={{ fontSize:"10px", color: done ? color : C.dimmed, marginTop:"1px" }}>
                {done ? "Completed ✓" : "Skipped"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Habits */}
      <div className="s3" style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
          <span style={{ fontSize:"10px", fontWeight:700, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Habits
          </span>
          <span style={{ fontSize:"11px", fontWeight:700, color:C.violet }}>
            {log.habits_done?.length || 0}/{HABITS.length}
          </span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
          {HABITS.map(h => {
            const done = log.habits_done?.includes(h);
            return (
              <div key={h} style={{
                padding:"6px 12px", borderRadius:"99px", fontSize:"12px", fontWeight:500,
                border:`1.5px solid ${done ? C.violet + "66" : "rgba(255,255,255,0.06)"}`,
                background: done ? `${C.violet}1E` : "transparent",
                color: done ? "#D8C5FF" : C.dimmed,
                display:"flex", alignItems:"center", gap:"5px",
                opacity: done ? 1 : 0.45,
              }}>
                {done && <CheckCircle size={9} color={C.violet} strokeWidth={2.5} />}
                {h}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="s4" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
        {["mood", "skin_rating", "hydration_level", "redness_level"].map(key => (
          <ReadOnlyMetricCard key={key} metricKey={key} value={log[key] || 3} />
        ))}
      </div>

      {/* Breakout */}
      <div className="s5" style={{
        background:C.card,
        border:`1px solid ${(log.breakout_count || 0) > 0
          ? ((log.breakout_count || 0) > 3 ? C.rose : C.amber) + "40"
          : C.border}`,
        borderRadius:"16px", padding:"14px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
          <div style={{
            width:"38px", height:"38px", borderRadius:"11px",
            background:(log.breakout_count || 0) > 0 ? `${C.amber}1E` : "rgba(255,255,255,0.05)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <AlertTriangle size={16}
              color={(log.breakout_count || 0) > 3 ? C.rose : (log.breakout_count || 0) > 0 ? C.amber : C.dimmed}
              strokeWidth={2}
            />
          </div>
          <div>
            <div style={{ fontSize:"12px", fontWeight:700, color:C.muted }}>Breakout Count</div>
            <div style={{ fontSize:"10px", color:C.dimmed, marginTop:"1px" }}>Logged this day</div>
          </div>
        </div>
        <span style={{
          fontSize:"28px", fontWeight:800,
          color:(log.breakout_count || 0) > 3 ? C.rose : (log.breakout_count || 0) > 0 ? C.amber : C.dimmed,
          textShadow:(log.breakout_count || 0) > 0 ? `0 0 20px currentColor` : "none",
        }}>
          {log.breakout_count || 0}
        </span>
      </div>

      {/* Notes */}
      {log.notes?.trim() && (
        <div className="s6" style={{
          background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"14px 16px",
        }}>
          <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"10px" }}>
            Notes
          </div>
          <p style={{ margin:0, fontSize:"13px", lineHeight:"1.68", color:C.offWhite, opacity:0.78 }}>
            {log.notes}
          </p>
        </div>
      )}

      {/* AI Remark */}
      <div className="s7">
        <div style={{ fontSize:"10px", fontWeight:700, color:C.dimmed, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"9px" }}>
          AI Insights
        </div>
        <AIRemarkBox text={aiText} isTyping={isTyping} />
      </div>
    </div>
  );
}

// ─── Case C: Completed Today View ────────────────────────────────────────────

function CompletedView({ log, aiText, isTyping }) {
  const score = calcScore(log);
  return (
    <div className="view-enter" style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

      {/* Success banner */}
      <div className="s1" style={{
        padding:"18px 20px", borderRadius:"20px",
        background:"linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(123,94,167,0.10) 100%)",
        border:`1px solid ${C.green}33`,
        display:"flex", alignItems:"center", gap:"14px",
        animation:"ambPulse 4s ease-in-out infinite",
      }}>
        <div style={{
          width:"48px", height:"48px", borderRadius:"15px",
          background:`${C.green}22`,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          boxShadow:`0 0 24px ${C.green}33`,
        }}>
          <CheckCircle size={22} color={C.green} strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize:"15px", fontWeight:800, color:C.offWhite, letterSpacing:"-0.01em" }}>
            Daily check-in complete!
          </div>
          <div style={{ fontSize:"12px", color:C.muted, marginTop:"2px" }}>
            Your wellness log has been recorded. See you tomorrow.
          </div>
        </div>
        <div style={{ marginLeft:"auto", flexShrink:0 }}>
          <CompletionRing score={score} />
        </div>
      </div>

      <ReadOnlyLogBody log={log} aiText={aiText} isTyping={isTyping} />
    </div>
  );
}

// ─── Case A: Archived Past Log View ──────────────────────────────────────────

function ArchivedView({ log, selectedDate, aiText }) {
  const score = calcScore(log);
  return (
    <div className="view-enter" style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

      {/* Archive header */}
      <div className="s1" style={{
        padding:"16px 18px", borderRadius:"18px",
        background:C.card, border:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:"12px",
      }}>
        <div style={{
          width:"42px", height:"42px", borderRadius:"13px",
          background:"rgba(255,255,255,0.06)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <Calendar size={18} color={C.violet} strokeWidth={1.8} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:"10px", fontWeight:700, color:C.violet, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"3px" }}>
            Archived Log
          </div>
          <div style={{ fontSize:"13px", fontWeight:700, color:C.offWhite }}>
            {humanDate(selectedDate)}
          </div>
        </div>
        <div style={{ flexShrink:0 }}>
          <CompletionRing score={score} />
        </div>
      </div>

      {/* Subtle read-only notice */}
      <div className="s2" style={{
        display:"flex", alignItems:"center", gap:"7px", padding:"9px 14px",
        borderRadius:"10px", background:"rgba(255,255,255,0.025)",
        border:`1px solid ${C.border}`,
      }}>
        <Lock size={11} color={C.dimmed} strokeWidth={2} />
        <span style={{ fontSize:"11px", color:C.dimmed }}>
          This log is read-only. Past entries cannot be edited.
        </span>
      </div>

      <ReadOnlyLogBody log={log} aiText={aiText} isTyping={false} />
    </div>
  );
}

// ─── Case D: Interactive Form View ───────────────────────────────────────────

function FormView({ form, setFormField, toggleHabit, isSubmitting, onSubmit }) {
  const score = calcScore(form);
  return (
    <div className="view-enter" style={{ display:"flex", flexDirection:"column", gap:"11px" }}>

      {/* Routines */}
      <div className="s1">
        <div style={{ fontSize:"10px", fontWeight:700, color:C.dimmed, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"9px" }}>
          Routines
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <RoutineCard
            icon={Sun}  label="Morning" subLabel="Tap to mark done"
            checked={form.morning_done} onChange={v => setFormField("morning_done", v)} color={C.amber}
          />
          <RoutineCard
            icon={Moon} label="Night"   subLabel="Tap to mark done"
            checked={form.night_done}   onChange={v => setFormField("night_done", v)}   color={C.violet}
          />
        </div>
      </div>

      {/* Habits */}
      <div className="s2" style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:"18px", padding:"16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"13px" }}>
          <span style={{ fontSize:"10px", fontWeight:700, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Habits
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"64px", height:"3px", borderRadius:"99px", background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:"99px",
                background:`linear-gradient(90deg, ${C.violet}, ${C.rose})`,
                width:`${(form.habits_done.length / HABITS.length) * 100}%`,
                transition:"width .38s ease",
              }} />
            </div>
            <span style={{ fontSize:"11px", fontWeight:700, color:C.violet }}>
              {form.habits_done.length}/{HABITS.length}
            </span>
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
          {HABITS.map(h => {
            const active = form.habits_done.includes(h);
            return (
              <button key={h} type="button" className="habit-chip"
                onClick={() => toggleHabit(h)}
                style={{
                  padding:"7px 13px", borderRadius:"99px", fontSize:"12px", fontWeight:500,
                  border:`1.5px solid ${active ? C.violet + "77" : "rgba(255,255,255,0.08)"}`,
                  background: active ? `${C.violet}22` : "rgba(255,255,255,0.03)",
                  color: active ? "#D8C5FF" : C.muted,
                  cursor:"pointer",
                  display:"flex", alignItems:"center", gap:"5px",
                  boxShadow: active ? `0 0 12px ${C.violet}30` : "none",
                }}
              >
                {active && (
                  <div style={{ animation:"scaleIn .22s cubic-bezier(.34,1.56,.64,1)" }}>
                    <CheckCircle size={10} color={C.violet} strokeWidth={2.5} />
                  </div>
                )}
                {h}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="s3">
        <div style={{ fontSize:"10px", fontWeight:700, color:C.dimmed, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"9px" }}>
          Skin Metrics
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {["mood","skin_rating","hydration_level","redness_level"].map(key => (
            <MetricSlider key={key} metricKey={key}
              value={form[key]} onChange={v => setFormField(key, v)}
            />
          ))}
        </div>
      </div>

      {/* Breakout */}
      <div className="s4">
        <BreakoutCounter
          value={form.breakout_count}
          onChange={v => setFormField("breakout_count", v)}
        />
      </div>

      {/* Notes */}
      <div className="s5" style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"14px 16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
          <span style={{ fontSize:"10px", fontWeight:700, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            Notes
          </span>
          <span style={{ fontSize:"10px", color:C.dimmed }}>{form.notes.length} / 500</span>
        </div>
        <textarea
          value={form.notes}
          onChange={e => setFormField("notes", e.target.value.slice(0, 500))}
          placeholder="How did your skin feel today? New reactions, products tried, lifestyle notes…"
          rows={3}
          style={{
            width:"100%", background:"transparent", border:"none", outline:"none",
            color:C.offWhite, fontSize:"13px", lineHeight:"1.68", resize:"none",
            fontFamily:"inherit", caretColor:C.violet,
          }}
        />
      </div>

      {/* CTA */}
      <div className="s6">
        <button type="button" className="save-btn"
          onClick={onSubmit}
          disabled={isSubmitting}
          style={{
            width:"100%", padding:"15px 20px", borderRadius:"15px", border:"none",
            background: isSubmitting
              ? `${C.violet}88`
              : `linear-gradient(135deg, ${C.violet} 0%, ${C.rose} 100%)`,
            color:C.offWhite, fontSize:"14px", fontWeight:700, cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: isSubmitting ? "none" : `0 8px 36px rgba(123,94,167,0.42)`,
            display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
            letterSpacing:"0.01em",
          }}
        >
          {isSubmitting ? (
            <>
              <div style={{
                width:"15px", height:"15px", borderRadius:"50%",
                border:"2px solid rgba(255,255,255,0.28)", borderTopColor:C.offWhite,
                animation:"spinArc .7s linear infinite",
              }} />
              Saving log…
            </>
          ) : (
            <>
              <Zap size={14} strokeWidth={2} />
              Save today's log
            </>
          )}
        </button>
      </div>

      {/* AI box (empty pre-submit placeholder) */}
      <div className="s7">
        <div style={{ fontSize:"10px", fontWeight:700, color:C.dimmed, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"9px" }}>
          AI Insights
        </div>
        <AIRemarkBox text="" isTyping={false} />
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function DailyLogPanel({ onSave }) {
  // ── Stable "today" — computed once on mount, never changes. ──
  const today = useMemo(() => toLocalDate(), []);

  // ── Store bindings ─────────────────────────────────────────────
  const userId      = useUserStore(s => s.currentUser?._id);
  const loadDailyLog = useDailyLogStore(s => s.loadDailyLog);
  const saveDailyLog = useDailyLogStore(s => s.saveDailyLog);

  // Keep store functions in a ref so they never become effect deps.
  const loaderRef = useRef(loadDailyLog);
  const saverRef  = useRef(saveDailyLog);
  useEffect(() => { loaderRef.current = loadDailyLog; }, [loadDailyLog]);
  useEffect(() => { saverRef.current  = saveDailyLog;  }, [saveDailyLog]);

  // ── Core state ─────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(today);
  const [view,         setView]         = useState(VIEW.LOADING);
  const [savedLog,     setSavedLog]     = useState(null);   // populated from store
  const [form,         setForm]         = useState(() => makeEmptyForm(today));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI typing state (lives in root so both COMPLETED and FORM share it)
  const [aiText,      setAiText]      = useState("");
  const [isTyping,    setIsTyping]    = useState(false);
  const typingTimer   = useRef(null);

  // Confetti
  const [confetti, setConfetti] = useState(false);

  // ── Cleanup typing on unmount ──────────────────────────────────
  useEffect(() => () => clearTimeout(typingTimer.current), []);

  // ── Primary effect: load data when date or user changes ───────
  //    Dependencies: ONLY selectedDate + userId. No form, no functions.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const resolve = async () => {
      setView(VIEW.LOADING);

      const data = await loaderRef.current(selectedDate, userId);
      if (cancelled) return;

      const isToday = selectedDate === today;

      if (data) {
        // Existing log found (Cases A & C)
        setSavedLog(data);
        setAiText(data.ai_daily_remark || "");
        setIsTyping(false);
        setView(isToday ? VIEW.COMPLETED : VIEW.ARCHIVED);
      } else {
        // No log found (Cases B & D)
        setSavedLog(null);
        setAiText("");
        setIsTyping(false);
        if (isToday) {
          // Reset the form only when landing on today with no prior log
          setForm(makeEmptyForm(today));
          setView(VIEW.FORM);
        } else {
          setView(VIEW.MISSED);
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [selectedDate, userId, today]);

  // ── Form field setter — decoupled from view transitions ────────
  const setFormField = useCallback((key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const toggleHabit = useCallback((habit) => {
    setForm(prev => ({
      ...prev,
      habits_done: prev.habits_done.includes(habit)
        ? prev.habits_done.filter(h => h !== habit)
        : [...prev.habits_done, habit],
    }));
  }, []);

  // ── AI typewriter effect ───────────────────────────────────────
  const startTyping = useCallback((text) => {
    clearTimeout(typingTimer.current);
    setAiText("");
    setIsTyping(true);
    let idx = 0;
    const tick = () => {
      if (idx <= text.length) {
        setAiText(text.slice(0, idx));
        idx++;
        typingTimer.current = setTimeout(tick, 16);
      } else {
        setIsTyping(false);
      }
    };
    tick();
  }, []);

  // ── Submit handler ─────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const remark  = AI_REMARKS[Math.floor(Math.random() * AI_REMARKS.length)];
    const payload = {
      log_date:        form.log_date,
      morning_done:    Boolean(form.morning_done),
      night_done:      Boolean(form.night_done),
      habits_done:     [...form.habits_done],
      mood:            Number(form.mood),
      skin_rating:     Number(form.skin_rating),
      hydration_level: Number(form.hydration_level),
      breakout_count:  Number(form.breakout_count),
      redness_level:   Number(form.redness_level),
      notes:           form.notes.trim(),
      ai_daily_remark: remark,
      userId,
    };

    try {
      const result = onSave
        ? await onSave(payload)
        : await saverRef.current(payload);

      if (!result) throw new Error("Save returned falsy");

      setSavedLog(result);
      setIsSubmitting(false);

      // ── Transition: FORM → COMPLETED ──────────────────────────
      setView(VIEW.COMPLETED);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3800);
      setTimeout(() => startTyping(remark), 700);

    } catch (err) {
      console.error("[Luminary] DailyLog save error:", err);
      setIsSubmitting(false);
    }
  }, [form, userId, isSubmitting, onSave, startTyping]);

  // ── Score for the header ring ──────────────────────────────────
  const headerScore = useMemo(() => {
    if (view === VIEW.FORM)      return calcScore(form);
    if (savedLog)                return calcScore(savedLog);
    return 0;
  }, [view, form, savedLog]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      padding:"24px 16px 48px",
      fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color:C.offWhite,
    }}>
      <style>{STYLES}</style>
      {confetti && <Confetti />}

      <div style={{ maxWidth:"620px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"14px" }}>

        {/* ── Header (always visible) ─── */}
        <DateNavBar
          selectedDate={selectedDate}
          today={today}
          onDateChange={setSelectedDate}   // only changes selectedDate — effect handles the rest
          score={headerScore}
        />

        <div style={{ height:"1px", background:C.border }} />

        {/* ── View Router ─────────────────────────────── */}
        {/*
          key={view + selectedDate} forces a DOM remount on every transition,
          replaying the .view-enter stagger animations cleanly.
        */}
        <div key={`${view}:${selectedDate}`}>
          {view === VIEW.LOADING   && <LoadingView />}
          {view === VIEW.MISSED    && <MissedView selectedDate={selectedDate} />}
          {view === VIEW.ARCHIVED  && savedLog && (
            <ArchivedView log={savedLog} selectedDate={selectedDate} aiText={aiText} />
          )}
          {view === VIEW.COMPLETED && savedLog && (
            <CompletedView log={savedLog} aiText={aiText} isTyping={isTyping} />
          )}
          {view === VIEW.FORM && (
            <FormView
              form={form}
              setFormField={setFormField}
              toggleHabit={toggleHabit}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>

      </div>
    </div>
  );
}