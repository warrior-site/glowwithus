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
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: C.navy2,
    border: `1px solid ${C.creamMid}`,
    borderRadius: 14,
    overflow: "hidden",
    ...style,
  }}>
    {children}
  </div>
);

const CardHeader = ({ title, icon, action }) => (
  <div style={{
    padding: "18px 24px 14px",
    borderBottom: `1px solid ${C.creamMid}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: C.cream, display: "flex", alignItems: "center", gap: 8 }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {title}
    </div>
    {action}
  </div>
);

const GhostBtn = ({ children, style, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 500,
    padding: "6px 13px", borderRadius: 8,
    background: C.creamDim, color: C.creamHi,
    border: `1px solid ${C.creamMid}`,
    cursor: "pointer", ...style,
  }}>
    {children}
  </button>
);

const PrimaryBtn = ({ children, style, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
    padding: "8px 16px", borderRadius: 8,
    background: C.rose, color: "#fff",
    border: "none", cursor: "pointer",
    boxShadow: "0 0 20px rgba(255,62,127,0.3)", ...style,
  }}>
    {children}
  </button>
);

const VioletBtn = ({ children, style, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500,
    padding: "8px 16px", borderRadius: 8,
    background: C.violetDim, color: C.violet,
    border: `1px solid rgba(123,94,167,0.3)`,
    cursor: "pointer", ...style,
  }}>
    {children}
  </button>
);

const DangerBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background: "transparent",
    border: "1px solid rgba(255,62,127,0.4)",
    color: C.rose, fontSize: 12,
    padding: "7px 14px", borderRadius: 7,
    cursor: "pointer",
    fontFamily: "'Inter',sans-serif", fontWeight: 500,
    flexShrink: 0, marginTop: 2,
  }}>
    {children}
  </button>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: C.creamHi, letterSpacing: ".3px", marginBottom: 6 }}>
    {children}
  </div>
);

const SelectField = ({ label, options, defaultValue, style }) => (
  <div style={{ marginBottom: 16, ...style }}>
    <FieldLabel>{label}</FieldLabel>
    <select defaultValue={defaultValue} style={{
      background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 9,
      padding: "10px 14px", color: C.cream,
      fontFamily: "'Inter',sans-serif", fontSize: 13.5,
      width: "100%", outline: "none",
    }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const InputField = ({ label, type = "text", placeholder, style }) => (
  <div style={{ marginBottom: 16, ...style }}>
    <FieldLabel>{label}</FieldLabel>
    <input type={type} placeholder={placeholder} style={{
      background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 9,
      padding: "10px 14px", color: C.cream,
      fontFamily: "'Inter',sans-serif", fontSize: 13.5,
      outline: "none", width: "100%", boxSizing: "border-box",
    }} />
  </div>
);

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ title, desc, defaultChecked = false, last = false }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: last ? "none" : `1px solid ${C.creamDim}`,
    }}>
      <div style={{ flex: 1, paddingRight: 20 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: C.cream }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: C.creamHi, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <div
        onClick={() => setOn(v => !v)}
        style={{
          width: 42, height: 23,
          background: on ? C.rose : C.navy4,
          borderRadius: 20,
          border: `1px solid ${on ? C.rose : C.creamMid}`,
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
          transition: "all .2s",
        }}
      >
        <div style={{
          position: "absolute",
          top: 3, left: on ? 22 : 3,
          width: 15, height: 15,
          background: on ? "#fff" : C.creamHi,
          borderRadius: "50%",
          transition: "all .2s",
          boxShadow: on ? "0 1px 6px rgba(0,0,0,0.3)" : "none",
        }} />
      </div>
    </div>
  );
};

// ─── API Key row ──────────────────────────────────────────────────────────────
const ApiKeyRow = ({ label, keyText }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: C.navy3, border: `1px solid ${C.creamMid}`,
        borderRadius: 9, padding: "10px 14px",
      }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: C.creamHi, flex: 1 }}>
          {keyText}
        </div>
        <button onClick={handleCopy} style={{
          fontSize: 12, fontWeight: 500,
          color: copied ? C.green : C.violet,
          background: copied ? "rgba(34,197,94,0.12)" : C.violetDim,
          border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(123,94,167,0.3)"}`,
          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          fontFamily: "'Inter',sans-serif", transition: "all .15s",
        }}>
          {copied ? "Copied!" : "Copy"}
        </button>
        <DangerBtn>Revoke</DangerBtn>
      </div>
    </div>
  );
};

