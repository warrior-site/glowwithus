// src/components/auth/RegisterForm.jsx
"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import { C, Field, PasswordField, SubmitBtn, ErrorBanner } from "./AuthCommon";

export default function RegisterForm({ onSuccess }) {
  const [fields, setFields] = useState({
    full_name: "",
    email: "",
    password: "",
    skin_type: "",
    skin_problem: "",
    affiliate_order_id: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  
  // Connect to correct store parameters
  const addUserProfile = useUserStore((state) => state.addUserProfile);
  const loading = useUserStore((state) => state.isSubmitting);
  const error = useUserStore((state) => state.error);
  
  const fileRef = useRef();
  const avatarRef = useRef();

  const set = (e) => setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pass registration fields object along with raw image files to ImageKit upload actions
    const success = await addUserProfile(fields, profilePhoto, receiptFile);
    if (success) {
      // Optional: If registration doesn't automatically log them in on the api response,
      // fake a basic fallback payload object for the client visual welcome screen card.
      onSuccess({ full_name: fields.full_name });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={error} />

      {/* Profile Photo Field */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20, gap: 8 }}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={() => avatarRef.current?.click()}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: `2px dashed ${profilePreview ? C.violet : C.border}`,
            background: C.navyMid,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {profilePreview ? (
            <img src={profilePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 20, color: C.offWhiteDim }}>📷</span>
          )}
        </motion.div>
        <span style={{ fontSize: 12, color: C.offWhiteDim }}>Add profile photo</span>
        <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
      </div>

      <Field label="Full name" name="full_name" value={fields.full_name} onChange={set} required />
      <Field label="Email address" name="email" type="email" value={fields.email} onChange={set} required />
      <PasswordField label="Password" name="password" value={fields.password} onChange={set} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field
          label="Skin type"
          name="skin_type"
          type="select"
          value={fields.skin_type}
          onChange={set}
          options={[
            { value: "oily", label: "Oily" },
            { value: "dry", label: "Dry" },
            { value: "combination", label: "Combination" },
            { value: "sensitive", label: "Sensitive" },
            { value: "normal", label: "Normal" },
          ]}
        />
        <Field
          label="Skin concern"
          name="skin_problem"
          type="select"
          value={fields.skin_problem}
          onChange={set}
          options={[
            { value: "acne", label: "Acne" },
            { value: "aging", label: "Aging" },
            { value: "hyperpigmentation", label: "Pigmentation" },
            { value: "redness", label: "Redness" },
            { value: "dryness", label: "Dryness" },
          ]}
        />
      </div>

      {/* Optional affiliate section */}
      <motion.div
        style={{ borderRadius: 10, border: `1px dashed ${C.border}`, padding: "14px 16px", marginBottom: 18 }}
        whileHover={{ borderColor: C.violetDim }}
        transition={{ duration: 0.2 }}
      >
        <p style={{ margin: "0 0 12px", fontSize: 12, color: C.violet, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Affiliate purchase? (optional)
        </p>
        <Field label="Order ID" name="affiliate_order_id" value={fields.affiliate_order_id} onChange={set} />
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1px dashed ${receiptFile ? C.rose : C.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: receiptFile ? C.offWhite : C.offWhiteDim,
          }}
        >
          <span style={{ fontSize: 18 }}>📎</span>
          {receiptFile ? receiptFile.name : "Upload receipt image"}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setReceiptFile(e.target.files[0])} />
        </div>
      </motion.div>

      <SubmitBtn loading={loading} label="Create account →" />

      <p style={{ fontSize: 12, color: C.offWhiteDim, textAlign: "center", marginTop: 14 }}>
        By signing up you agree to our{" "}
        <a href="/terms" style={{ color: C.violet, textDecoration: "none" }}>Terms</a> &{" "}
        <a href="/privacy" style={{ color: C.violet, textDecoration: "none" }}>Privacy</a>
      </p>
    </form>
  );
}