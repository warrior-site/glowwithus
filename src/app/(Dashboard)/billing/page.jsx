"use client"

import { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy:      "#0A0A1A",
  navy2:     "#12122A",
  navy3:     "#1C1C38",
  navy4:     "#252545",
  cream:     "#F5F0EB",
  creamDim:  "rgba(245,240,235,0.07)",
  creamMid:  "rgba(245,240,235,0.13)",
  creamHi:   "rgba(245,240,235,0.55)",
  rose:      "#FF3E7F",
  roseDim:   "rgba(255,62,127,0.15)",
  violet:    "#7B5EA7",
  violetDim: "rgba(123,94,167,0.18)",
  amber:     "#E8A838",
  amberDim:  "rgba(232,168,56,0.14)",
  green:     "#22c55e",
  greenDim:  "rgba(34,197,94,0.12)",
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: C.navy2,
    border: `1px solid ${C.creamMid}`,
    borderRadius: 14,
    overflow: "hidden",
    ...style,
  }}>{children}</div>
);

const CardHeader = ({ title, icon, action, sub }) => (
  <div style={{
    padding: "20px 24px 16px",
    borderBottom: `1px solid ${C.creamMid}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: C.cream, display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span>{icon}</span>}{title}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.creamHi, marginTop: 3 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const PrimaryBtn = ({ children, style, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
    padding: "9px 18px", borderRadius: 8,
    background: C.rose, color: "#fff", border: "none", cursor: "pointer",
    boxShadow: "0 0 20px rgba(255,62,127,0.28)",
    transition: "all .15s", ...style,
  }}>{children}</button>
);

const GhostBtn = ({ children, style, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500,
    padding: "7px 14px", borderRadius: 8,
    background: C.creamDim, color: C.creamHi,
    border: `1px solid ${C.creamMid}`, cursor: "pointer",
    transition: "all .15s", ...style,
  }}>{children}</button>
);

const VioletBtn = ({ children, style, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
    padding: "9px 18px", borderRadius: 8,
    background: C.violetDim, color: C.violet,
    border: `1px solid rgba(123,94,167,0.3)`, cursor: "pointer",
    transition: "all .15s", ...style,
  }}>{children}</button>
);

const Mono = ({ children, style }) => (
  <span style={{ fontFamily: "'JetBrains Mono',monospace", ...style }}>{children}</span>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: C.creamHi, letterSpacing: ".3px", marginBottom: 6 }}>{children}</div>
);

const Input = ({ style, ...props }) => (
  <input style={{
    background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 9,
    padding: "10px 14px", color: C.cream,
    fontFamily: "'Inter',sans-serif", fontSize: 13.5,
    outline: "none", width: "100%", boxSizing: "border-box", ...style,
  }} {...props} />
);

// ─── Stat summary cards ───────────────────────────────────────────────────────
const SummaryStats = () => {
  const stats = [
    { label: "Next invoice",    value: "₹1,499",  sub: "Due Jul 25, 2026",    accent: C.rose,   icon: "📅" },
    { label: "Total spent",     value: "₹19,187", sub: "Since March 2024",    accent: C.violet, icon: "💸" },
    { label: "Invoices issued", value: "16",       sub: "All paid on time",    accent: C.amber,  icon: "📄" },
    { label: "Current plan",    value: "Pro",      sub: "5 seats · Active",    accent: C.green,  icon: "✦"  },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: C.navy2, border: `1px solid ${C.creamMid}`,
          borderRadius: 14, padding: "20px 22px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.accent }} />
          <div style={{ position: "absolute", top: 18, right: 18, fontSize: 18, opacity: .2 }}>{s.icon}</div>
          <div style={{ fontSize: 11.5, color: C.creamHi, fontWeight: 500 }}>{s.label}</div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: C.cream, lineHeight: 1.15, marginTop: 4 }}>{s.value}</div>
          <div style={{ fontSize: 11.5, color: C.creamHi, marginTop: 4 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Plan toggle (Monthly / Annual) ──────────────────────────────────────────
const PlanToggle = ({ billing, setBilling }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: billing === "monthly" ? C.cream : C.creamHi }}>Monthly</span>
    <div
      onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
      style={{
        width: 48, height: 26, borderRadius: 20,
        background: billing === "annual" ? C.violet : C.navy4,
        border: `1px solid ${billing === "annual" ? C.violet : C.creamMid}`,
        cursor: "pointer", position: "relative", transition: "all .2s",
      }}
    >
      <div style={{
        position: "absolute", top: 4,
        left: billing === "annual" ? 25 : 4,
        width: 16, height: 16,
        background: billing === "annual" ? "#fff" : C.creamHi,
        borderRadius: "50%", transition: "all .2s",
      }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: billing === "annual" ? C.cream : C.creamHi }}>
      Annual
      <span style={{
        marginLeft: 7, fontSize: 10, fontWeight: 700,
        background: C.amberDim, color: C.amber,
        border: `1px solid rgba(232,168,56,0.3)`,
        padding: "2px 7px", borderRadius: 20,
        fontFamily: "'JetBrains Mono',monospace",
      }}>-20%</span>
    </span>
  </div>
);

// ─── Plans grid ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for personal routines",
    monthly: 499,
    annual: 399,
    color: C.creamHi,
    accentBg: C.creamDim,
    accentBorder: C.creamMid,
    features: [
      { text: "10 AI skin analyses / month",     included: true  },
      { text: "Basic ingredient scanner",         included: true  },
      { text: "Routine builder (1 routine)",       included: true  },
      { text: "Progress photo storage (5 photos)", included: true  },
      { text: "Ingredient conflict detection",     included: false },
      { text: "PDF export & dermatologist share",  included: false },
      { text: "Team seats",                        included: false },
      { text: "API access",                        included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For serious skincare enthusiasts",
    monthly: 1499,
    annual: 1199,
    color: C.rose,
    accentBg: C.roseDim,
    accentBorder: "rgba(255,62,127,0.3)",
    badge: "CURRENT",
    popular: true,
    features: [
      { text: "Unlimited AI skin analyses",        included: true },
      { text: "Advanced ingredient scanner",        included: true },
      { text: "Unlimited routines",                 included: true },
      { text: "Unlimited progress photos",          included: true },
      { text: "Ingredient conflict detection",      included: true },
      { text: "PDF export & dermatologist share",   included: true },
      { text: "5 team seats",                       included: true },
      { text: "API access (10k calls/mo)",          included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "For clinics & power users",
    monthly: 3999,
    annual: 3199,
    color: C.violet,
    accentBg: C.violetDim,
    accentBorder: "rgba(123,94,167,0.35)",
    features: [
      { text: "Unlimited AI skin analyses",        included: true },
      { text: "Advanced ingredient scanner + API", included: true },
      { text: "Unlimited routines",                included: true },
      { text: "Unlimited progress photos",         included: true },
      { text: "Ingredient conflict detection",     included: true },
      { text: "PDF export & dermatologist share",  included: true },
      { text: "20 team seats",                     included: true },
      { text: "Full API access (unlimited)",       included: true },
    ],
  },
];

const PlansGrid = ({ billing, currentPlan, setCurrentPlan }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
    {PLANS.map(plan => {
      const isCurrent = currentPlan === plan.id;
      const price = billing === "annual" ? plan.annual : plan.monthly;
      return (
        <div key={plan.id} style={{
          background: isCurrent
            ? `linear-gradient(160deg, ${C.navy3}, ${C.navy2})`
            : C.navy2,
          border: `1px solid ${isCurrent ? plan.accentBorder : C.creamMid}`,
          borderRadius: 16,
          padding: 24,
          position: "relative",
          overflow: "hidden",
          transition: "border-color .2s",
          boxShadow: isCurrent ? `0 0 32px rgba(0,0,0,0.4)` : "none",
        }}>
          {/* Top accent line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: plan.color, opacity: isCurrent ? 1 : 0.45 }} />

          {/* Glow blob for current */}
          {isCurrent && (
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 140, height: 140,
              background: `radial-gradient(circle, ${plan.accentBg}, transparent 70%)`,
              borderRadius: "50%",
            }} />
          )}

          {/* Badge row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "1.2px",
              textTransform: "uppercase", color: plan.color,
              fontFamily: "'JetBrains Mono',monospace",
            }}>{plan.name}</div>
            {plan.badge && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: plan.accentBg, color: plan.color,
                border: `1px solid ${plan.accentBorder}`,
                fontFamily: "'JetBrains Mono',monospace", letterSpacing: "1px",
              }}>{plan.badge}</span>
            )}
            {plan.popular && !plan.badge && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: C.amberDim, color: C.amber,
                border: `1px solid rgba(232,168,56,0.3)`,
                fontFamily: "'JetBrains Mono',monospace", letterSpacing: "1px",
              }}>POPULAR</span>
            )}
          </div>

          {/* Price */}
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 38, color: C.cream, lineHeight: 1 }}>
            ₹{price.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 12, color: C.creamHi, marginTop: 5 }}>
            per month{billing === "annual" && <span style={{ color: C.amber }}> · billed annually</span>}
          </div>
          <div style={{ fontSize: 12.5, color: C.creamHi, marginTop: 8, marginBottom: 20 }}>{plan.tagline}</div>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
            {plan.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <span style={{
                  fontSize: 12, flexShrink: 0, marginTop: 1,
                  color: f.included ? C.green : "rgba(245,240,235,0.2)",
                }}>
                  {f.included ? "✓" : "✕"}
                </span>
                <span style={{ fontSize: 12.5, color: f.included ? C.cream : "rgba(245,240,235,0.28)", lineHeight: 1.4 }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isCurrent ? (
            <div style={{
              width: "100%", padding: "10px 0", borderRadius: 8, textAlign: "center",
              background: plan.accentBg, border: `1px solid ${plan.accentBorder}`,
              fontSize: 13, fontWeight: 600, color: plan.color,
              fontFamily: "'Inter',sans-serif",
            }}>
              ✓ Your current plan
            </div>
          ) : (
            <button
              onClick={() => setCurrentPlan(plan.id)}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 8,
                background: plan.id === "elite" ? C.violetDim : C.creamDim,
                border: `1px solid ${plan.id === "elite" ? "rgba(123,94,167,0.35)" : C.creamMid}`,
                color: plan.id === "elite" ? C.violet : C.creamHi,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                fontFamily: "'Inter',sans-serif",
                transition: "all .15s",
              }}
            >
              {plan.id === "starter" ? "Downgrade" : "Upgrade"} to {plan.name} →
            </button>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Current plan details bar ─────────────────────────────────────────────────
const CurrentPlanBar = ({ currentPlan, billing }) => {
  const plan = PLANS.find(p => p.id === currentPlan);
  const price = billing === "annual" ? plan.annual : plan.monthly;
  const usages = [
    { label: "AI Analyses",  val: "34 / ∞",    pct: 34, color: C.violet },
    { label: "PDF Exports",  val: "7 / 50",    pct: 14, color: C.amber  },
    { label: "Team Seats",   val: "3 / 5",     pct: 60, color: C.rose   },
    { label: "API Calls",    val: "2,841 / 10k", pct: 28, color: C.green },
  ];
  return (
    <Card>
      <div style={{ padding: "22px 28px", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Plan info */}
        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 10, letterSpacing: "1.5px", fontWeight: 700, color: plan.color, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase" }}>Active Plan</div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: C.cream, marginTop: 4 }}>{plan.name}</div>
          <div style={{ fontSize: 13, color: C.creamHi, marginTop: 2 }}>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: C.cream }}>₹{price.toLocaleString("en-IN")}</span>
            {" "}/ {billing === "annual" ? "mo (annual)" : "month"}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 12, color: C.creamHi, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: C.green }}>●</span> Renews Jul 25, 2026
            </div>
            <div style={{ fontSize: 12, color: C.creamHi, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: C.amber }}>●</span> 5 seats included
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: C.creamMid, alignSelf: "stretch", flexShrink: 0, minHeight: 80 }} />

        {/* Usage meters */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
          {usages.map(u => (
            <div key={u.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.creamHi }}>{u.label}</span>
                <Mono style={{ fontSize: 12, color: C.cream }}>{u.val}</Mono>
              </div>
              <div style={{ background: C.navy4, borderRadius: 20, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${u.pct}%`, height: "100%", background: u.color, borderRadius: 20 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <GhostBtn style={{ fontSize: 12 }}>Cancel plan</GhostBtn>
          <GhostBtn style={{ fontSize: 12 }}>View invoices ↓</GhostBtn>
        </div>
      </div>
    </Card>
  );
};

// ─── Payment methods ──────────────────────────────────────────────────────────
const PaymentMethods = () => {
  const [defaultCard, setDefaultCard] = useState(0);
  const cards = [
    { icon: "💳", bg: C.violetDim, name: "Visa ending in 4242",   detail: "Expires 08 / 2027" },
    { icon: "🏦", bg: C.amberDim,  name: "HDFC UPI",              detail: "sahana@okhdfc" },
  ];
  return (
    <Card>
      <CardHeader
        title="Payment Methods"
        icon="💳"
        sub="Charges appear as 'Lumière Technologies'"
        action={<PrimaryBtn style={{ fontSize: 12, padding: "7px 14px" }}>+ Add card</PrimaryBtn>}
      />
      <div style={{ padding: "8px 24px 18px" }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 0",
            borderBottom: i < cards.length - 1 ? `1px solid ${C.creamDim}` : "none",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{card.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: C.cream }}>{card.name}</div>
              <div style={{ fontSize: 12, color: C.creamHi, marginTop: 1 }}>{card.detail}</div>
            </div>
            {defaultCard === i ? (
              <span style={{
                fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                background: C.greenDim, color: C.green,
                border: "1px solid rgba(34,197,94,0.25)",
                fontFamily: "'JetBrains Mono',monospace",
              }}>DEFAULT</span>
            ) : (
              <GhostBtn style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setDefaultCard(i)}>Set default</GhostBtn>
            )}
            <GhostBtn style={{ fontSize: 11, padding: "4px 10px", color: C.rose, borderColor: "rgba(255,62,127,0.3)" }}>Remove</GhostBtn>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── Billing address ──────────────────────────────────────────────────────────
const BillingAddress = () => (
  <Card>
    <CardHeader title="Billing Address & Tax" icon="📍" action={<GhostBtn>Save</GhostBtn>} />
    <div style={{ padding: "20px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><Label>First name</Label><Input defaultValue="Sahana" /></div>
        <div><Label>Last name</Label><Input defaultValue="Acharya" /></div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <Label>Company (optional)</Label>
        <Input placeholder="Your company or clinic name" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <Label>GST / Tax ID</Label>
        <Input placeholder="27AABCU9603R1ZX" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <Label>Country</Label>
          <select defaultValue="India" style={{ background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 9, padding: "10px 14px", color: C.cream, fontFamily: "'Inter',sans-serif", fontSize: 13.5, width: "100%", outline: "none" }}>
            <option>India</option><option>USA</option><option>UK</option>
          </select>
        </div>
        <div><Label>State</Label><Input defaultValue="Maharashtra" /></div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <Label>Street address</Label>
        <Input defaultValue="14B, Marine Drive" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div><Label>City</Label><Input defaultValue="Mumbai" /></div>
        <div><Label>PIN code</Label><Input defaultValue="400001" /></div>
      </div>
    </div>
  </Card>
);

// ─── Invoice history ──────────────────────────────────────────────────────────
const INVOICES = [
  { id: "INV-0016", date: "Jun 25, 2026", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0015", date: "May 25, 2026", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0014", date: "Apr 25, 2026", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0013", date: "Mar 25, 2026", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0012", date: "Feb 25, 2026", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0011", date: "Jan 25, 2026", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0010", date: "Dec 25, 2025", amount: "₹1,499", plan: "Pro · Monthly", status: "paid"    },
  { id: "INV-0009", date: "Nov 25, 2025", amount: "₹1,499", plan: "Pro · Monthly", status: "refunded" },
];

const InvoiceHistory = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? INVOICES : INVOICES.slice(0, 4);
  const statusStyle = (s) => ({
    paid:     { bg: C.greenDim,  color: C.green, border: "rgba(34,197,94,0.25)"   },
    refunded: { bg: C.amberDim,  color: C.amber, border: "rgba(232,168,56,0.3)"   },
    failed:   { bg: C.roseDim,   color: C.rose,  border: "rgba(255,62,127,0.3)"   },
  }[s]);

  return (
    <Card>
      <CardHeader
        title="Invoice History"
        icon="📄"
        sub={`${INVOICES.length} invoices total`}
        action={<GhostBtn>Export all as CSV</GhostBtn>}
      />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.creamMid}` }}>
              {["Invoice", "Date", "Plan", "Amount", "Status", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "10px 24px", textAlign: "left",
                  fontSize: 11, fontWeight: 600, color: C.creamHi,
                  letterSpacing: ".5px", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((inv, i) => {
              const s = statusStyle(inv.status);
              return (
                <tr key={inv.id} style={{
                  borderBottom: i < visible.length - 1 ? `1px solid ${C.creamDim}` : "none",
                  transition: "background .12s",
                }}>
                  <td style={{ padding: "13px 24px" }}>
                    <Mono style={{ fontSize: 12.5, color: C.violet }}>{inv.id}</Mono>
                  </td>
                  <td style={{ padding: "13px 24px", fontSize: 13, color: C.creamHi, whiteSpace: "nowrap" }}>{inv.date}</td>
                  <td style={{ padding: "13px 24px", fontSize: 13, color: C.cream }}>{inv.plan}</td>
                  <td style={{ padding: "13px 24px" }}>
                    <Mono style={{ fontSize: 13.5, fontWeight: 600, color: C.cream }}>{inv.amount}</Mono>
                  </td>
                  <td style={{ padding: "13px 24px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".5px",
                    }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: "13px 24px" }}>
                    <GhostBtn style={{ fontSize: 11, padding: "4px 10px" }}>Download PDF</GhostBtn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!expanded && INVOICES.length > 4 && (
        <div style={{
          padding: "12px 24px", borderTop: `1px solid ${C.creamMid}`,
          display: "flex", justifyContent: "center",
        }}>
          <GhostBtn onClick={() => setExpanded(true)} style={{ fontSize: 12 }}>
            Show {INVOICES.length - 4} more invoices ↓
          </GhostBtn>
        </div>
      )}
    </Card>
  );
};

// ─── Upcoming changes banner ──────────────────────────────────────────────────
const UpcomingBanner = () => (
  <div style={{
    background: `linear-gradient(105deg, rgba(123,94,167,0.15), rgba(232,168,56,0.08))`,
    border: `1px solid rgba(123,94,167,0.3)`,
    borderRadius: 12, padding: "16px 22px",
    display: "flex", alignItems: "center", gap: 16,
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: C.violetDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
    }}>🔔</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: C.cream }}>Your Pro plan renews in <span style={{ color: C.amber }}>30 days</span></div>
      <div style={{ fontSize: 12, color: C.creamHi, marginTop: 2 }}>
        ₹1,499 will be charged to Visa ••4242 on July 25, 2026. Update your payment method before then to avoid interruption.
      </div>
    </div>
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <GhostBtn style={{ fontSize: 12 }}>Update card</GhostBtn>
      <VioletBtn style={{ fontSize: 12 }}>Upgrade & save 20% →</VioletBtn>
    </div>
  </div>
);

// ─── Main export ──────────────────────────────────────────────────────────────
export default function BillingPage() {
  const [billing, setBilling] = useState("monthly");
  const [currentPlan, setCurrentPlan] = useState("pro");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        select option { background: #1C1C38; }
        input::placeholder { color: rgba(245,240,235,0.3); }
        input:focus, select:focus { border-color: #7B5EA7 !important; box-shadow: 0 0 0 3px rgba(123,94,167,0.18); outline: none; }
        button:hover { opacity: 0.88; }
      `}</style>

      {/* Page heading */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: C.cream }}>Billing & Plans</div>
          <div style={{ fontSize: 13.5, color: C.creamHi, marginTop: 4 }}>
            Manage your subscription, payment methods, and download invoices.
          </div>
        </div>
        <GhostBtn style={{ fontSize: 12 }}>Contact sales</GhostBtn>
      </div>

      {/* Renewal banner */}
      <UpcomingBanner />

      {/* Summary stats */}
      <SummaryStats />

      {/* Current plan details */}
      <CurrentPlanBar currentPlan={currentPlan} billing={billing} />

      {/* Plans heading + billing toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: -8 }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: C.cream }}>Choose a plan</div>
          <div style={{ fontSize: 12.5, color: C.creamHi, marginTop: 3 }}>Click any plan to preview a switch. Changes take effect at next billing cycle.</div>
        </div>
        <PlanToggle billing={billing} setBilling={setBilling} />
      </div>

      {/* Plans grid */}
      <PlansGrid billing={billing} currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} />

      {/* Payment + Address */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <PaymentMethods />
        <BillingAddress />
      </div>

      {/* Invoice history */}
      <InvoiceHistory />

      {/* Footer note */}
      <div style={{
        padding: "16px 20px",
        background: C.creamDim, border: `1px solid ${C.creamMid}`,
        borderRadius: 10, fontSize: 12, color: C.creamHi, lineHeight: 1.6,
      }}>
        <span style={{ color: C.cream, fontWeight: 500 }}>Need help? </span>
        Reach us at <Mono style={{ color: C.violet, fontSize: 12 }}>billing@lumiere.skin</Mono> or chat with support. 
        All prices in INR and inclusive of applicable GST. Refunds are processed within 5–7 business days.
      </div>
    </div>
  );
}