"use client";

import { useEffect, useMemo, useState } from "react";
import { useDailyLogStore }      from "@/stores/useDailyLogStore";
import { useFacialAnalysisStore } from "@/stores/useFacialAnalysisStore";
import { useUserStore }           from "@/stores/useUserStore";
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#0A0A1A",
  offWhite: "#F5F0EB",
  rose:     "#FF3E7F",
  violet:   "#7B5EA7",
  amber:    "#E8A838",
  sky:      "#38BDF8",
  green:    "#22C55E",
  red:      "#FF6B6B",
  card:     "rgba(255,255,255,0.038)",
  border:   "rgba(255,255,255,0.072)",
  borderHi: "rgba(255,255,255,0.13)",
  muted:    "rgba(245,240,235,0.42)",
  dimmed:   "rgba(245,240,235,0.25)",
};

// ─── Correlation data ──────────────────────────────────────────────────────────
const CORRELATIONS = [
  { label: "Hydration ↑ → Breakouts ↓", value: "+82%", color: C.green  },
  { label: "Stress ↑ → Redness ↑",       value: "+67%", color: C.rose   },
  { label: "No Dairy → Clarity ↑",        value: "+74%", color: C.amber  },
];

// ─── Animated Counter Hook ─────────────────────────────────────────────────────
function useCountUp(target, duration = 1100, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || target == null) return;
    let frame;
    const start = performance.now();
    const tick  = (now) => {
      const p    = Math.min((now - start) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(ease * target));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);
  return value;
}

