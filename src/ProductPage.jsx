import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { PRODUCTS, MATERIALS, PERSONALIZE_FONTS, formatPrice, cartKey } from "./shopData";
import PersonalizePreview from "./PersonalizePreview";
import { Logo } from "./Shop";
import ProductIllustration from "./ProductIllustration";
import NotifyMe from "./NotifyMe";

export default function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => p.id === id);
  const [added, setAdded] = useState(false);
  const [sel, setSel] = useState(0);
  const colorCount = product?.colorCount || 0;
  const [picks, setPicks] = useState([]);
  const [pText, setPText] = useState("");
  const [pFont, setPFont] = useState(PERSONALIZE_FONTS[0].id);
  const [pExtra, setPExtra] = useState("");
  const pers = product?.personalize;
  // Beim Wechsel zu einem anderen Produkt Auswahl zurücksetzen
  useEffect(() => { setPicks([]); setSel(0); setAdded(false); setPText(""); setPExtra(""); setPFont(PERSONALIZE_FONTS[0].id); }, [id]);
  const pickedColors = !colorCount || (picks.length === colorCount && picks.every(Boolean));
  const persComplete = !pers || (pText.trim().length > 0 && (!pers.extraLabel || pExtra.trim().length > 0));
  const pickedAll = pickedColors && persComplete;
  const setPick = (slot, colorId) =>
    setPicks((p) => {
      const n = [...p];
      n[slot] = colorId;
      return n;
    });
  // Medien: zuerst Endlos-Video (falls vorhanden), dann Fotos
  const media = product
    ? [
        ...(product.video ? [{ type: "video", ...product.video }] : []),
        ...(product.images || []).map((src) => ({ type: "image", src })),
      ]
    : [];
  const cur = media[sel] || media[0];
  const related = product
    ? PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
    : [];

  const addToCart = () => {
    try {
      const saved = localStorage.getItem("sw-cart");
      const cart = saved ? JSON.parse(saved) : {};
      if (!pickedAll) return;
      const key = cartKey(
        product.id,
        colorCount ? picks.slice(0, colorCount) : [],
        pers ? { text: pText.trim(), font: pFont, extra: pExtra.trim() } : {}
      );
      cart[key] = (cart[key] || 0) + 1;
      localStorage.setItem("sw-cart", JSON.stringify(cart));
      setAdded(true);
    } catch (e) {
      // Speichern fehlgeschlagen
    }
  };

  if (!product) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Dieses Produkt gibt's leider nicht (mehr).</p>
          <Link to="/" style={{ color: "#A85A32" }}>Zurück zum Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
