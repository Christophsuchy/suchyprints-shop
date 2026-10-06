import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Loader2, Check } from "lucide-react";

// "Benachrichtige mich, wenn verfügbar" – Double-Opt-in über /api/notify (Brevo)
export default function NotifyMe({ product }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState(null); // sending | success | invalid | error

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !consent) return;
    setStatus("sending");
    try {
      const r = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId: product.id, productName: product.name, website: hp }),
      });
      if (r.status === 400) return setStatus("invalid");
      if (!r.ok) throw new Error(String(r.status));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(15,110,86,0.08)", borderRadius: 12, padding: "14px 16px", color: "#0F6E56", fontSize: 14, lineHeight: 1.5 }}>
        <Check size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Fast geschafft! Bitte bestätige noch kurz deine E-Mail-Adresse – dann sagen wir dir Bescheid, sobald es soweit ist.</span>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: "#7A7A82", fontSize: 14, margin: "0 0 14px" }}>
        Wir arbeiten gerade daran – bald kannst du es hier bestellen.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2B2E4A", color: "#fff", border: "none", borderRadius: 999, padding: "12px 22px", fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}
        >
          <Bell size={15} /> Benachrichtige mich
        </button>
      ) : (
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #E4DFD6", borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, margin: "0 0 10px" }}>Sag mir Bescheid, wenn „{product.name}“ verfügbar ist</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Deine E-Mail-Adresse" aria-label="E-Mail-Adresse"
              style={{ flex: 1, minWidth: 200, border: "1px solid #D9D2C8", borderRadius: 999, padding: "10px 16px", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
            />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
            <button
              type="submit" disabled={!consent || status === "sending"}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#A85A32", color: "#fff", border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: consent ? "pointer" : "not-allowed", opacity: consent ? 1 : 0.6 }}
            >
              {status === "sending" ? <Loader2 size={15} className="nm-spin" /> : <Bell size={14} />} Eintragen
            </button>
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, fontSize: 12, color: "#5C5763", lineHeight: 1.5, cursor: "pointer" }}>
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: "#A85A32", flexShrink: 0 }} />
            <span>
              Ja, informiert mich per E-Mail, wenn das Produkt verfügbar ist, und über Neuigkeiten von SuchyPrints. Abmeldung jederzeit möglich. Mehr in der{" "}
              <Link to="/datenschutz" style={{ color: "#A85A32" }}>Datenschutzerklärung</Link>.
            </span>
          </label>
          {status === "invalid" && <p style={{ color: "#A32D2D", fontSize: 12.5, margin: "8px 0 0" }}>Bitte prüf deine E-Mail-Adresse.</p>}
          {status === "error" && <p style={{ color: "#A32D2D", fontSize: 12.5, margin: "8px 0 0" }}>Da ist etwas schiefgelaufen. Bitte später erneut versuchen.</p>}
        </form>
      )}
      <style>{`.nm-spin{animation:nm-spin .8s linear infinite}@keyframes nm-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
