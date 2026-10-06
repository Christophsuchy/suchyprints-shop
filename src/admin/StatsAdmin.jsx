import React, { useEffect, useMemo, useState } from "react";
import { card, euro } from "./ui";

const MONTHS = ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const ACCENT = "#A85A32";

function Tile({ label, value, sub }) {
  return (
    <div style={{ ...card, padding: "14px 16px" }}>
      <p style={{ margin: 0, fontSize: 12.5, color: "#6B7280" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: "#1B1D21" }}>{value}</p>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{sub}</p>}
    </div>
  );
}

// Basis-Produktname ohne Farbe/Wunschtext, z. B. "Zahnrad-Fidget (Rot)" → "Zahnrad-Fidget"
const baseName = (n) => String(n).split(" (")[0].split(" – ")[0].trim();

export default function StatsAdmin({ orders, requests, session }) {
  const [lists, setLists] = useState(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    fetch("/api/stats", { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setLists)
      .catch(() => setLists({ error: true }));
  }, [session]);

  const s = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, revenue: 0, count: 0 };
    });
    let total = 0, thisMonth = 0, thisMonthCount = 0;
    const prod = {};
    for (const o of orders) {
      const t = Number(o.total) || 0;
      const d = new Date(o.created_at);
      total += t;
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) { m.revenue += t; m.count += 1; }
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) { thisMonth += t; thisMonthCount += 1; }
      for (const it of o.items || []) {
        if (String(it.name).startsWith("Versand")) continue;
        const k = baseName(it.name);
        prod[k] = prod[k] || { name: k, qty: 0, revenue: 0 };
        prod[k].qty += Number(it.qty) || 0;
        prod[k].revenue += (Number(it.qty) || 0) * (Number(it.price) || 0);
      }
    }
    const top = Object.values(prod).sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, 8);
    const max = Math.max(1, ...months.map((m) => m.revenue));
    const open = orders.filter((o) => (o.status || "neu") === "neu").length;
    return { months, total, thisMonth, thisMonthCount, top, max, open, avg: orders.length ? total / orders.length : 0 };
  }, [orders]);

  const openRequests = (requests || []).filter((r) => r.status === "offen").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <Tile label="Umsatz diesen Monat" value={euro(s.thisMonth)} sub={`${s.thisMonthCount} Bestellung${s.thisMonthCount === 1 ? "" : "en"}`} />
        <Tile label="Umsatz gesamt" value={euro(s.total)} sub={`${orders.length} Bestellungen`} />
        <Tile label="Ø Bestellwert" value={euro(s.avg)} />
        <Tile label="Zu erledigen" value={`${s.open + openRequests}`} sub={`${s.open} Bestellungen · ${openRequests} Anfragen`} />
      </div>

      <div style={card}>
        <p style={{ margin: "0 0 14px", fontWeight: 600, fontSize: 14 }}>Umsatz der letzten 6 Monate</p>
        <div role="img" aria-label={"Umsatz pro Monat: " + s.months.map((m) => `${m.label} ${euro(m.revenue)}`).join(", ")}
          style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, borderBottom: "1px solid #E5E7EB", position: "relative" }}>
          {s.months.map((m, i) => (
            <div key={m.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
              style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative", cursor: "default", outline: "none" }}>
              <div style={{ width: "62%", maxWidth: 46, height: `${Math.max(m.revenue ? 3 : 0, (m.revenue / s.max) * 100)}%`, background: ACCENT, opacity: hover === null || hover === i ? 1 : 0.55, borderRadius: "4px 4px 0 0", transition: "opacity .15s" }} />
              {hover === i && (
                <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#1B1D21", color: "#fff", fontSize: 12, padding: "6px 9px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 2 }}>
                  {m.label}: <strong>{euro(m.revenue)}</strong> · {m.count} Best.
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {s.months.map((m) => <span key={m.key} style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "#6B7280" }}>{m.label}</span>)}
        </div>
        {orders.length === 0 && <p style={{ fontSize: 12.5, color: "#6B7280", margin: "10px 0 0" }}>Sobald die ersten Bestellungen da sind, wächst hier der Umsatz.</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div style={card}>
          <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 14 }}>Meistverkauft</p>
          {s.top.length === 0 ? <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Noch keine Verkäufe.</p> : (
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead><tr style={{ color: "#6B7280", textAlign: "left" }}><th style={{ fontWeight: 500, padding: "4px 0" }}>Produkt</th><th style={{ fontWeight: 500, textAlign: "right" }}>Stück</th><th style={{ fontWeight: 500, textAlign: "right" }}>Umsatz</th></tr></thead>
              <tbody>{s.top.map((p) => (
                <tr key={p.name} style={{ borderTop: "1px solid #F1F2F4" }}><td style={{ padding: "6px 0" }}>{p.name}</td><td style={{ textAlign: "right" }}>{p.qty}</td><td style={{ textAlign: "right" }}>{euro(p.revenue)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div style={card}>
          <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 14 }}>Wartelisten</p>
          {!lists ? <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Lädt…</p> : lists.error ? <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Zahlen von Brevo gerade nicht abrufbar.</p> : (
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <tbody>
                <tr><td style={{ padding: "6px 0", fontWeight: 600 }}>Newsletter / Shop-Start</td><td style={{ textAlign: "right", fontWeight: 600 }}>{lists.newsletter ?? "–"}</td></tr>
                {lists.products.map((p) => (
                  <tr key={p.productId} style={{ borderTop: "1px solid #F1F2F4" }}><td style={{ padding: "6px 0" }}>{p.name}</td><td style={{ textAlign: "right" }}>{p.subscribers}</td></tr>
                ))}
                {lists.products.length === 0 && <tr><td colSpan={2} style={{ color: "#6B7280", padding: "6px 0" }}>Noch niemand bei einem Produkt eingetragen.</td></tr>}
              </tbody>
            </table>
          )}
          <p style={{ fontSize: 11.5, color: "#9CA3AF", margin: "10px 0 0" }}>Bestätigte Kontakte laut Brevo.</p>
        </div>
      </div>
    </div>
  );
}