// ─── Sections ─────────────────────────────────────────────────────────────────

const NotificationsCard = () => (
  <Card>
    <CardHeader title="Notifications" icon="🔔" />
    <div style={{ padding: "4px 24px 12px" }}>
      <ToggleRow title="Routine reminders"         desc="Get notified at your AM/PM routine times."                                             defaultChecked />
      <ToggleRow title="Ingredient conflict alerts" desc="Notify me when a new product conflicts with my routine."                              defaultChecked />
      <ToggleRow title="Weekly skin score digest"   desc="Summary email every Monday with your score trend."                                    defaultChecked />
      <ToggleRow title="Product restock reminders"  desc="Estimate when products run out based on usage." />
      <ToggleRow title="New AI recommendations"     desc="Alert when AI finds a better product for your concerns."                              defaultChecked />
      <ToggleRow title="Marketing & product news"   desc="Updates from the Lumière team on new features."                                       last />
    </div>
  </Card>
);

const PrivacyCard = () => (
  <Card>
    <CardHeader title="Privacy & Data" icon="🔒" />
    <div style={{ padding: "4px 24px 12px" }}>
      <ToggleRow title="Use my data to improve AI models" desc="Your anonymized scan data trains Lumière's analysis engine." defaultChecked />
      <ToggleRow title="Allow dermatologist access"        desc="Lets verified dermatologists on Lumière view your reports." />
      <ToggleRow title="Public profile"                    desc="Your skin score and bio appear on the Lumière community." />
      <ToggleRow title="Share progress photos with team"   desc="Team members can view your before/after photos." last />
    </div>
    <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
      <GhostBtn style={{ fontSize: 12 }}>Download my data</GhostBtn>
      <GhostBtn style={{ fontSize: 12 }}>View data report</GhostBtn>
    </div>
  </Card>
);

const AppearanceCard = () => (
  <Card>
    <CardHeader title="Appearance & Preferences" icon="◈" />
    <div style={{ padding: "20px 24px" }}>
      <SelectField label="Dashboard theme"      options={["Dark (Default)", "Light", "System"]}                               defaultValue="Dark (Default)" />
      <SelectField label="Language"             options={["English", "Hindi", "Tamil"]}                                       defaultValue="English" />
      <SelectField label="Measurement units"    options={["Metric (ml, g)", "Imperial (oz, fl oz)"]}                          defaultValue="Metric (ml, g)" />
      <SelectField label="Routine time zone"    options={["Asia/Kolkata (IST, UTC+5:30)", "UTC", "America/New_York"]}         defaultValue="Asia/Kolkata (IST, UTC+5:30)" />
      <SelectField label="Default routine view" options={["Timeline", "Card grid", "Compact list"]}                           defaultValue="Card grid" style={{ marginBottom: 0 }} />
    </div>
  </Card>
);

