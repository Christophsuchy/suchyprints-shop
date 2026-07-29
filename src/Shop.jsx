import React, { useState, useEffect, useMemo, useRef, useId } from "react";
import emailjs from "@emailjs/browser";
import { supabase } from "./supabaseClient";
import { ShoppingCart, Plus, Minus, X, Search, Layers, Cog, Gamepad2, Home, Wand2, Send, Loader2 } from "lucide-react";

// EmailJS-Zugangsdaten – auf https://www.emailjs.com/ kostenlos anlegen
// und hier die drei Werte aus deinem Account eintragen.
const EMAILJS_SERVICE_ID = "service_tks1mei";
const EMAILJS_TEMPLATE_ID = "template_ctsn259";
const EMAILJS_PUBLIC_KEY = "GRw99PmWJicyivjXB";
// Wohin die Bestellbenachrichtigung gehen soll (deine eigene Adresse):
const SHOP_OWNER_EMAIL = "christoph.suchy@suchyprints.at";

// Rund-Logo als echte Vektorgrafik (kein Foto) – Kreis mit Druckkopf-Icon und Schriftzug,
// mehrfach auf der Seite einsetzbar. `dim` steuert ob Ring-Text mitgerendert wird.
function Logo({ size = 44, withText = true, color = "#2B2E4A", accent = "#FF6F59", style }) {
  const uid = useId().replace(/:/g, "");
  const topArcId = `logoTop-${uid}`;
  const bottomArcId = `logoBottom-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" style={style}>
      <defs>
        <path id={topArcId} d="M 22 122 A 100 100 0 0 1 218 122" fill="none" />
        <path id={bottomArcId} d="M 218 130 A 100 100 0 0 1 22 130" fill="none" />
      </defs>
      <circle cx="120" cy="120" r="112" fill="none" stroke={color} strokeWidth="6" />
      <circle cx="120" cy="120" r="97" fill="none" stroke={color} strokeWidth="2.5" />
      {withText && (
        <>
          <text fontFamily="'Space Grotesk', sans-serif" fontSize="17" fontWeight="700" fill={color} letterSpacing="2.5">
            <textPath href={`#${topArcId}`} startOffset="50%" textAnchor="middle">SUCHYPRINTS</textPath>
          </text>
          <text fontFamily="'Space Grotesk', sans-serif" fontSize="14" fontWeight="700" fill={color} letterSpacing="4">
            <textPath href={`#${bottomArcId}`} startOffset="50%" textAnchor="middle">3D DRUCK</textPath>
          </text>
        </>
      )}
      <line x1="52" y1="94" x2="93" y2="94" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="147" y1="94" x2="188" y2="94" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <polygon points="120,58 139,70 139,94 120,106 101,94 101,70" fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" />
      <text x="120" y="91" fontFamily="'Space Grotesk', sans-serif" fontSize="21" fontWeight="800" fill={color} textAnchor="middle">SP</text>
      <polygon points="112,106 128,106 122,128 118,128" fill={color} />
      <line x1="120" y1="128" x2="120" y2="149" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="88,152 152,152 168,166 72,166" fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="120" cy="149" r="5" fill={accent} />
    </svg>
  );
}

const CATEGORIES = [
  { id: "alle", label: "Alle", icon: Layers },
  { id: "deko", label: "Deko", icon: Home },
  { id: "technik", label: "Technik & Ersatzteile", icon: Cog },
  { id: "spielzeug", label: "Spielzeug", icon: Gamepad2 },
  { id: "individuell", label: "Individuell", icon: Wand2 },
];

const MATERIALS = {
  PLA: { label: "PLA", color: "#FF6A13" },
  PETG: { label: "PETG", color: "#2F6FED" },
  TPU: { label: "TPU (flexibel)", color: "#1D9E75" },
};

