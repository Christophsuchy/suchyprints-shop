import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { LogOut, Check, Clock, Loader2, Truck, Star, Eye, EyeOff, RefreshCw } from "lucide-react";
import ProductsAdmin from "./admin/ProductsAdmin";
import RequestsAdmin from "./admin/RequestsAdmin";
import StatsAdmin from "./admin/StatsAdmin";

function formatPrice(n) {
  return Number(n).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

const CARRIERS = [
  { id: "post", label: "Österreichische Post" },
  { id: "dhl", label: "DHL" },
  { id: "dpd", label: "DPD" },
  { id: "gls", label: "GLS" },
  { id: "hermes", label: "Hermes" },
  { id: "ohne", label: "Brief / ohne Sendungsnummer" },
];
const STATUS = {
  neu: { label: "Neu", bg: "#FAEEDA", color: "#854F0B", icon: Clock },
  verschickt: { label: "Verschickt", bg: "#E3ECFB", color: "#1F4A9A", icon: Truck },
  erledigt: { label: "Erledigt", bg: "#EAF3DE", color: "#27500A", icon: Check },
};
const btn = { border: "1px solid #D3D7DD", background: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#1B1D21" };
const inp = { border: "1px solid #D3D7DD", borderRadius: 8, padding: "8px 10px", fontSize: 13.5, outline: "none", fontFamily: "Inter, sans-serif" };

function ShipForm({ order, session, onDone }) {
  const [carrier, setCarrier] = useState("post");
  const [tracking, setTracking] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (carrier !== "ohne" && !tracking.trim()) return setErr("Bitte Sendungsnummer eintragen.");
    setBusy(true);
    try {
      const r = await fetch("/api/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ orderId: order.id, carrier, tracking: tracking.trim(), notify }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || r.status);
      if (notify && !d.mailed) setErr("Status gespeichert, aber die Mail an den Kunden ging nicht raus.");
      onDone();
    } catch (e2) {
      setErr("Hat nicht geklappt (" + e2.message + ").");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} style={{ marginTop: 12, background: "#F6F7F9", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} style={inp}>
          {CARRIERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        {carrier !== "ohne" && (
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Sendungsnummer" style={{ ...inp, flex: 1, minWidth: 180 }} />
        )}
      </div>
      <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center", color: "#374151" }}>
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Kunden per E-Mail informieren
      </label>
      {err && <p style={{ color: "#A32D2D", fontSize: 12.5, margin: 0 }}>{err}</p>}
      <div><button type="submit" disabled={busy} style={{ ...btn, background: "#1B1D21", color: "#fff", borderColor: "#1B1D21" }}>
        {busy ? <Loader2 size={13} /> : <Truck size={13} />} Als verschickt markieren
      </button></div>
    </form>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shipOpen, setShipOpen] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session]);

  async function load() {
    setLoading(true);
    const [o, r, q] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("requests").select("id, status"),
    ]);
    if (!o.error) setOrders(o.data);
    if (!r.error) setReviews(r.data);
    if (!q.error) setRequests(q.data);
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Login fehlgeschlagen. E-Mail oder Passwort prüfen.");
    setLoggingIn(false);
  }

  async function setStatus(order, status) {
    await supabase.from("orders").update({ status }).eq("id", order.id);
    load();
  }
  async function toggleReview(rv) {
    await supabase.from("reviews").update({ approved: !rv.approved }).eq("id", rv.id);
    load();
  }

  if (!session) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EDEEF1" }}>
        <form onSubmit={handleLogin} style={{ background: "#fff", border: "1px solid #D3D7DD", borderRadius: 14, padding: "32px 28px", width: 320 }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, margin: "0 0 20px" }}>SuchyPrints Dashboard</p>
          <input placeholder="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", border: "1px solid #D3D7DD", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 10, outline: "none" }} />
          <input placeholder="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", border: "1px solid #D3D7DD", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 14, outline: "none" }} />
          {loginError && <p style={{ color: "#A32D2D", fontSize: 13, marginBottom: 10 }}>{loginError}</p>}
          <button disabled={loggingIn}
            style={{ width: "100%", background: "#1B1D21", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loggingIn && <Loader2 size={14} />} Anmelden
          </button>
        </form>
      </div>
    );
  }

  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const openOrders = orders.filter((o) => (o.status || "neu") === "neu").length;
  const openRequests = requests.filter((r) => r.status === "offen").length;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#EDEEF1", padding: "32px 20px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, margin: 0 }}>SuchyPrints Dashboard</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={load} style={btn}><RefreshCw size={14} /> Aktualisieren</button>
            <button onClick={() => supabase.auth.signOut()} style={btn}><LogOut size={14} /> Abmelden</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            ["orders", `Bestellungen${openOrders ? ` (${openOrders})` : ""}`],
            ["requests", `Anfragen${openRequests ? ` (${openRequests})` : ""}`],
            ["products", "Produkte"],
            ["reviews", `Bewertungen${pendingReviews ? ` (${pendingReviews})` : ""}`],
            ["stats", "Kennzahlen"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ ...btn, background: tab === id ? "#1B1D21" : "#fff", color: tab === id ? "#fff" : "#1B1D21", borderColor: tab === id ? "#1B1D21" : "#D3D7DD", fontWeight: 500 }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "products" ? (
          <ProductsAdmin />
        ) : tab === "requests" ? (
          <RequestsAdmin onCount={() => supabase.from("requests").select("id, status").then(({ data }) => data && setRequests(data))} />
        ) : loading ? (
          <p style={{ color: "#6B7280" }}>Lädt…</p>
        ) : tab === "stats" ? (
          <StatsAdmin orders={orders} requests={requests} session={session} />
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <p style={{ color: "#6B7280" }}>Noch keine Bestellungen.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map((o) => {
                const st = STATUS[o.status] || STATUS.neu;
                const Icon = st.icon;
                return (
                  <div key={o.id} style={{ background: "#fff", border: "1px solid #D3D7DD", borderRadius: 12, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: 14.5 }}>{o.customer_name}</p>
                        <p style={{ color: "#6B7280", fontSize: 13, margin: "2px 0 0" }}>{o.customer_email}</p>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, padding: "5px 10px", borderRadius: 999, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
                        <Icon size={13} /> {st.label}
                      </span>
                    </div>
                    <div style={{ borderTop: "1px solid #EDEEF1", paddingTop: 8, marginTop: 8 }}>
                      {(o.items || []).map((item, idx) => (
                        <p key={idx} style={{ fontSize: 13, margin: "2px 0", color: "#374151" }}>
                          {item.qty}x {item.name} — {formatPrice(item.price * item.qty)}
                        </p>
                      ))}
                    </div>
                    {o.shipping_address && (
                      <p style={{ fontSize: 13, margin: "10px 0 0", color: "#374151", whiteSpace: "pre-line", lineHeight: 1.5 }}>
                        <strong>Lieferadresse:</strong>{"\n"}{o.shipping_address}
                      </p>
                    )}
                    {o.paypal_transaction_id && <p style={{ fontSize: 12, margin: "6px 0 0", color: "#6B7280" }}>PayPal: {o.paypal_transaction_id}</p>}
                    {o.status === "verschickt" && (o.carrier || o.tracking_number) && (
                      <p style={{ fontSize: 12.5, margin: "6px 0 0", color: "#1F4A9A" }}>
                        Versand: {o.carrier}{o.tracking_number ? ` · ${o.tracking_number}` : ""}{o.shipped_at ? ` · ${new Date(o.shipped_at).toLocaleDateString("de-AT")}` : ""}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, fontSize: 13, gap: 8, flexWrap: "wrap" }}>
                      <span style={{ color: "#6B7280" }}>{new Date(o.created_at).toLocaleString("de-AT")} · <strong style={{ color: "#1B1D21" }}>{formatPrice(o.total)}</strong></span>
                      <span style={{ display: "flex", gap: 6 }}>
                        {(o.status || "neu") === "neu" && (
                          <button onClick={() => setShipOpen(shipOpen === o.id ? null : o.id)} style={btn}><Truck size={13} /> Verschicken</button>
                        )}
                        {o.status !== "erledigt" ? (
                          <button onClick={() => setStatus(o, "erledigt")} style={btn}><Check size={13} /> Erledigt</button>
                        ) : (
                          <button onClick={() => setStatus(o, "neu")} style={btn}><Clock size={13} /> Wieder öffnen</button>
                        )}
                      </span>
                    </div>
                    {shipOpen === o.id && (o.status || "neu") === "neu" && (
                      <ShipForm order={o} session={session} onDone={() => { setShipOpen(null); load(); }} />
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : reviews.length === 0 ? (
          <p style={{ color: "#6B7280" }}>Noch keine Bewertungen.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map((rv) => (
              <div key={rv.id} style={{ background: "#fff", border: "1px solid #D3D7DD", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14 }}>
                {rv.photo_url && <img src={rv.photo_url} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} color="#A85A32" fill={n <= rv.rating ? "#A85A32" : "none"} />)}
                      </div>
                      <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{rv.customer_name || "Anonym"} · {new Date(rv.created_at).toLocaleDateString("de-AT")}</p>
                    </div>
                    <button onClick={() => toggleReview(rv)}
                      style={{ ...btn, background: rv.approved ? "#EAF3DE" : "#1B1D21", color: rv.approved ? "#27500A" : "#fff", borderColor: rv.approved ? "#C9DDB0" : "#1B1D21" }}>
                      {rv.approved ? <><Eye size={13} /> Sichtbar – ausblenden</> : <><EyeOff size={13} /> Freigeben</>}
                    </button>
                  </div>
                  <p style={{ fontSize: 14, margin: "10px 0 0", color: "#1B1D21", lineHeight: 1.5, whiteSpace: "pre-line" }}>{rv.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