const SecurityCard = () => (
  <Card>
    <CardHeader title="Security" icon="⊹" />
    <div style={{ padding: "20px 24px" }}>
      <InputField label="Current password" type="password" placeholder="Enter current password" />
      <InputField label="New password"     type="password" placeholder="At least 12 characters" />
      <InputField label="Confirm password" type="password" placeholder="Repeat new password" style={{ marginBottom: 18 }} />
      <VioletBtn style={{ fontSize: 13, marginBottom: 20 }}>Update password</VioletBtn>

      <div style={{ borderTop: `1px solid ${C.creamMid}`, paddingTop: 16 }}>
        <ToggleRow title="Two-factor authentication" desc="Require a code from your authenticator app on login." defaultChecked />
        <ToggleRow title="Login alerts"              desc="Email me when a new device logs into my account."    defaultChecked />
        <ToggleRow title="Session timeout (30 min)"  desc="Auto-log out after 30 minutes of inactivity."       last />
      </div>
    </div>
  </Card>
);

const ConnectedAppsCard = () => {
  const apps = [
    { icon: "📊", iconBg: "#e8f5e9", name: "Google Sheets", desc: "Syncs routine log and skin score data",           connected: true },
    { icon: "📦", iconBg: "#fff3e0", name: "Shopify",       desc: "Pulls product ingredient lists automatically",    connected: true },
    { icon: "🔔", iconBg: "#fce4ec", name: "Slack",         desc: "Posts weekly skin digest to #health channel",     connected: false },
    { icon: "📋", iconBg: "#ede7f6", name: "Notion",        desc: "Export routines to your Notion workspace",        connected: false },
    { icon: "📁", iconBg: "#e3f2fd", name: "Google Drive",  desc: "Auto-backup PDF reports to Drive",                connected: false },
  ];
  return (
    <Card>
      <CardHeader title="Connected integrations" />
      <div style={{ padding: "8px 24px 16px" }}>
        {apps.map((app, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 0",
            borderBottom: i < apps.length - 1 ? `1px solid ${C.creamDim}` : "none",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: app.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {app.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: C.cream }}>{app.name}</div>
              <div style={{ fontSize: 12, color: C.creamHi, marginTop: 1 }}>{app.desc}</div>
            </div>
            {app.connected ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 600, color: C.green,
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                padding: "3px 10px", borderRadius: 20,
                fontFamily: "'JetBrains Mono',monospace",
              }}>
                ● Connected
              </div>
            ) : (
              <GhostBtn style={{ fontSize: 11, padding: "5px 10px" }}>Connect</GhostBtn>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

const ApiKeysCard = () => (
  <Card>
    <CardHeader
      title="API Keys"
      action={<PrimaryBtn style={{ fontSize: 12, padding: "7px 14px" }}>+ Create key</PrimaryBtn>}
    />
    <div style={{ padding: "20px 24px" }}>
      <ApiKeyRow label="Production key" keyText="lmr_prod_••••••••••••••••••••••••AB3F" />
      <ApiKeyRow label="Test key"       keyText="lmr_test_••••••••••••••••••••••••C90D" />
      <p style={{ fontSize: 12, color: "rgba(245,240,235,0.35)", marginTop: 4 }}>
        Keys grant full access to your Lumière data. Store them securely and never expose them client-side.
      </p>
    </div>
  </Card>
);

const WebhooksCard = () => {
  const events = ["skin.score.updated", "routine.conflict.detected", "analysis.completed"];
  const eventColors = [
    { bg: C.violetDim, color: "#a888d4", border: "rgba(123,94,167,0.3)" },
    { bg: C.roseDim,   color: C.rose,    border: "rgba(255,62,127,0.25)" },
    { bg: C.amberDim,  color: C.amber,   border: "rgba(232,168,56,0.3)" },
  ];
  return (
    <Card>
      <CardHeader
        title="Webhook endpoints"
        action={<GhostBtn style={{ fontSize: 12 }}>+ Add endpoint</GhostBtn>}
      />
      <div style={{ padding: "20px 24px" }}>
        <FieldLabel>Endpoint URL</FieldLabel>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: C.navy3, border: `1px solid ${C.creamMid}`,
          borderRadius: 9, padding: "10px 14px", marginBottom: 18,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: C.creamHi, flex: 1 }}>
            https://hooks.yourdomain.com/lumiere/events
          </div>
          <GhostBtn style={{ fontSize: 11, padding: "4px 10px" }}>Edit</GhostBtn>
        </div>
        <FieldLabel>Events to send</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {events.map((e, i) => (
            <span key={e} style={{
              fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
              fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".3px",
              background: eventColors[i].bg, color: eventColors[i].color,
              border: `1px solid ${eventColors[i].border}`,
            }}>
              {e}
            </span>
          ))}
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
            fontFamily: "'JetBrains Mono',monospace",
            background: C.creamDim, color: C.creamHi, cursor: "pointer",
          }}>
            + Add event
          </span>
        </div>
      </div>
    </Card>
  );
};

