import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { PRODUCTS, MATERIALS, formatPrice } from "./shopData";
import { Logo } from "./Shop";
import ProductIllustration from "./ProductIllustration";

export default function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => p.id === id);
  const [added, setAdded] = useState(false);
  const related = product
    ? PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
    : [];

  const addToCart = () => {
    try {
      const saved = localStorage.getItem("sw-cart");
      const cart = saved ? JSON.parse(saved) : {};
      cart[product.id] = (cart[product.id] || 0) + 1;
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 340, background: product.hue, opacity: product.inStock ? 1 : 0.5 }}>
            <div className="pp-layer-bg" style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ProductIllustration id={product.id} size={220} color="rgba(255,255,255,0.92)" />
            </div>
            {!product.inStock && (
              <span style={{ position: "absolute", top: 16, left: 16, background: "#7A7A82", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>
                Ausverkauft
              </span>
            )}
          </div>

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

            {product.inStock ? (
              added ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0F6E56", fontWeight: 500, fontSize: 14.5 }}>
                  <Check size={17} /> Zum Warenkorb hinzugefügt –{" "}
                  <Link to="/" style={{ color: "#0F6E56", textDecoration: "underline" }}>weiter im Shop</Link>
                </div>
              ) : (
                <button
                  onClick={addToCart}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #C97A4E, #82431F)",
                    color: "#fff", border: "none", borderRadius: 999, padding: "13px 26px", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(130, 67, 31, 0.32)",
                  }}
                >
                  <Plus size={15} /> In den Warenkorb
                </button>
              )
            ) : (
              <p style={{ color: "#7A7A82", fontSize: 14 }}>Aktuell leider ausverkauft – schau bald wieder vorbei.</p>
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
                    <div style={{ height: 90, background: r.hue, opacity: r.inStock ? 1 : 0.5, position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ProductIllustration id={r.id} size={54} color="rgba(255,255,255,0.9)" />
                      </div>
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