// Startsortiment – einfach weitere Objekte in dieses Array einfügen, es gibt kein festes Limit.
const PRODUCTS = [
  { id: "p1", name: "Geometrische Vase, klein", category: "deko", material: "PLA", price: 18.5, hue: "#FF6A13" },
  { id: "p2", name: "Wandregal-Halterung", category: "deko", material: "PETG", price: 12.0, hue: "#2F6FED" },
  { id: "p3", name: "Teelicht-Set, 3 Stück", category: "deko", material: "PLA", price: 15.0, hue: "#D4537E" },
  { id: "p4", name: "Kabelclip-Set (10x)", category: "technik", material: "PETG", price: 8.0, hue: "#2F6FED" },
  { id: "p5", name: "Lüfterhalterung 40mm", category: "technik", material: "PETG", price: 6.5, hue: "#2F6FED" },
  { id: "p6", name: "Werkzeug-Organizer", category: "technik", material: "PLA", price: 22.0, hue: "#FF6A13" },
  { id: "p7", name: "Ersatz-Scharnier, universal", category: "technik", material: "TPU", price: 9.5, hue: "#1D9E75" },
  { id: "p8", name: "Stapelbares Puzzle-Set", category: "spielzeug", material: "PLA", price: 14.0, hue: "#FF6A13" },
  { id: "p9", name: "Beweglicher Drache (Fidget)", category: "spielzeug", material: "TPU", price: 19.0, hue: "#1D9E75" },
  { id: "p10", name: "Mini-Katapult", category: "spielzeug", material: "PLA", price: 11.0, hue: "#D4537E" },
  { id: "p11", name: "Schachfiguren-Set", category: "deko", material: "PLA", price: 34.0, hue: "#FF6A13" },
  { id: "p12", name: "Handy-Ständer, klappbar", category: "technik", material: "PETG", price: 9.0, hue: "#2F6FED" },
];

