import React, { useState } from "react";
import { MATERIALS, TAG_LABELS, formatPrice } from "../shopData";
import ProductIllustration from "../ProductIllustration";

// Verkleinerte Nachbildung des Produktrasters im Shop – zeigt die aktuelle Reihenfolge live
export default function ShopPreview({ rows, highlight }) {
  const [mode, setMode] = useState("fertig");
  const visible = rows.filter((r) => r.active).map((r) => ({ id: r.id, ...(r.data || {}) }));
  const shown = visible.filter((p) => (mode === "individuell" ? p.category === "individuell" : p.category !== "individuell"));
  const fertig = visible.filter((p) => p.category !== "individuell").length;

  return (
    <div style={{ background: "#F7F4EF", border: "1px solid #D3D7DD", borderRadius: 14, padding: 14, fontFamily: "Inter, sans-serif", color: "#2B2E4A" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live-Vorschau Shop</span>
        <span style={{ display: "flex", gap: 4 }}>
          {[["fertig", `Fertige (${fertig})`], ["individuell", `Individuell (${visible.length - fertig})`]].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)}
              style={{ fontSize: 11.5, padding: "4px 9px", borderRadius: 999, cursor: "pointer", border: "1px solid #D3D7DD", background: mode === id ? "#2B2E4A" : "#fff", color: mode === id ? "#fff" : "#2B2E4A" }}>
              {label}
            </button>
          ))}
        </span>
      </div>
      {shown.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "#6B7280", margin: "20px 0", textAlign: "center" }}>Keine sichtbaren Produkte in diesem Bereich.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {shown.map((p) => {
            const featured = p.tag === "aktion";
            const ribbon = !p.inStock ? (p.comingSoon ? "Bald verfügbar" : "Ausverkauft") : p.tag ? TAG_LABELS[p.tag]?.label : null;
            return (
              <div key={p.id}
                style={{
                  gridColumn: featured ? "span 2" : undefined, background: "#fff", borderRadius: 10, overflow: "hidden",
                  border: highlight === p.id ? "2px solid #A85A32" : "1px solid #E4DFD6",
                  boxShadow: highlight === p.id ? "0 6px 16px rgba(168,90,50,0.25)" : "none", transition: "box-shadow .15s, border-color .15s",
                }}>
                <div style={{ height: featured ? 92 : 58, position: "relative", background: p.images?.length ? "#F7F4EF" : p.hue, opacity: p.inStock || p.comingSoon ? 1 : 0.45 }}>
                  {p.images?.length ? (
                    <img src={p.images[0]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ProductIllustration id={p.id} size={featured ? 60 : 38} color="rgba(255,255,255,0.92)" />
                    </div>
                  )}
                  {ribbon && (
                    <span style={{ position: "absolute", top: 4, left: 4, fontSize: 8.5, fontWeight: 700, padding: "2px 5px", borderRadius: 999, background: !p.inStock ? "#7A7A82" : "#2B2E4A", color: "#fff" }}>{ribbon}</span>
                  )}
                </div>
                <div style={{ padding: "5px 6px 7px" }}>
                  <div style={{ fontSize: 8.5, color: MATERIALS[p.material]?.color, fontFamily: "'JetBrains Mono', monospace" }}>{MATERIALS[p.material]?.label}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.25, margin: "2px 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{formatPrice(Number(p.price) || 0)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p style={{ fontSize: 11, color: "#9CA3AF", margin: "10px 0 0" }}>Vereinfachte Darstellung. Ausgeblendete Produkte erscheinen hier nicht.</p>
    </div>
  );
}