// ─── Skeleton Shimmer ──────────────────────────────────────────────────────────
function Skeleton({ width = "100%", height = 20, radius = 6, style = {} }) {
  return (
    <>
      <div className="sk" style={{ width, height, borderRadius: radius, ...style }} />
      <style jsx>{`
        .sk {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 0%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.8s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

// ─── Glass Card ────────────────────────────────────────────────────────────────
function GlassCard({ title, subtitle, children, accent = C.rose, badge, fadeIn = 0 }) {
  return (
    <div className="card" style={{ animationDelay: `${fadeIn}ms` }}>
      <div className="topline" style={{ background: `linear-gradient(90deg, ${accent}, ${C.violet} 60%, transparent)` }} />
      <div className="cardhead">
        <div>
          <h3 className="ct">{title}</h3>
          {subtitle && <p className="cs">{subtitle}</p>}
        </div>
        {badge && <span className="badge">{badge}</span>}
      </div>
      {children}
      <style jsx>{`
        .card {
          position: relative;
          background: ${C.card};
          border-radius: 16px;
          padding: 20px;
          border: 1px solid ${C.border};
          animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
          overflow: hidden;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .topline { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .cardhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 8px;
        }
        .ct {
          font-size: 11px;
          font-weight: 700;
          color: rgba(245,240,235,0.85);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
        }
        .cs { font-size: 11px; color: ${C.dimmed}; margin: 3px 0 0; }
        .badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255,62,127,0.1);
          color: ${C.rose};
          border: 1px solid rgba(255,62,127,0.22);
          border-radius: 99px;
          padding: 3px 9px;
          flex-shrink: 0;
          margin-top: 1px;
        }
      `}</style>
    </div>
  );
}

// ─── KPI Tile ──────────────────────────────────────────────────────────────────
function KPITile({ title, value, unit, delta, deltaLabel, color, isLoading, fadeIn = 0 }) {
  const display  = useCountUp(typeof value === "number" ? Math.round(value) : 0, 1100, !isLoading);
  const positive = delta == null || delta >= 0;

  return (
    <div className="kpi" style={{ animationDelay: `${fadeIn}ms` }}>
      <div className="accent-line" style={{ background: color }} />
      <p className="kpi-title">{title}</p>

      {isLoading ? (
        <Skeleton height={40} width="60%" radius={8} style={{ marginTop: 8, marginBottom: 6 }} />
      ) : (
        <div className="kpi-val-row">
          <span className="kpi-num" style={{ color }}>{display}</span>
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
      )}

      {delta !== undefined && !isLoading && (
        <span className={`kpi-delta ${positive ? "pos" : "neg"}`}>
          {positive ? "↑" : "↓"}{" "}
          {deltaLabel ?? `${Math.abs(Math.round(delta * 10) / 10)} vs prev scan`}
        </span>
      )}

      <style jsx>{`
        .kpi {
          position: relative;
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 14px;
          padding: 16px 18px;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease;
          animation: fadeUp 0.52s cubic-bezier(0.22,1,0.36,1) both;
        }
        .kpi:hover { transform: translateY(-2px); border-color: ${C.borderHi}; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .accent-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0.85; }
        .kpi-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: rgba(245,240,235,0.35);
          margin: 0 0 6px;
        }
        .kpi-val-row { display: flex; align-items: baseline; gap: 4px; }
        .kpi-num {
          font-size: 38px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
        }
        .kpi-unit { font-size: 14px; color: ${C.dimmed}; margin-bottom: 2px; }
        .kpi-delta { font-size: 11px; color: ${C.dimmed}; margin-top: 5px; display: block; }
        .kpi-delta.pos { color: ${C.green}; }
        .kpi-delta.neg { color: ${C.rose}; }
      `}</style>
    </div>
  );
}

// ─── Radial Score Gauge ────────────────────────────────────────────────────────
function ScoreGauge({ score, isLoading }) {
  const [mounted, setMounted] = useState(false);
  const animated = useCountUp(score, 1400, mounted && !isLoading);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const SIZE  = 164;
  const R     = 66;
  const circ  = 2 * Math.PI * R;
  const arc   = circ * 0.75;           // 270° sweep
  const fill  = (animated / 100) * arc;

  const gradeColor = score >= 75 ? C.green : score >= 55 ? C.amber : C.rose;
  const grade      = score >= 75 ? "Excellent" : score >= 55 ? "Good" : score >= 35 ? "Fair" : "Poor";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
        <Skeleton width={SIZE} height={SIZE} radius={SIZE / 2} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img" aria-label={`Skin health gauge at ${score} out of 100, rated ${grade}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={C.rose}   />
            <stop offset="55%"  stopColor={C.violet} />
            <stop offset="100%" stopColor={C.green}  />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ}`}
          transform={`rotate(135 ${SIZE / 2} ${SIZE / 2})`}
        />
        {/* Fill */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(135 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: "stroke-dasharray 1.3s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{
          fontSize: "38px", fontWeight: 800, color: C.offWhite,
          lineHeight: 1, letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}>{animated}</span>
        <span style={{ fontSize: "10px", color: C.dimmed, marginTop: "2px" }}>out of 100</span>
        <span style={{
          fontSize: "11px", fontWeight: 700, color: gradeColor,
          letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "5px",
        }}>{grade}</span>
      </div>
    </div>
  );
}

// ─── Metric Bar ────────────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 5, color }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div className="row">
      <span className="lbl">{label}</span>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="val">
        {value}<span className="max">/{max}</span>
      </span>
      <style jsx>{`
        .row  { display: flex; align-items: center; gap: 10px; margin-bottom: 11px; }
        .lbl  { font-size: 11px; color: ${C.muted}; width: 86px; flex-shrink: 0; }
        .track {
          flex: 1; height: 5px;
          background: rgba(255,255,255,0.07);
          border-radius: 99px; overflow: hidden;
        }
        .fill {
          height: 100%; border-radius: 99px;
          transition: width 1.1s cubic-bezier(0.22,1,0.36,1);
          box-shadow: 0 0 10px ${color}55;
        }
        .val  {
          font-size: 12px; font-weight: 600;
          color: rgba(245,240,235,0.6);
          width: 28px; text-align: right; flex-shrink: 0;
          font-variant-numeric: tabular-nums;
        }
        .max  { color: ${C.dimmed}; font-weight: 400; }
      `}</style>
    </div>
  );
}

// ─── Recharts Custom Tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(8,8,20,0.96)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 10, padding: "10px 14px",
      backdropFilter: "blur(24px)",
    }}>
      <p style={{ color: C.dimmed, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((p, i) =>
        p.value != null && (
          <p key={i} style={{
            color: p.color, fontSize: 13, fontWeight: 600,
            margin: "3px 0", display: "flex", gap: 8, alignItems: "center",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </p>
        )
      )}
    </div>
  );
}

// ─── Correlation Row ───────────────────────────────────────────────────────────
function CorrelationRow({ label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "7px 10px",
      background: "rgba(255,255,255,0.025)",
      border: `1px solid rgba(255,255,255,0.05)`,
      borderRadius: "8px",
    }}>
      <span style={{ fontSize: "11px", color: C.muted }}>{label}</span>
      <span style={{ fontSize: "11px", fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

// ─── Score Breakdown Strip ─────────────────────────────────────────────────────
function ScoreBreakdown({ scan }) {
  const items = [
    { label: "Acne",     val: scan?.ai_metrics?.acne_score    ?? "--", color: C.amber  },
    { label: "Redness",  val: scan?.ai_metrics?.redness_score ?? "--", color: C.red    },
    { label: "Pores",    val: scan?.ai_metrics?.pores_score   ?? "--", color: C.violet },
    { label: "Texture",  val: scan?.ai_metrics?.wrinkle_score ?? "--", color: "#9CA3AF" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "14px" }}>
      {items.map(({ label, val, color }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {val}
          </span>
          <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.06em", color: C.dimmed }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── AI Summary Strip ──────────────────────────────────────────────────────────
function AISummaryStrip({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: `rgba(255,62,127,0.06)`,
      borderRadius: "10px",
      borderLeft: `2px solid rgba(255,62,127,0.3)`,
      padding: "10px 12px",
      display: "flex", gap: "8px", alignItems: "flex-start",
    }}>
      <span style={{
        fontSize: "8px", fontWeight: 800, letterSpacing: "0.08em",
        background: "rgba(255,62,127,0.15)", color: C.rose,
        borderRadius: "4px", padding: "2px 5px", flexShrink: 0, marginTop: "1px",
      }}>AI</span>
      <p style={{ margin: 0, fontSize: "12px", color: "rgba(245,240,235,0.6)", lineHeight: "1.62" }}>
        {text}
      </p>
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ value, label, color }) {
  return (
    <div style={{
      flex: 1,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: "10px", padding: "12px 0",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
    }}>
      <span style={{ fontSize: "20px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", color: C.dimmed }}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { currentUser }                          = useUserStore();
  const { log, loadDailyLog }                    = useDailyLogStore();
  const { history, isLoading, fetchAnalysisData } = useFacialAnalysisStore();
  const [period, setPeriod]                      = useState("30d");

  useEffect(() => {
    if (!currentUser?._id) return;
    fetchAnalysisData(currentUser._id);
    loadDailyLog(undefined, currentUser._id);
  }, [currentUser?._id]);

  // ── Sorted completed history ──────────────────────────────────────────────
  const completedHistory = useMemo(() =>
    [...history]
      .filter(h => h.status === "completed")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [history]
  );

  const latestScan  = completedHistory.at(-1);
  const prevScan    = completedHistory.at(-2);
  const latestScore = latestScan?.overall_health_score ?? null;
  const scoreDelta  = latestScore != null && prevScan
    ? latestScore - prevScan.overall_health_score
    : undefined;
  const latestRecs  = latestScan?.ai_recommendations ?? [];

  // ── Chart data ────────────────────────────────────────────────────────────
  const analysisChartData = useMemo(() =>
    completedHistory.map(item => ({
      date:    new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      health:  item.overall_health_score,
      acne:    item.ai_metrics?.acne_score    ?? 0,
      redness: item.ai_metrics?.redness_score ?? 0,
    })),
    [completedHistory]
  );

  // ── 5-day dampened linear prediction ─────────────────────────────────────
  const combinedData = useMemo(() => {
    if (analysisChartData.length < 2) return analysisChartData;
    const last  = analysisChartData.at(-1);
    const prev  = analysisChartData.at(-2);
    const trend = (last.health - prev.health) * 0.55;
    const preds = Array.from({ length: 5 }, (_, i) => ({
      date:      `+${i + 1}d`,
      predicted: parseFloat(
        Math.max(0, Math.min(100, last.health + trend * (i + 1))).toFixed(1)
      ),
    }));
    return [...analysisChartData, ...preds];
  }, [analysisChartData]);

  // ── 30-day heatmap ────────────────────────────────────────────────────────
  const heatmapCells = useMemo(() => {
    const scanDays = new Set(
      completedHistory.map(h => new Date(h.createdAt).toDateString())
    );
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { key: d.toDateString(), active: scanDays.has(d.toDateString()) };
    });
  }, [completedHistory]);
  const scanCount = heatmapCells.filter(c => c.active).length;

  // ── AI correlation insight ────────────────────────────────────────────────
  const insight = useMemo(() => {
    if (!log) return null;
    const { hydration_level: h, breakout_count: b, redness_level: r, mood: m } = log;
    if (h <= 2 && b >= 3)
      return { icon: "💧", text: "Low hydration correlates with higher breakout frequency in your logs. Try increasing daily water intake.", severity: "warn" };
    if (m <= 2 && r >= 3)
      return { icon: "😰", text: "Elevated stress appears linked to increased skin redness. Consider adding a calming PM routine.", severity: "warn" };
    if (h >= 4 && b <= 1)
      return { icon: "✨", text: "Strong hydration is keeping breakouts minimal — this is working. Protect this habit.", severity: "good" };
    if (latestScore && latestScore >= 75)
      return { icon: "🌟", text: "Skin health score is in the excellent range. Your consistent routine is producing measurable results.", severity: "good" };
    return { icon: "📊", text: "Skin metrics are stable. Consistency is your biggest lever right now — keep logging daily.", severity: "neutral" };
  }, [log, latestScore]);

  const streak = currentUser?.streak_count ?? 0;

  // ── Streak conic % ────────────────────────────────────────────────────────
  const streakPct = Math.min(streak * 3.33, 100);

  return (
    <div className="page">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <p className="eyebrow">Luminary · DermAI</p>
          <h1 className="page-title">Skin Intelligence</h1>
        </div>
        <div className="period-tabs">
          {["7d", "30d", "90d"].map(p => (
            <button
              key={p}
              className={`pt-btn${period === p ? " active" : ""}`}
              onClick={() => setPeriod(p)}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────────────── */}
      <div className="kpi-grid">
        <KPITile
          title="Skin Health Score"
          value={latestScore ?? 0}
          delta={scoreDelta}
          color={C.rose}
          isLoading={isLoading}
          fadeIn={0}
        />
        <KPITile
          title="Breakouts Today"
          value={log?.breakout_count ?? 0}
          deltaLabel={log?.breakout_count > 0 ? "active today" : "Clear skin today 🎉"}
          delta={log?.breakout_count > 0 ? -1 : 0}
          color={C.amber}
          isLoading={isLoading}
          fadeIn={70}
        />
        <KPITile
          title="Hydration Level"
          value={log?.hydration_level ?? 0}
          unit="/5"
          delta={0}
          deltaLabel="Plump &amp; dewy"
          color={C.violet}
          isLoading={isLoading}
          fadeIn={140}
        />
        <KPITile
          title="Routine Streak"
          value={streak}
          unit=" days"
          delta={0}
          deltaLabel="Personal best 🔥"
          color={C.green}
          isLoading={isLoading}
          fadeIn={210}
        />
      </div>

      {/* ── Hero Row: Gauge + Wellness Log ────────────────────────────────── */}
      <div className="hero-grid">

        {/* Gauge Card */}
        <GlassCard
          title="Overall Skin Score"
          subtitle="Latest completed DermAI scan"
          badge="AI"
          fadeIn={280}
        >
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
              <Skeleton width={164} height={164} radius={82} />
            </div>
          ) : latestScore != null ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <ScoreGauge score={latestScore} isLoading={isLoading} />
              </div>
              <ScoreBreakdown scan={latestScan} />
              <AISummaryStrip text={latestScan?.ai_summary} />
            </>
          ) : (
            <div className="empty">
              <p className="empty-title">No scan data yet</p>
              <span className="empty-sub">Complete a DermAI scan to see your score</span>
            </div>
          )}
        </GlassCard>

        {/* Daily Wellness Card */}
        <GlassCard
          title="Today's Wellness Log"
          subtitle="Self-reported skin &amp; mood metrics"
          accent={C.violet}
          fadeIn={340}
        >
          {isLoading || !log ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} height={13} radius={4} style={{ marginBottom: 14 }} />)}
            </div>
          ) : (
            <>
              <MetricBar label="Hydration"  value={log.hydration_level} color={C.violet} />
              <MetricBar label="Mood"        value={log.mood}             color={C.amber}  />
              <MetricBar label="Skin Rating" value={log.skin_rating}      color={C.rose}   />
              <MetricBar label="Redness"     value={log.redness_level}    color={C.red}    />

              <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                <StatChip value={log.breakout_count}     label="Breakouts"  color={C.amber} />
                <StatChip value={log.morning_done ? "✓" : "–"} label="AM Routine" color={log.morning_done ? C.green : C.dimmed} />
                <StatChip value={log.night_done   ? "✓" : "–"} label="PM Routine" color={log.night_done   ? C.green : C.dimmed} />
                <StatChip value={log.habits_done?.length ?? 0}  label="Habits"     color={C.sky} />
              </div>

              {log.notes?.trim() && (
                <div style={{
                  marginTop: "14px", padding: "10px 12px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px", borderLeft: `2px solid rgba(123,94,167,0.35)`,
                }}>
                  <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.07em", color: C.dimmed, marginBottom: "4px" }}>
                    Note
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(245,240,235,0.65)", lineHeight: "1.55" }}>
                    {log.notes}
                  </p>
                </div>
              )}
            </>
          )}
        </GlassCard>
      </div>

      {/* ── Progress Chart ────────────────────────────────────────────────── */}
      <GlassCard
        title="AI Skin Progress + Prediction"
        subtitle={`${completedHistory.length} scan${completedHistory.length !== 1 ? "s" : ""} · dashed line = 5-day AI projection`}
        badge="Live"
        accent={C.rose}
        fadeIn={400}
      >
        {isLoading ? (
          <Skeleton height={288} radius={8} />
        ) : analysisChartData.length === 0 ? (
          <div className="empty" style={{ padding: "48px 0" }}>
            <p className="empty-title">No scan history</p>
            <span className="empty-sub">Complete at least one DermAI scan to populate this chart</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={288}>
              <ComposedChart data={combinedData} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="healthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.rose} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={C.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(245,240,235,0.15)"
                  tick={{ fontSize: 10, fill: "rgba(245,240,235,0.35)" }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="rgba(245,240,235,0.15)"
                  tick={{ fontSize: 10, fill: "rgba(245,240,235,0.35)" }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="health" name="Health Score"
                  stroke={C.rose} strokeWidth={2.5} fill="url(#healthFill)"
                  dot={false} activeDot={{ r: 4, fill: C.rose, strokeWidth: 0 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="acne" name="Acne Score"
                  stroke={C.amber} strokeWidth={1.5}
                  dot={false} activeDot={{ r: 3, fill: C.amber, strokeWidth: 0 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="redness" name="Redness"
                  stroke={C.red} strokeWidth={1.5}
                  dot={false} activeDot={{ r: 3, fill: C.red, strokeWidth: 0 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="predicted" name="Predicted"
                  stroke={C.violet} strokeWidth={2} strokeDasharray="6 4"
                  dot={false} activeDot={{ r: 3, fill: C.violet, strokeWidth: 0 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="chart-legend">
              {[
                { color: C.rose,   label: "Health Score" },
                { color: C.amber,  label: "Acne" },
                { color: C.red,    label: "Redness" },
                { color: C.violet, label: "Predicted", dashed: true },
              ].map(l => (
                <div key={l.label} className="legend-item">
                  <div className="legend-line" style={{
                    background: l.dashed ? "none" : l.color,
                    borderTop: l.dashed ? `2px dashed ${l.color}` : "none",
                    height: l.dashed ? 0 : 2,
                  }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCard>

      {/* ── Insights + Recommendations ────────────────────────────────────── */}
      <div className="bottom-grid">

        {/* AI Correlation Insight */}
        <GlassCard title="AI Correlation Insight" badge="AI" accent={C.amber} fadeIn={460}>
          {isLoading ? (
            <Skeleton height={72} radius={10} />
          ) : !log ? (
            <div className="empty" style={{ padding: "24px 0" }}>
              <p className="empty-title">Log today's metrics</p>
              <span className="empty-sub">Fill in your daily wellness log to unlock AI correlations</span>
            </div>
          ) : insight ? (
            <>
              <div className={`insight-box sev-${insight.severity}`} style={{ marginBottom: "14px" }}>
                <span className="i-icon">{insight.icon}</span>
                <p className="i-text">{insight.text}</p>
              </div>

              {/* Correlation matrix */}
              <p style={{
                fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: C.dimmed, marginBottom: "8px",
              }}>Tracked Correlations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {CORRELATIONS.map(c => (
                  <CorrelationRow key={c.label} {...c} />
                ))}
              </div>
            </>
          ) : null}
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard
          title="AI Recommendations"
          subtitle="From your most recent scan"
          badge="AI"
          accent={C.violet}
          fadeIn={520}
        >
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[1, 2, 3].map(i => <Skeleton key={i} height={13} radius={4} style={{ marginBottom: 12 }} />)}
            </div>
          ) : latestRecs.length === 0 ? (
            <div className="empty" style={{ padding: "24px 0" }}>
              <p className="empty-title">No recommendations yet</p>
              <span className="empty-sub">Run a facial scan to get personalised skincare advice</span>
            </div>
          ) : (
            <ul className="rec-list">
              {latestRecs.slice(0, 5).map((r, i) => (
                <li key={i} className="rec-item">
                  <span className="rec-dot" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      {/* ── 30-Day Heatmap ────────────────────────────────────────────────── */}
      <GlassCard
        title="30-Day Scan Consistency"
        subtitle={`${scanCount} scan${scanCount !== 1 ? "s" : ""} in the last 30 days`}
        accent={C.rose}
        fadeIn={580}
      >
        <div className="heatmap">
          {heatmapCells.map((c, i) => (
            <div key={i} title={c.key} className={`hm-cell${c.active ? " active" : ""}`} />
          ))}
        </div>
        <div className="hm-footer">
          <span className="hm-label">30 days ago</span>
          <div className="hm-legend">
            <div className="hm-cell" />
            <span>No scan</span>
            <div className="hm-cell active" />
            <span>Scanned</span>
          </div>
          <span className="hm-label">Today</span>
        </div>
      </GlassCard>

      {/* ── Streak Ring ───────────────────────────────────────────────────── */}
      <GlassCard
        title="Routine Streak"
        subtitle="Consecutive days with a completed log"
        accent={C.green}
        fadeIn={640}
      >
        <div className="streak-wrap">
          {/* Conic ring */}
          <div className="streak-ring" style={{
            background: `conic-gradient(${C.green} ${streakPct}%, rgba(255,255,255,0.065) 0%)`,
          }}>
            <div className="streak-inner">
              <span className="streak-num">{streak}</span>
              <span className="streak-unit">days 🔥</span>
            </div>
          </div>

          {/* Stats */}
          <div className="streak-meta">
            <div className="streak-stat">
              <span className="ss-val">{completedHistory.length}</span>
              <span className="ss-lbl">Total Scans</span>
            </div>
            <div className="streak-stat">
              <span className="ss-val">{scanCount}</span>
              <span className="ss-lbl">This Month</span>
            </div>
            <div className="streak-stat">
              <span className="ss-val" style={{ color: latestScore && latestScore >= 70 ? C.green : C.amber }}>
                {latestScore ?? "--"}
              </span>
              <span className="ss-lbl">Last Score</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Styles ────────────────────────────────────────────────────────── */}
      <style jsx>{`
        .page {
          background: ${C.bg};
          min-height: 100vh;
          padding: 32px 36px;
          color: ${C.offWhite};
          font-family: -apple-system, 'Inter', BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Header ──────────────────────────────────────────────────── */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4px;
        }
        .eyebrow {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${C.rose};
          margin: 0 0 5px;
        }
        .page-title {
          font-size: 26px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.03em;
          color: ${C.offWhite};
        }

        /* ── Period tabs ─────────────────────────────────────────────── */
        .period-tabs {
          display: flex;
          gap: 3px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 3px;
        }
        .pt-btn {
          background: none;
          border: none;
          color: rgba(245,240,235,0.35);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.18s;
          letter-spacing: 0.04em;
          font-family: inherit;
        }
        .pt-btn.active { background: rgba(255,255,255,0.09); color: ${C.offWhite}; }
        .pt-btn:hover:not(.active) { color: rgba(245,240,235,0.7); }

        /* ── Grids ───────────────────────────────────────────────────── */
        .kpi-grid    { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
        .hero-grid   { display: grid; grid-template-columns: 300px 1fr; gap: 14px; }
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* ── Chart legend ────────────────────────────────────────────── */
        .chart-legend { display: flex; gap: 20px; margin-top: 14px; flex-wrap: wrap; }
        .legend-item  { display: flex; align-items: center; gap: 7px; font-size: 11px; color: ${C.muted}; }
        .legend-line  { width: 20px; }

        /* ── Insight box ─────────────────────────────────────────────── */
        .insight-box {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 14px 16px;
          border-radius: 12px;
        }
        .sev-warn    { background: rgba(232,168,56,0.07);  border: 1px solid rgba(232,168,56,0.16); }
        .sev-good    { background: rgba(34,197,94,0.07);   border: 1px solid rgba(34,197,94,0.16); }
        .sev-neutral { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .i-icon { font-size: 26px; flex-shrink: 0; line-height: 1; }
        .i-text { font-size: 13px; line-height: 1.65; color: rgba(245,240,235,0.78); margin: 0; }

        /* ── Recommendations ─────────────────────────────────────────── */
        .rec-list  { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 11px; }
        .rec-item  { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: rgba(245,240,235,0.7); line-height: 1.55; }
        .rec-dot   { width: 5px; height: 5px; border-radius: 50%; background: ${C.violet}; flex-shrink: 0; margin-top: 7px; box-shadow: 0 0 8px ${C.violet}99; }

        /* ── Heatmap ─────────────────────────────────────────────────── */
        .heatmap   { display: grid; grid-template-columns: repeat(15,1fr); gap: 5px; margin-bottom: 10px; }
        .hm-cell   { aspect-ratio: 1; background: rgba(255,255,255,0.065); border-radius: 4px; transition: background 0.2s, transform 0.15s; cursor: default; }
        .hm-cell:hover { transform: scale(1.25); }
        .hm-cell.active { background: ${C.rose}; box-shadow: 0 0 8px rgba(255,62,127,0.45); }
        .hm-footer { display: flex; justify-content: space-between; align-items: center; }
        .hm-label  { font-size: 10px; color: ${C.dimmed}; }
        .hm-legend { display: flex; align-items: center; gap: 7px; font-size: 10px; color: rgba(245,240,235,0.35); }
        .hm-legend .hm-cell { width: 11px; height: 11px; }

        /* ── Streak ──────────────────────────────────────────────────── */
        .streak-wrap  { display: flex; align-items: center; gap: 32px; }
        .streak-ring  {
          width: 128px; height: 128px; border-radius: 50%;
          flex-shrink: 0; display: flex;
          align-items: center; justify-content: center;
          transition: background 1.2s ease;
        }
        .streak-inner {
          width: 88px; height: 88px; border-radius: 50%;
          background: ${C.bg};
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 2px;
        }
        .streak-num  { font-size: 30px; font-weight: 800; color: ${C.offWhite}; line-height: 1; font-variant-numeric: tabular-nums; }
        .streak-unit { font-size: 11px; color: ${C.dimmed}; }
        .streak-meta { display: flex; gap: 24px; flex-wrap: wrap; }
        .streak-stat { display: flex; flex-direction: column; gap: 3px; }
        .ss-val { font-size: 24px; font-weight: 700; color: ${C.offWhite}; font-variant-numeric: tabular-nums; }
        .ss-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: ${C.dimmed}; }

        /* ── Empty states ────────────────────────────────────────────── */
        .empty       { text-align: center; }
        .empty-title { font-size: 14px; font-weight: 600; color: rgba(245,240,235,0.3); margin: 0 0 4px; }
        .empty-sub   { font-size: 12px; color: rgba(245,240,235,0.18); }

        /* ── Responsive ──────────────────────────────────────────────── */
        @media (max-width: 960px) {
          .page        { padding: 20px 16px; }
          .kpi-grid    { grid-template-columns: repeat(2,1fr); }
          .hero-grid,
          .bottom-grid { grid-template-columns: 1fr; }
          .heatmap     { grid-template-columns: repeat(10,1fr); }
          .streak-wrap { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .kpi-grid  { grid-template-columns: 1fr 1fr; }
          .page-title { font-size: 20px; }
          .streak-meta { gap: 16px; }
        }
      `}</style>
    </div>
  );
}