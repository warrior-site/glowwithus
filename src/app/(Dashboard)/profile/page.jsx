"use client";
import { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/stores/useUserStore"; 

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

// ─── Tiny shared primitives ───────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{ background: C.navy2, border: `1px solid ${C.creamMid}`, borderRadius: 16, overflow: "hidden", ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, icon, action }) => (
  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.creamMid}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.cream, display: "flex", alignItems: "center", gap: 10 }}>
      {icon && <span style={{ color: C.rose }}>{icon}</span>}
      {title}
    </div>
    {action}
  </div>
);

const GhostBtn = ({ children, style, onClick, type = "button" }) => (
  <button type={type} onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, padding: "8px 14px", borderRadius: 8, background: C.creamDim, color: C.cream, border: `1px solid ${C.creamMid}`, cursor: "pointer", transition: "all 0.2s ease", ...style }}>
    {children}
  </button>
);

const PrimaryBtn = ({ children, style, onClick, type = "button", disabled }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 8, background: disabled ? C.navy4 : C.rose, color: "#fff", border: "none", cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 4px 20px rgba(255,62,127,0.25)", transition: "all 0.2s ease", ...style }}>
    {children}
  </button>
);

const Tag = ({ children, variant = "rose" }) => {
  const variants = {
    rose:   { bg: C.roseDim,   color: C.rose,   border: "rgba(255,62,127,0.25)" },
    violet: { bg: C.violetDim, color: "#a888d4", border: "rgba(123,94,167,0.3)" },
    amber:  { bg: C.amberDim,  color: C.amber,  border: "rgba(232,168,56,0.3)" },
  };
  const v = variants[variant] || variants.rose;
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 20, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".3px", background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>
      {children}
    </span>
  );
};

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.creamHi, textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>
    {children}
  </div>
);