const DangerZone = () => {
  const actions = [
    { title: "Pause account",       desc: "Pause your subscription. Your data is retained and you can reactivate any time." },
    { title: "Reset skin profile",  desc: "Clears all skin assessments, metrics, and AI analysis history. Cannot be undone." },
    { title: "Delete account",      desc: "Permanently delete your account, photos, routines, and all stored data. This action is irreversible." },
  ];
  return (
    <div style={{
      background: "rgba(255,62,127,0.06)",
      border: "1px solid rgba(255,62,127,0.2)",
      borderRadius: 14, padding: "22px 24px",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.rose, letterSpacing: ".3px", marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
        ⚠ Danger Zone
      </div>
      {actions.map((a, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "12px 0",
          borderBottom: i < actions.length - 1 ? "1px solid rgba(255,62,127,0.1)" : "none",
        }}>
          <div style={{ paddingRight: 20 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: C.cream }}>{a.title}</div>
            <div style={{ fontSize: 12, color: C.creamHi, marginTop: 2 }}>{a.desc}</div>
          </div>
          <DangerBtn>{a.title}</DangerBtn>
        </div>
      ))}
    </div>
  );
};

// ─── Inner tabs ───────────────────────────────────────────────────────────────
const SETTING_TABS = [
  { id: "general",     label: "General" },
  { id: "security",    label: "Security" },
  { id: "integrations",label: "Integrations" },
  { id: "danger",      label: "Danger Zone" },
];

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        select option { background: #1C1C38; }
        input::placeholder { color: rgba(245,240,235,0.3); }
        input:focus { border-color: #7B5EA7 !important; box-shadow: 0 0 0 3px rgba(123,94,167,0.18); }
      `}</style>

      {/* Page heading */}
      <div>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: C.cream }}>Settings</div>
        <div style={{ fontSize: 13.5, color: C.creamHi, marginTop: 4 }}>
          Control your notifications, privacy, security, and integrations.
        </div>
      </div>

      {/* Inner tab strip */}
      <div style={{
        display: "flex", gap: 4,
        background: C.navy2,
        border: `1px solid ${C.creamMid}`,
        borderRadius: 10, padding: 4,
        width: "fit-content",
      }}>
        {SETTING_TABS.map(t => (
          <div
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "7px 18px", borderRadius: 7,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer",
              color: activeTab === t.id ? "#fff" : C.creamHi,
              background: activeTab === t.id
                ? (t.id === "danger" ? C.rose : C.violet)
                : "transparent",
              boxShadow: activeTab === t.id && t.id !== "danger"
                ? "0 2px 12px rgba(123,94,167,0.4)"
                : activeTab === t.id
                ? "0 2px 12px rgba(255,62,127,0.35)"
                : "none",
              transition: "all .15s",
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* General tab */}
      {activeTab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <NotificationsCard />
            <PrivacyCard />
          </div>
          <AppearanceCard />
        </div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <SecurityCard />
      )}

      {/* Integrations tab */}
      {activeTab === "integrations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ApiKeysCard />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <ConnectedAppsCard />
            <WebhooksCard />
          </div>
        </div>
      )}

      {/* Danger tab */}
      {activeTab === "danger" && (
        <DangerZone />
      )}
    </div>
  );
}