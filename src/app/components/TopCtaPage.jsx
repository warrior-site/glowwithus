"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useDragControls } from "framer-motion";

function DraggableCta({ href, isExternal, style, children }) {
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  // Custom handler to start drag only when touching the handle
  function startDrag(event) {
    dragControls.start(event);
  }

  return (
    // Tiny invisible boundary box for layout stability
    <div ref={constraintsRef} style={{ width: "fit-content", height: "fit-content" }}>
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false} // Disables dragging from the link itself
        dragMomentum={false}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          touchAction: "none", // Prevents mobile scrolling conflicts while dragging
        }}
      >
        {/* DRAG HANDLE: Hold here to drag */}
        <span
          onPointerDown={startDrag}
          style={{
            cursor: "grab",
            padding: "2px 6px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            fontSize: "0.7rem",
            userSelect: "none",
          }}
          title="Drag me"
        >
          ⣿
        </span>

        {/* NATIVE LINK: Click here to navigate safely */}
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
            {children}
          </a>
        ) : (
          <Link href={href} style={{ color: "inherit", textDecoration: "none" }}>
            {children}
          </Link>
        )}
      </motion.div>
    </div>
  );
}

export default function TopCtaPage() {
  const containerStyle = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 1000,
  };

  // Small, compact layout with semi-transparent frosted-glass styling
  const baseButtonStyles = {
    fontSize: "0.5rem",
    fontWeight: 800,
    padding: "7px 10px",
    borderRadius: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };

  const styles = {
    trackerButton: {
      ...baseButtonStyles,
      background: "rgba(15, 23, 42, 0.4)", // Transparent dark slate
      color: "#00ffff",
      border: "1px solid rgba(0, 255, 255, 0.3)",
      boxShadow: "0 0 10px rgba(0, 255, 255, 0.1)",
    },
    instagramButton: {
      ...baseButtonStyles,
      background: "linear-gradient(45deg, rgba(240, 148, 51, 0.25) 0%, rgba(188, 24, 136, 0.25) 100%)", // Transparent insta gradient
      color: "#ff80bf",
      border: "1px solid rgba(220, 39, 67, 0.4)",
      boxShadow: "0 0 10px rgba(220, 39, 67, 0.15)",
    },
    whatsappButton: {
      ...baseButtonStyles,
      background: "rgba(37, 211, 102, 0.15)", // Transparent green
      color: "#25D366",
      border: "1px solid rgba(37, 211, 102, 0.4)",
      boxShadow: "0 0 10px rgba(37, 211, 102, 0.15)",
    },
  };

  return (
    <div >
      
      {/* BOTTOM LEFT CTA BUTTONS CONTAINER */}
      <div style={containerStyle}>
        
        {/* 1. TRACKER PORTAL */}
        <DraggableCta href="/auth/login" isExternal={false} style={styles.trackerButton}>
          ⚡ Tracker
        </DraggableCta>

        {/* 2. INSTAGRAM */}
        <DraggableCta href="https://instagram.com/yourusername" isExternal={true} style={styles.instagramButton}>
          📸 Insta
        </DraggableCta>

        {/* 3. WHATSAPP */}
        <DraggableCta href="https://wa.me/yourphonenumber" isExternal={true} style={styles.whatsappButton}>
          💬 WhatsApp
        </DraggableCta>

       </div>

      {/* <main style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}>
        <p>Click the text to visit links. Grab the <b>⣿</b> handle to move them!</p>
      </main>  */}
    </div> 
  );
}