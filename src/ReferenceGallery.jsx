import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "./productStore";
import { isReference } from "./shopData";

// Beispielbilder bereits umgesetzter Kundenprojekte (im Dashboard: Kategorie „Kundenprojekt“)
export default function ReferenceGallery() {
  const products = useProducts();
  const refs = (products || []).filter((p) => isReference(p) && p.images?.length);
  const [open, setOpen] = useState(null); // { i: Projekt, j: Foto }
  const step = (d) => setOpen((o) => {
    if (!o) return o;
    const n = refs[o.i].images.length;
    return { ...o, j: (o.j + d + n) % n };
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!refs.length) return null;
  const cur = open ? refs[open.i] : null;

  return (
    <div style={{ margin: "0 0 26px" }}>
      <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px", color: "#2B2E4A" }}>Schon für Kunden umgesetzt</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {refs.map((p, i) => (
          <button key={p.id} type="button" onClick={() => setOpen({ i, j: 0 })}
            style={{ padding: 0, border: "1px solid #E4DFD6", borderRadius: 12, overflow: "hidden", background: "#fff", cursor: "zoom-in", textAlign: "left", fontFamily: "inherit", color: "inherit" }}>
            <img src={p.images[0]} alt={p.name} loading="lazy" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
            <span style={{ display: "block", padding: "8px 10px 10px", fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</span>
          </button>
        ))}
      </div>

      {cur && (
        <div role="dialog" aria-modal="true" aria-label={cur.name} onClick={() => setOpen(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(20,20,28,0.86)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: 760, width: "100%", background: "#fff", borderRadius: 16, overflow: "hidden" }}>
            <img src={cur.images[open.j]} alt={cur.name} style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", background: "#F7F4EF" }} />
            <div style={{ padding: "14px 18px 18px" }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, margin: "0 0 6px" }}>{cur.name}</p>
              {cur.description && <p style={{ color: "#5C5763", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{cur.description}</p>}
            </div>
            <button type="button" aria-label="Schließen" onClick={() => setOpen(null)}
              style={{ position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={18} />
            </button>
            {cur.images.length > 1 && (
              <>
                <button type="button" aria-label="Vorheriges Foto" onClick={() => step(-1)}
                  style={{ position: "absolute", left: 10, top: "35%", width: 38, height: 38, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft size={20} />
                </button>
                <button type="button" aria-label="Nächstes Foto" onClick={() => step(1)}
                  style={{ position: "absolute", right: 10, top: "35%", width: 38, height: 38, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
