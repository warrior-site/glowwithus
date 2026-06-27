// src/app/auth/page.jsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "@/app/components/auth/LoginForm";
import RegisterForm from "@/app/components/auth/RegisterForm";
import { C, BackgroundGrid, ParticleBurst, SuccessScreen, TabBtn } from "@/app/components/auth/AuthCommon";

export default function AuthPage({ defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);
  const [success, setSuccess] = useState(null);
  const [burst, setBurst] = useState(false);

  const handleSuccess = (user) => {
    setBurst(true);
    setTimeout(() => {
      setBurst(false);
      setSuccess({ user, mode: tab });
    }, 750);
  };

  const switchTab = (t) => {
    if (t === tab) return;
    setTab(t);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
      }}
    >
      <BackgroundGrid />
      <ParticleBurst active={burst} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}
      >
        {/* Brand Header */}
        <motion.div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.rose}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              ✦
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.offWhite, letterSpacing: "-0.03em" }}>Luminary</span>
          </div>
          <p style={{ margin: 0, color: C.offWhiteDim, fontSize: 14 }}>AI-powered skin intelligence</p>
        </motion.div>

        {/* Form Container Card */}
        <motion.div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden" }} layout>
          {success ? (
            <div style={{ padding: "28px 32px" }}>
              <SuccessScreen user={success.user} mode={success.mode} />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 32px" }}>
                <TabBtn label="Sign in" active={tab === "login"} onClick={() => switchTab("login")} />
                <TabBtn label="Create account" active={tab === "register"} onClick={() => switchTab("register")} />
              </div>

              <div style={{ padding: "28px 32px 32px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: tab === "login" ? -18 : 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: tab === "login" ? 18 : -18 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {tab === "login" ? (
                      <LoginForm onSuccess={handleSuccess} />
                    ) : (
                      <RegisterForm onSuccess={handleSuccess} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>

        {/* Outer Form Toggle Text */}
        {!success && (
          <motion.p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.offWhiteDim }}>
            {tab === "login" ? (
              <>
                No account?{" "}
                <button type="button" onClick={() => switchTab("register")} style={{ background: "none", border: "none", color: C.rose, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}>
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} style={{ background: "none", border: "none", color: C.rose, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}>
                  Sign in
                </button>
              </>
            )}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}