function formatPrice(n) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default function Shop() {
  const [cart, setCart] = useState({});
  const [category, setCategory] = useState("alle");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sw-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      // kein gespeicherter Warenkorb vorhanden
    } finally {
      loaded.current = true;
    }
    const t = setTimeout(() => setHeroReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem("sw-cart", JSON.stringify(cart));
    } catch (e) {
      // Speichern fehlgeschlagen, z.B. privater Modus
    }
  }, [cart]);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = category === "alle" || p.category === category;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [category, query]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === id), qty }));
  }, [cart]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const changeQty = (id, delta) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] || 0) + delta);
      return { ...c, [id]: next };
    });
  const removeItem = (id) => setCart((c) => { const n = { ...c }; delete n[id]; return n; });

  const sendOrder = async () => {
    setSendError("");
    if (!customerName.trim() || !customerEmail.trim()) {
      setSendError("Bitte Name und E-Mail angeben.");
      return;
    }
    setSending(true);
    const orderDetails = cartItems
      .map((i) => `${i.qty}x ${i.name} (${formatPrice(i.price)} pro Stück) = ${formatPrice(i.qty * i.price)}`)
      .join("\n");
    const itemsForDb = cartItems.map((i) => ({ name: i.name, qty: i.qty, price: i.price }));
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: SHOP_OWNER_EMAIL,
          customer_name: customerName,
          customer_email: customerEmail,
          order_details: orderDetails,
          total: formatPrice(subtotal),
        },
        EMAILJS_PUBLIC_KEY
      );
      const { error: dbError } = await supabase.from("orders").insert({
        customer_name: customerName,
        customer_email: customerEmail,
        items: itemsForDb,
        total: subtotal,
      });
      if (dbError) console.error("Bestellung konnte nicht im Dashboard gespeichert werden:", dbError);
      setCheckoutDone(true);
      setCart({});
    } catch (err) {
      setSendError("Senden fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--ink)", background: "var(--bg)", minHeight: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        :root {
          --bg: #F7F4EF;
          --surface: #FFFFFF;
          --ink: #2B2E4A;
          --muted: #7A7A82;
          --accent: #FF6F59;
          --accent-ink: #7A2E00;
          --accent2: #2F6FED;
          --line: #E4DFD6;
          --font-display: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        .sw-root * { box-sizing: border-box; }
        .sw-layer-bg {
          background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 5px, var(--line) 5px, var(--line) 6px);
        }
        .sw-hero-reveal {
          clip-path: inset(100% 0 0 0);
          transition: clip-path 1.1s cubic-bezier(.16,1,.3,1);
        }
        .sw-hero-reveal.ready { clip-path: inset(0 0 0 0); }
        .sw-cat-btn {
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--muted);
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          white-space: nowrap;
        }
        .sw-cat-btn.active {
          background: var(--ink);
          border-color: var(--ink);
          color: #fff;
        }
        .sw-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .sw-swatch {
          height: 128px;
          position: relative;
        }
        .sw-add-btn {
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 13.5px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sw-add-btn:hover { background: #E85A44; border-color: #E85A44; }
        .sw-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 380px;
          max-width: 92vw;
          background: var(--surface);
          box-shadow: -8px 0 30px rgba(0,0,0,0.12);
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(.16,1,.3,1);
          z-index: 50;
          display: flex;
          flex-direction: column;
        }
        .sw-drawer.open { transform: translateX(0); }
        .sw-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.25);
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
          z-index: 40;
        }
        .sw-overlay.open { opacity: 1; pointer-events: auto; }
        .sw-qty-btn {
          width: 26px; height: 26px; border-radius: 6px;
          border: 1px solid var(--line); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--ink);
        }
        .sw-search {
          border: 1px solid var(--line);
          background: var(--surface);
          border-radius: 999px;
          padding: 8px 14px 8px 36px;
          font-family: var(--font-body);
          font-size: 13.5px;
          width: 200px;
          outline: none;
        }
        .sw-search:focus { border-color: var(--ink); }
        .sw-spin { animation: sw-spin-anim 0.8s linear infinite; }
        @keyframes sw-spin-anim { to { transform: rotate(360deg); } }
      `}</style>

      <div className="sw-root">
        {/* Header */}
        <header style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logo size={38} withText={false} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>
                SuchyPrints
              </span>
            </div>

            <div style={{ position: "relative", display: "none" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Search size={15} color="var(--muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  className="sw-search"
                  placeholder="Produkt suchen…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setCartOpen(true)}
                style={{ position: "relative", border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                aria-label="Warenkorb öffnen"
              >
                <ShoppingCart size={18} color="var(--ink)" />
                {cartCount > 0 && (
                  <span style={{ position: "absolute", top: -6, right: -6, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 600, borderRadius: 999, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", fontFamily: "var(--font-mono)" }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 24px", position: "relative", overflow: "hidden" }}>
          <Logo
            size={380}
            withText={false}
            color="#2B2E4A"
            accent="#2B2E4A"
            style={{ position: "absolute", top: -90, right: -70, opacity: 0.05, transform: "rotate(-8deg)", pointerEvents: "none" }}
          />
          <div style={{ position: "relative" }}>
            <div className={`sw-hero-reveal sw-layer-bg ${heroReady ? "ready" : ""}`} style={{ position: "absolute", inset: 0, opacity: 0.6 }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
                FDM · PLA · PETG · TPU
              </p>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0, maxWidth: 640 }}>
                Schicht für Schicht zu deinem Objekt
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 15.5, maxWidth: 480, marginTop: 14, lineHeight: 1.6 }}>
                Handgefertigte 3D-Drucke aus dem Werkstattregal – von Deko über Ersatzteile bis zu deinem eigenen Entwurf.
              </p>
            </div>
          </div>
        </section>

        {/* Kategorien */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 8px" }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  className={`sw-cat-btn ${category === c.id ? "active" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  <Icon size={14} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Individuell-Hinweis */}
        {category === "individuell" && (
          <section style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 24px 0" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FBEAF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Wand2 size={20} color="#993556" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 600, margin: 0, fontFamily: "var(--font-display)" }}>Eigenes Design drucken lassen</p>
                <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "4px 0 0" }}>
                  Schick uns dein Modell (STL) oder deine Idee – wir kalkulieren Material, Zeit und Preis individuell.
                </p>
              </div>
              <button className="sw-add-btn" style={{ background: "var(--accent)", borderColor: "var(--accent)" }}>
                <Send size={14} /> Anfrage stellen
              </button>
            </div>
          </section>
        )}

        {/* Produktgrid */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 80px" }}>
          {filtered.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 0" }}>Keine Produkte gefunden.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {filtered.map((p) => (
                <div key={p.id} className="sw-card">
                  <div className="sw-swatch" style={{ background: p.hue }}>
                    <div className="sw-layer-bg" style={{ position: "absolute", inset: 0, opacity: 0.18 }} />
                  </div>
                  <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: MATERIALS[p.material].color, fontFamily: "var(--font-mono)", letterSpacing: "0.03em" }}>
                      {MATERIALS[p.material].label}
                    </span>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, margin: 0, lineHeight: 1.3 }}>
                      {p.name}
                    </p>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 15 }}>{formatPrice(p.price)}</span>
                      <button className="sw-add-btn" onClick={() => addToCart(p.id)}>
                        <Plus size={13} /> Warenkorb
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid var(--line)", marginTop: 24 }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 44px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <Logo size={64} />
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, margin: 0 }}>SuchyPrints</p>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>
                Handgefertigte 3D-Drucke · {SHOP_OWNER_EMAIL}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Warenkorb-Overlay + Drawer */}
      <div className={`sw-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <div className={`sw-drawer ${cartOpen ? "open" : ""}`}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17 }}>Warenkorb</span>
          <button onClick={() => setCartOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }} aria-label="Schließen">
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {cartItems.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 24 }}>Dein Warenkorb ist leer.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: item.hue, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0, lineHeight: 1.35 }}>{item.name}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--muted)", margin: "4px 0 8px" }}>{formatPrice(item.price)}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="sw-qty-btn" onClick={() => changeQty(item.id, -1)} aria-label="Menge verringern"><Minus size={13} /></button>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                    <button className="sw-qty-btn" onClick={() => changeQty(item.id, 1)} aria-label="Menge erhöhen"><Plus size={13} /></button>
                    <button onClick={() => removeItem(item.id)} style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--muted)", cursor: "pointer", fontSize: 12.5 }}>
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: "16px 20px 20px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>Zwischensumme</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 16 }}>{formatPrice(subtotal)}</span>
          </div>
          {checkoutDone ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, justifyContent: "center", padding: "16px 0" }}>
              <Logo size={40} withText={false} color="#0F6E56" accent="#0F6E56" />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0F6E56", textAlign: "center" }}>Bestellung gesendet – du erhältst eine Bestätigung per E-Mail.</span>
            </div>
          ) : (
            <>
              <input
                placeholder="Dein Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, fontFamily: "var(--font-body)", marginBottom: 8, outline: "none" }}
              />
              <input
                placeholder="Deine E-Mail-Adresse"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, fontFamily: "var(--font-body)", marginBottom: 10, outline: "none" }}
              />
              {sendError && (
                <p style={{ color: "#A32D2D", fontSize: 12.5, marginBottom: 8 }}>{sendError}</p>
              )}
              <button
                disabled={cartItems.length === 0 || sending}
                onClick={sendOrder}
                className="sw-add-btn"
                style={{ width: "100%", justifyContent: "center", background: cartItems.length === 0 ? "var(--muted)" : "var(--ink)", borderColor: cartItems.length === 0 ? "var(--muted)" : "var(--ink)", cursor: cartItems.length === 0 ? "not-allowed" : "pointer" }}
              >
                {sending ? <Loader2 size={14} className="sw-spin" /> : <Send size={14} />}
                {sending ? "Wird gesendet…" : "Bestellung senden"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
