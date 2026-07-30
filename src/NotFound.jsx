import React from "react";
import { Link } from "react-router-dom";
import { Layers, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(168, 90, 50, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Layers size={26} color="#A85A32" />
        </div>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 54, margin: "0 0 8px", lineHeight: 1 }}>404</p>
        <p style={{ fontSize: 15, color: "#7A7A82", margin: "0 0 28px", lineHeight: 1.6 }}>
          Diese Seite wurde wohl noch nicht gedruckt – hier gibt's sie leider nicht.
        </p>
        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#A85A32", color: "#fff", textDecoration: "none", padding: "12px 24px", borderRadius: 999, fontSize: 14.5, fontWeight: 600 }}
        >
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>
      </div>
    </div>
  );
}