// Form Control display wrapper to eliminate the empty form skeleton feel
const DisplayOrInput = ({ isEditing, value, component: Component = "input", placeholder = "Not Provided", ...props }) => {
  if (!isEditing) {
    return (
      <div style={{ padding: "10px 0", color: value ? C.cream : "rgba(245,240,235,0.25)", fontSize: 14, fontFamily: "'Inter', sans-serif", fontStyle: value ? "normal" : "italic" }}>
        {value || placeholder}
      </div>
    );
  }
  return Component === "textarea" ? (
    <textarea style={{ background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 8, padding: "12px 14px", color: C.cream, fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 90 }} value={value} {...props} />
  ) : (
    <input style={{ background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 8, padding: "12px 14px", color: C.cream, fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} value={value} {...props} />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { currentUser, isLoading, isSubmitting, fetchUsers, updateUserProfile, addUserProfile } = useUserStore();

  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uiMessage, setUiMessage] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    bio: "",
    skin_type: "Combination",
    fitzpatrick_type: "Type III",
    primary_concerns: [],
    known_sensitivities: ""
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetFormFromUser = () => {
    if (currentUser) {
      setForm({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        phone_number: currentUser.phone_number || "",
        location: currentUser.location || "",
        bio: currentUser.bio || "",
        skin_type: currentUser.skin_type || "Combination",
        fitzpatrick_type: currentUser.fitzpatrick_type || "Type III",
        primary_concerns: currentUser.primary_concerns || [],
        known_sensitivities: currentUser.known_sensitivities || ""
      });
    }
  };

  useEffect(() => {
    resetFormFromUser();
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    handleInputChange("primary_concerns", selected);
  };

  // Automated Avatar ImageKit Engine Upload Hook
  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setUiMessage(null);

    try {
      // Re-uses your standard ImageKit registry asset processor inside useUserStore
      const success = await addUserProfile({}, file, null);
      if (success) {
        setUiMessage({ type: "success", text: "Avatar updated via storage bucket." });
        fetchUsers(); // Refresh updated context URLs
      } else {
        throw new Error("Store image upload sequence rejected pipeline.");
      }
    } catch (err) {
      setUiMessage({ type: "error", text: err.message || "Failed image hosting sync." });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiMessage(null);
    const payload = {
      ...form,
      full_name: `${form.first_name} ${form.last_name}`.trim()
    };
    const result = await updateUserProfile(payload);
    if (result.success) {
      setUiMessage({ type: "success", text: "Profile synchronized completely." });
      setIsEditing(false);
    } else {
      setUiMessage({ type: "error", text: result.error || "Update cycle caught exceptions." });
    }
  };

  if (isLoading) {
    return <div style={{ color: C.cream, padding: 80, textAlign: "center", fontFamily: "sans-serif", letterSpacing: "1px" }}>INITIALIZING ARCHITECTURE MATRIX...</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'Inter', sans-serif", maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { background-color: ${C.navy}; margin: 0; }
        select option { background: #1C1C38; }
      `}</style>

      {/* Secret Input File Bridge */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />

      {uiMessage && (
        <div style={{ padding: "14px 20px", borderRadius: 10, background: uiMessage.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(255,62,127,0.1)", border: `1px solid ${uiMessage.type === "success" ? C.green : C.rose}`, color: uiMessage.type === "success" ? C.green : C.rose, fontSize: 13.5, fontWeight: 500 }}>
          {uiMessage.text}
        </div>
      )}

      {/* Hero Header Section */}
      <Card>
        <div style={{ height: 160, background: `linear-gradient(135deg, ${C.navy3} 0%, ${C.violet} 60%, ${C.rose} 100%)`, position: "relative" }} />
        <div style={{ padding: "0 32px 32px", display: "flex", alignItems: "flex-end", gap: 28, marginTop: -50, position: "relative", zIndex: 2 }}>
          <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }} onClick={handlePhotoUploadClick}>
            {currentUser?.avatar_url || currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatar_url || currentUser.avatarUrl} 
                alt="Avatar" 
                style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${C.navy2}`, objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${C.violet}, ${C.rose})`, border: `4px solid ${C.navy2}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Serif Display', serif", fontSize: 36, fontWeight: 700, color: "#fff" }}>
                {form.first_name ? form.first_name.substring(0, 2).toUpperCase() : "LU"}
              </div>
            )}
            <div style={{ position: "absolute", bottom: 0, right: 0, background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.cream }}>
              {uploadingPhoto ? "..." : "📷"}
            </div>
          </div>
          
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.cream, display: "flex", alignItems: "center", gap: 12 }}>
              {currentUser?.full_name || "Lumière User"}
              <span style={{ background: C.violetDim, border: `1px solid rgba(123,94,167,0.4)`, color: "#a888d4", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, fontFamily: "'JetBrains Mono', monospace" }}>
                {currentUser?.is_premium_user ? "PRO MEMBER" : "FREE TRIAL"}
              </span>
            </div>
            <div style={{ color: C.creamHi, fontSize: 14, marginTop: 4, display: "flex", gap: 12, alignItems: "center" }}>
              <span>Skin Type: <strong style={{ color: C.amber }}>{currentUser?.skin_type || form.skin_type}</strong></span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span>{currentUser?.location || "No Location Specified"}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {!isEditing ? (
              <GhostBtn onClick={() => setIsEditing(true)} style={{ background: C.creamDim }}>Modify Profile Data</GhostBtn>
            ) : (
              <>
                <GhostBtn onClick={() => { setIsEditing(false); resetFormFromUser(); }}>Discard</GhostBtn>
                <PrimaryBtn type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Syncing..." : "Commit Modifications"}
                </PrimaryBtn>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Multi-Column Data Blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        
        {/* Core Identity Blocks */}
        <Card>
          <CardHeader title="Identity Configuration" icon="◎" />
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <FieldLabel>First Name</FieldLabel>
                <DisplayOrInput isEditing={isEditing} value={form.first_name} onChange={e => handleInputChange("first_name", e.target.value)} placeholder="First name missing" />
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <DisplayOrInput isEditing={isEditing} value={form.last_name} onChange={e => handleInputChange("last_name", e.target.value)} placeholder="Last name missing" />
              </div>
            </div>

            <div>
              <FieldLabel>Account Email Address (Immutable)</FieldLabel>
              <div style={{ padding: "10px 0", color: C.creamHi, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                {currentUser?.email || "unauthenticated@lumiere.skin"}
              </div>
            </div>

            <div>
              <FieldLabel>Contact Phone Line</FieldLabel>
              <DisplayOrInput isEditing={isEditing} type="tel" value={form.phone_number} onChange={e => handleInputChange("phone_number", e.target.value)} placeholder="No custom phone logged" />
            </div>

            <div>
              <FieldLabel>Geographic Location</FieldLabel>
              <DisplayOrInput isEditing={isEditing} type="text" value={form.location} onChange={e => handleInputChange("location", e.target.value)} placeholder="City, Country" />
            </div>

            <div>
              <FieldLabel>Biographical Summary</FieldLabel>
              <DisplayOrInput isEditing={isEditing} component="textarea" value={form.bio} onChange={e => handleInputChange("bio", e.target.value)} placeholder="Tell us about your skincare journey..." />
            </div>
          </div>
        </Card>

        {/* Clinical Skin Substructures */}
        <Card>
          <CardHeader title="Skin Profile Parameters" icon="✦" />
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <FieldLabel>Skin Phenotype Classification</FieldLabel>
                {!isEditing ? (
                  <div style={{ padding: "10px 0", color: C.amber, fontWeight: 500 }}>{form.skin_type}</div>
                ) : (
                  <select value={form.skin_type} onChange={e => handleInputChange("skin_type", e.target.value)} style={{ background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 8, padding: "12px 14px", color: C.cream, width: "100%", outline: "none" }}>
                    <option value="Combination">Combination</option>
                    <option value="Oily">Oily</option>
                    <option value="Dry">Dry</option>
                    <option value="Normal">Normal</option>
                  </select>
                )}
              </div>

              <div>
                <FieldLabel>Fitzpatrick Scale Classification</FieldLabel>
                {!isEditing ? (
                  <div style={{ padding: "10px 0", color: C.cream }}>{form.fitzpatrick_type}</div>
                ) : (
                  <select value={form.fitzpatrick_type} onChange={e => handleInputChange("fitzpatrick_type", e.target.value)} style={{ background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 8, padding: "12px 14px", color: C.cream, width: "100%", outline: "none" }}>
                    <option value="Type I">Type I (Pale White)</option>
                    <option value="Type II">Type II (White)</option>
                    <option value="Type III">Type III (Cream White)</option>
                    <option value="Type IV">Type IV (Moderate Brown)</option>
                    <option value="Type V">Type V (Dark Brown)</option>
                    <option value="Type VI">Type VI (Deep Black)</option>
                  </select>
                )}
              </div>
            </div>

            <div>
              <FieldLabel>Target Primary Concerns</FieldLabel>
              {!isEditing ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8 }}>
                  {form.primary_concerns.length > 0 ? (
                    form.primary_concerns.map(c => <Tag key={c} variant="violet">{c}</Tag>)
                  ) : (
                    <span style={{ color: "rgba(245,240,235,0.25)", fontStyle: "italic", fontSize: 14 }}>No target concerns logged</span>
                  )}
                </div>
              ) : (
                <select multiple value={form.primary_concerns} onChange={handleMultiSelectChange} style={{ background: C.navy3, border: `1px solid ${C.creamMid}`, borderRadius: 8, padding: "12px 14px", color: C.cream, width: "100%", outline: "none", height: 110 }}>
                  <option value="Hyperpigmentation">Hyperpigmentation</option>
                  <option value="Fine lines">Fine lines</option>
                  <option value="Uneven texture">Uneven texture</option>
                  <option value="Acne">Acne</option>
                  <option value="Redness">Redness</option>
                </select>
              )}
            </div>

            <div>
              <FieldLabel>Allergies & Sensitivities</FieldLabel>
              <DisplayOrInput isEditing={isEditing} component="textarea" value={form.known_sensitivities} onChange={e => handleInputChange("known_sensitivities", e.target.value)} placeholder="Fragrance, paraben variants, etc..." />
            </div>
          </div>
        </Card>
      </div>

    </form>
  );
}