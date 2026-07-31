import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { ArrowLeft, Send, Check, Loader2 } from "lucide-react";
import { EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, SHOP_OWNER_EMAIL, EMAILJS_CONTACT_TEMPLATE_ID } from "./emailConfig";

export default function Kontakt() {
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(location.state?.prefill || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }
    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CONTACT_TEMPLATE_ID,
        {
          to_email: SHOP_OWNER_EMAIL,
          from_name: name,
          from_email: email,
          message,
        }
      );
      setSent(true);
    } catch (err) {
      setError("Senden fehlgeschlagen. Bitte versuch es später erneut oder schreib direkt eine E-Mail.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    width: "100%", border: "1px solid #E4DFD6", borderRadius: 10, padding: "11px 14px",
    fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 14,
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 32 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, margin: "0 0 8px" }}>Kontakt</h1>
        <p style={{ color: "#7A7A82", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Frage, Idee für ein individuelles Projekt, oder einfach nur Feedback? Schreib uns gerne.
        </p>

        {sent ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#0F6E56", fontWeight: 500, fontSize: 15, padding: "20px 0" }}>
            <Check size={18} /> Danke für deine Nachricht – wir melden uns bald bei dir!
          </div>
        ) : (
          <form onSubmit={submit}>
            <input placeholder="Dein Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            <input placeholder="Deine E-Mail-Adresse" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <textarea
              placeholder="Deine Nachricht"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
            />
            <p style={{ color: "#7A7A82", fontSize: 12, marginTop: -8, marginBottom: 14 }}>
              Fotos, Skizzen oder Maße kannst du uns einfach als Antwort auf unsere Bestätigungs-E-Mail schicken.
            </p>
            {error && <p style={{ color: "#A32D2D", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button
              disabled={sending}
              type="submit"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #C97A4E, #82431F)",
                color: "#fff", border: "none", borderRadius: 999, padding: "12px 26px", fontSize: 14.5, fontWeight: 600,
                cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? <Loader2 size={15} /> : <Send size={15} />}
              {sending ? "Wird gesendet…" : "Nachricht senden"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
