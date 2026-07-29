import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { LogOut, Check, Clock, Loader2 } from "lucide-react";

function formatPrice(n) {
  return Number(n).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadOrders();
  }, [session]);

  async function loadOrders() {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setOrders(data);
    setLoadingOrders(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Login fehlgeschlagen. E-Mail oder Passwort prüfen.");
    setLoggingIn(false);
  }

  async function toggleStatus(order) {
    const newStatus = order.status === "erledigt" ? "neu" : "erledigt";
    await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
    loadOrders();
  }

  if (!session) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EDEEF1" }}>
        <form onSubmit={handleLogin} style={{ background: "#fff", border: "1px solid #D3D7DD", borderRadius: 14, padding: "32px 28px", width: 320 }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, margin: "0 0 20px" }}>SchichtWerk Dashboard</p>
          <input
            placeholder="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", border: "1px solid #D3D7DD", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 10, outline: "none" }}
          />
          <input
            placeholder="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", border: "1px solid #D3D7DD", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 14, outline: "none" }}
          />
          {loginError && <p style={{ color: "#A32D2D", fontSize: 13, marginBottom: 10 }}>{loginError}</p>}
          <button
            disabled={loggingIn}
            style={{ width: "100%", background: "#1B1D21", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loggingIn && <Loader2 size={14} />}
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#EDEEF1", padding: "32px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, margin: 0 }}>Bestellungen</p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ border: "1px solid #D3D7DD", background: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <LogOut size={14} /> Abmelden
          </button>
        </div>

        {loadingOrders ? (
          <p style={{ color: "#6B7280" }}>Lädt…</p>
        ) : orders.length === 0 ? (
          <p style={{ color: "#6B7280" }}>Noch keine Bestellungen.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((o) => (
              <div key={o.id} style={{ background: "#fff", border: "1px solid #D3D7DD", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: 14.5 }}>{o.customer_name}</p>
                    <p style={{ color: "#6B7280", fontSize: 13, margin: "2px 0 0" }}>{o.customer_email}</p>
                  </div>
                  <button
                    onClick={() => toggleStatus(o)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500,
                      padding: "5px 10px", borderRadius: 999, border: "none", cursor: "pointer",
                      background: o.status === "erledigt" ? "#EAF3DE" : "#FAEEDA",
                      color: o.status === "erledigt" ? "#27500A" : "#854F0B",
                    }}
                  >
                    {o.status === "erledigt" ? <Check size={13} /> : <Clock size={13} />}
                    {o.status === "erledigt" ? "Erledigt" : "Neu"}
                  </button>
                </div>
                <div style={{ borderTop: "1px solid #EDEEF1", paddingTop: 8, marginTop: 8 }}>
                  {(o.items || []).map((item, idx) => (
                    <p key={idx} style={{ fontSize: 13, margin: "2px 0", color: "#374151" }}>
                      {item.qty}x {item.name} — {formatPrice(item.price * item.qty)}
                    </p>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
                  <span style={{ color: "#6B7280" }}>{new Date(o.created_at).toLocaleString("de-AT")}</span>
                  <span style={{ fontWeight: 600 }}>{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
