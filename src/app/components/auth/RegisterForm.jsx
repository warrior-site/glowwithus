"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import { C, Field, PasswordField, SubmitBtn, ErrorBanner } from "./AuthCommon";
import Banner from "../Banner";

export default function RegisterForm({ onSuccess }) {
  const [showBanner, setShowBanner] = useState(false);

  const [fields, setFields] = useState({
    full_name: "",
    email: "",
    password: "",
    skin_type: "",
    skin_problem: "",
    age: "",
    gender: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const addUserProfile = useUserStore((s) => s.addUserProfile);
  const loading = useUserStore((s) => s.isSubmitting);
  const error = useUserStore((s) => s.error);

  const avatarRef = useRef();

  const set = (e) =>
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log("click")
    const success = await addUserProfile(fields, profilePhoto);
    if (success) {
      onSuccess({ full_name: fields.full_name });
      setShowBanner(true);
    }
    console.log("click2")
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={error} />

      

      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => avatarRef.current?.click()}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: `2px dashed ${profilePreview ? C.violet : C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {profilePreview ? (
            <img src={profilePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            "📷"
          )}
        </motion.div>

        <input ref={avatarRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
      </div>

      <Field label="Full name" name="full_name" value={fields.full_name} onChange={set} required />
      <Field label="Email" name="email" type="email" value={fields.email} onChange={set} required />
      <PasswordField label="Password" name="password" value={fields.password} onChange={set} />

      <Field label="Age" name="age" value={fields.age} onChange={set} />
      <Field
        label="Gender"
        name="gender"
        type="select"
        value={fields.gender}
        onChange={set}
        options={[
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ]}
      />

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
            { value: "pigmentation", label: "Pigmentation" },
            { value: "dryness", label: "Dryness" },
          ]}
        />
      </div>

      <SubmitBtn loading={loading} label="Create account →" />
    </form>
  );
}