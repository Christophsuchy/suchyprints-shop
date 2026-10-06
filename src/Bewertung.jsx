import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, Loader2, Check } from "lucide-react";

const card = { background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #ECE6DE" };
const field = { width: "100%", border: "1px solid #D9D2C8", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", background: "#fff", color: "#2B2E4A" };

export default function Bewertung() {
  const { token } = useParams();
  const [state, setState] = useState("loading"); // loading | ready | done | already | notfound | error
  const [info, setInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`/api/review?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (r.status === 404 || r.status === 400) return setState("notfound");
        if (!r.ok) return setState("error");
        const d = await r.json();
        setInfo(d);
        setName(d.firstName || "");
        setState(d.alreadyReviewed ? "already" : "ready");
      })
      .catch(() => setState("error"));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!rating) return setFormError("Bitte wähle 1 bis 5 Sterne.");
    if (text.trim().length < 3) return setFormError("Schreib bitte ein paar Worte dazu.");
    setSending(true);
    try {
      const r = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, text, name }),
      });
      if (r.status === 409) setState("already");
      else if (!r.ok) setFormError("Da ist etwas schiefgelaufen. Bitte später erneut versuchen.");
      else setState("done");
    } catch {
      setFormError("Da ist etwas schiefgelaufen. Bitte später erneut versuchen.");
    } finally {
      setSending(false);
    }
  };

  const message = (title, body) => (
    <div style={{ ...card, textAlign: "center" }}>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>{title}</p>
      <p style={{ fontSize: 14.5, color: "#7A7A82", margin: 0, lineHeight: 1.6 }}>{body}</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, margin: "0 0 20px" }}>Deine Bewertung</h1>

        {state === "loading" && (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 size={22} className="bw-spin" color="#A85A32" />
          </div>
        )}
        {state === "notfound" && message("Link nicht gefunden", "Dieser Bewertungslink ist leider ungültig. Schau bitte nach, ob du den ganzen Link aus der Mail geöffnet hast.")}
        {state === "error" && message("Gerade nicht erreichbar", "Bitte versuch es in ein paar Minuten noch einmal.")}
        {state === "already" && message("Schon bewertet – danke!", "Für diese Bestellung haben wir deine Bewertung bereits erhalten.")}
        {state === "done" && (
          <div style={{ ...card, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(15,110,86,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Check size={24} color="#0F6E56" />
            </div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>Danke für deine Bewertung!</p>
            <p style={{ fontSize: 14.5, color: "#7A7A82", margin: 0, lineHeight: 1.6 }}>Sie wird nach einer kurzen Prüfung im Shop angezeigt.</p>
          </div>
        )}

        {state === "ready" && (
          <form onSubmit={submit} style={card}>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "0 0 16px" }}>
              {info?.firstName ? `Hallo ${info.firstName}, w` : "W"}ie zufrieden bist du mit deiner Bestellung
              {info?.items?.length ? <> ({info.items.join(", ")})</> : null}?
            </p>
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }} onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} von 5 Sternen`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  style={{ background: "none", border: "none", padding: 2, cursor: "pointer" }}
                >
                  <Star size={30} color="#A85A32" fill={(hover || rating) >= n ? "#A85A32" : "none"} />
                </button>
              ))}
            </div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Deine Meinung</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={5} placeholder="Was hat dir gefallen? Was können wir besser machen?" style={{ ...field, resize: "vertical", marginBottom: 14 }} />
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Angezeigter Name (optional)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="z. B. Anna" style={{ ...field, marginBottom: 6 }} />
            <p style={{ fontSize: 12, color: "#7A7A82", margin: "0 0 18px" }}>Leer lassen, wenn du anonym bleiben möchtest.</p>
            {formError && <p style={{ color: "#A32D2D", fontSize: 13, margin: "0 0 12px" }}>{formError}</p>}
            <button type="submit" disabled={sending} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#A85A32", color: "#fff", border: "none", borderRadius: 999, padding: "12px 24px", fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}>
              {sending && <Loader2 size={15} className="bw-spin" />} Bewertung absenden
            </button>
          </form>
        )}
      </div>
      <style>{`.bw-spin { animation: bw-spin 0.8s linear infinite; } @keyframes bw-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
