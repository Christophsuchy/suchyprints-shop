import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("sw-cookie-consent");
      if (!consent) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("sw-cookie-consent", "accepted");
    } catch (e) {
      // Speichern fehlgeschlagen
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: 16, left: 16, right: 16, maxWidth: 480, margin: "0 auto",
        background: "#2B2E4A", color: "#fff", borderRadius: 14, padding: "18px 20px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)", zIndex: 100, fontFamily: "'Inter', sans-serif",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>
        Diese Seite verwendet technisch notwendige Speicherung (z. B. für deinen Warenkorb und deine Design-Einstellung) sowie ggf. Dienste zur Zahlungsabwicklung. Mehr dazu in unserer{" "}
        <Link to="/datenschutz" style={{ color: "#fff", textDecoration: "underline" }}>Datenschutzerklärung</Link>.
      </p>
      <button
        onClick={accept}
        style={{
          alignSelf: "flex-start", background: "#A85A32", color: "#fff", border: "none",
          borderRadius: 999, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        Verstanden
      </button>
    </div>
  );
}