.pp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        @media (max-width: 700px) {
          .pp-grid { grid-template-columns: 1fr; gap: 24px; }
        }
        .pp-layer-bg {
          background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 5px, rgba(0,0,0,0.08) 5px, rgba(0,0,0,0.08) 6px);
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none" }}>
            <ArrowLeft size={15} /> Zurück zum Shop
          </Link>
          <Logo size={34} withText={false} />
        </div>

        <div className="pp-grid">
          {pers ? (
            <div style={{ position: "relative" }}>
              <PersonalizePreview
                product={product}
                colorCss={(product.colors || []).find((c) => c.id === picks[0])?.css || "#8a8d91"}
                text={pText}
                fontId={pFont}
              />
              {!product.inStock && (
                <span style={{ position: "absolute", top: 16, left: 16, background: "#7A7A82", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>
                  {product.comingSoon ? "Bald verfügbar" : "Ausverkauft"}
                </span>
              )}
            </div>
          ) : media.length ? (
            <div>
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "1 / 1", background: "#F7F4EF", border: "1px solid #E4DFD6" }}>
                {cur.type === "video" ? (
                  <video
                    key={cur.mp4}
                    autoPlay muted loop playsInline
                    poster={cur.poster}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  >
                    {cur.webm && <source src={cur.webm} type="video/webm" />}
                    <source src={cur.mp4} type="video/mp4" />
                  </video>
                ) : (
                  <img src={cur.src} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                )}
                {!product.inStock && (
                  <span style={{ position: "absolute", top: 16, left: 16, background: "#7A7A82", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>
                    {product.comingSoon ? "Bald verfügbar" : "Ausverkauft"}
                  </span>
                )}
              </div>
              {media.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {media.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setSel(i)}
                      aria-label={m.type === "video" ? "Video ansehen" : `Bild ${i + 1} ansehen`}
                      style={{
                        width: 64, height: 64, padding: 0, borderRadius: 10, overflow: "hidden", cursor: "pointer", position: "relative",
                        background: "#F7F4EF", border: i === sel ? "2px solid #A85A32" : "1px solid #E4DFD6",
                      }}
                    >
                      <img src={m.type === "video" ? m.poster : m.src} alt="" style={{ width: "100%", height: "100%", objectFit: m.type === "video" ? "cover" : "contain", display: "block" }} />
                      {m.type === "video" && (
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", color: "#fff", fontSize: 18 }}>▶</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 340, background: product.hue, opacity: product.inStock || product.comingSoon ? 1 : 0.5 }}>
              <div className="pp-layer-bg" style={{ position: "absolute", inset: 0 }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ProductIllustration id={product.id} size={220} color="rgba(255,255,255,0.92)" />
              </div>
              {!product.inStock && (
                <span style={{ position: "absolute", top: 16, left: 16, background: "#7A7A82", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>
                  {product.comingSoon ? "Bald verfügbar" : "Ausverkauft"}
                </span>
              )}
            </div>
          )}

          <div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: MATERIALS[product.material].color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em" }}>
              {MATERIALS[product.material].label}
            </span>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, margin: "10px 0 16px", lineHeight: 1.15 }}>
              {product.name}
            </h1>
            <p style={{ color: "#5C5763", fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
              {product.description}
            </p>

            {pers && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>
                  {pers.label} <span style={{ fontWeight: 400, color: "#7A7A82" }}>(max. {pers.maxLength} Zeichen)</span>
                </label>
                <input
                  value={pText}
                  maxLength={pers.maxLength}
                  onChange={(e) => { setPText(e.target.value.replace(/[|]/g, "")); setAdded(false); }}
                  placeholder="Hier eintippen …"
                  style={{ width: "100%", border: "1px solid #D9D2C8", borderRadius: 10, padding: "11px 14px", fontSize: 15, outline: "none", background: "#fff", color: "#2B2E4A", fontFamily: "'Inter', sans-serif" }}
                />
                <p style={{ fontSize: 13, fontWeight: 600, margin: "14px 0 8px" }}>Schrift</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PERSONALIZE_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={pFont === f.id}
                      onClick={() => { setPFont(f.id); setAdded(false); }}
                      style={{
                        fontFamily: f.css, fontWeight: f.weight, fontSize: 14, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                        background: pFont === f.id ? "#2B2E4A" : "#fff", color: pFont === f.id ? "#fff" : "#2B2E4A",
                        border: pFont === f.id ? "1px solid #2B2E4A" : "1px solid #D9D2C8",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {pers.extraLabel && (
                  <>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, margin: "14px 0 8px" }}>{pers.extraLabel}</label>
                    <input
                      value={pExtra}
                      maxLength={20}
                      inputMode="decimal"
                      onChange={(e) => { setPExtra(e.target.value.replace(/[|]/g, "")); setAdded(false); }}
                      placeholder={pers.extraPlaceholder || ""}
                      style={{ width: 160, border: "1px solid #D9D2C8", borderRadius: 10, padding: "10px 14px", fontSize: 14.5, outline: "none", background: "#fff", color: "#2B2E4A", fontFamily: "'Inter', sans-serif" }}
                    />
                  </>
                )}
              </div>
            )}

            {product.colors && (
              <div style={{ marginBottom: 22 }}>
                {Array.from({ length: colorCount }).map((_, slot) => {
                  const chosen = product.colors.find((c) => c.id === picks[slot]);
                  return (
                    <div key={slot} style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>
                        {colorCount > 1 ? `Farbe ${slot + 1}` : "Farbe"}
                        <span style={{ fontWeight: 400, color: "#7A7A82" }}>{chosen ? ` – ${chosen.label}` : " – bitte wählen"}</span>
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {product.colors.map((c) => {
                          const active = picks[slot] === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              title={c.label}
                              aria-label={c.label}
                              aria-pressed={active}
                              onClick={() => { setPick(slot, c.id); setAdded(false); }}
                              style={{
                                width: 32, height: 32, borderRadius: "50%", cursor: "pointer", padding: 0,
                                background: c.css, border: "1px solid rgba(0,0,0,0.15)",
                                boxShadow: active ? "0 0 0 2px #F7F4EF, 0 0 0 4px #A85A32" : "none",
                                transition: "box-shadow 0.15s ease",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
              {product.originalPrice && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#7A7A82", textDecoration: "line-through" }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 24, color: product.originalPrice ? "#82431F" : "#2B2E4A" }}>
                {formatPrice(product.price)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#7A7A82", margin: "-18px 0 24px", lineHeight: 1.5 }}>
              Keine USt. gem. § 6 Abs. 1 Z 27 UStG (Kleinunternehmer) · zzgl.{" "}
              <Link to="/agb" style={{ color: "#7A7A82" }}>Versand</Link> (AT 4,90 € · DE 12,90 €)
            </p>

            {product.inStock ? (
              added ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0F6E56", fontWeight: 500, fontSize: 14.5 }}>
                  <Check size={17} /> Zum Warenkorb hinzugefügt –{" "}
                  <Link to="/" style={{ color: "#0F6E56", textDecoration: "underline" }}>weiter im Shop</Link>
                </div>
              ) : (
                <button
                  onClick={addToCart}
                  disabled={!pickedAll}
                  title={pickedAll ? "" : pickedColors ? "Bitte zuerst den Wunschtext eingeben" : "Bitte zuerst eine Farbe wählen"}
                  style={{
                    opacity: pickedAll ? 1 : 0.5,
                    display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #C97A4E, #82431F)",
                    color: "#fff", border: "none", borderRadius: 999, padding: "13px 26px", fontSize: 14.5, fontWeight: 600, cursor: pickedAll ? "pointer" : "not-allowed",
                    boxShadow: "0 8px 18px rgba(130, 67, 31, 0.32)",
                  }}
                >
                  <Plus size={15} /> In den Warenkorb
                </button>
              )
            ) : (
              product.comingSoon ? (
                <NotifyMe product={product} />
              ) : (
                <p style={{ color: "#7A7A82", fontSize: 14 }}>Aktuell leider ausverkauft – schau bald wieder vorbei.</p>
              )
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
              Das könnte dir auch gefallen
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
              {related.map((r) => (
                <Link key={r.id} to={`/produkt/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "#fff", border: "1px solid #E4DFD6", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ height: 90, background: r.images?.length ? "#F7F4EF" : r.hue, opacity: r.inStock || r.comingSoon ? 1 : 0.5, position: "relative" }}>
                      {r.images?.length ? (
                        <img src={r.images[0]} alt={r.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ProductIllustration id={r.id} size={54} color="rgba(255,255,255,0.9)" />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", lineHeight: 1.3 }}>{r.name}</p>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#82431F", margin: 0 }}>{formatPrice(r.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
