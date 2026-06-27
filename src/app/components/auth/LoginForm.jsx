// src/components/auth/LoginForm.jsx
"use client";
import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { C, Field, PasswordField, SubmitBtn, ErrorBanner } from "./AuthCommon";

export default function LoginForm({ onSuccess }) {
  const [fields, setFields] = useState({ email: "", password: "" });
  
  // Extract state and actions from your actual store
  const login = useUserStore((state) => state.login);
  const loading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  const set = (e) => setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // The store's login action automatically handles state setting & errors internally
    const success = await login(fields);
    if (success) {
      // Fetch the newly stored current user data to pass to the success screen animate burst
      const currentUser = useUserStore.getState().currentUser;
      onSuccess(currentUser);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={error} />
      
      <Field 
        label="Email address" 
        name="email" 
        type="email" 
        value={fields.email} 
        onChange={set} 
        required 
        disabled={loading}
      />
      
      <PasswordField 
        label="Password" 
        name="password" 
        value={fields.password} 
        onChange={set} 
        disabled={loading}
      />
      
      <div style={{ textAlign: "right", marginBottom: 20, marginTop: -10 }}>
        <a href="/auth/forgot-password" style={{ fontSize: 13, color: C.violet, textDecoration: "none" }}>
          Forgot password?
        </a>
      </div>
      
      <SubmitBtn loading={loading} label="Sign in →" />
    </form>
  );
}