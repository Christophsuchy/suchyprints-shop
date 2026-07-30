import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const h2 = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "28px 0 10px" };
const p = { lineHeight: 1.7, fontSize: 14, margin: "0 0 10px", color: "#3A3540" };

export default function Datenschutz() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 32 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, margin: "0 0 12px" }}>Datenschutzerklärung</h1>
        <p style={{ ...p, color: "#7A7A82" }}>Stand: {new Date().toLocaleDateString("de-AT", { year: "numeric", month: "long" })}</p>

        <h2 style={h2}>1. Verantwortlicher</h2>
        <p style={p}>
          SuchyPrints, Christoph Suchy, Murgasse 3, 8121 Deutschfeistritz, Österreich<br />
          E-Mail: christoph.suchy@suchyprints.at
        </p>

        <h2 style={h2}>2. Welche Daten wir verarbeiten</h2>
        <p style={p}>
          Wenn du über unseren Shop bestellst, verarbeiten wir die von dir angegebenen Daten (Name, E-Mail-Adresse, Bestellinhalt) zur Abwicklung deiner Bestellung. Diese Daten werden per E-Mail an uns übermittelt (über den Dienst EmailJS) und zusätzlich in einer Datenbank (Supabase, Hosting in der EU) gespeichert, damit wir Bestellungen verwalten können.
        </p>
        <p style={p}>
          Der Inhalt deines Warenkorbs wird lokal in deinem Browser gespeichert (localStorage), damit er beim erneuten Besuch erhalten bleibt. Diese Daten verlassen dein Gerät nicht, bis du eine Bestellung abschickst.
        </p>

        <h2 style={h2}>3. Zahlungsabwicklung</h2>
        <p style={p}>
          Zahlungen werden über PayPal abgewickelt. Dabei werden deine Zahlungsdaten direkt an PayPal (Europe) S.à r.l. et Cie, S.C.A. übermittelt und unterliegen deren Datenschutzbestimmungen. Wir selbst erhalten keine Kreditkarten- oder Kontodaten, lediglich die Bestätigung und Transaktionsnummer der Zahlung.
        </p>

        <h2 style={h2}>4. Hosting</h2>
        <p style={p}>
          Diese Website wird über Vercel Inc. gehostet. Beim Aufruf der Seite werden technisch notwendige Daten (z. B. IP-Adresse, Zugriffszeitpunkt) durch den Hosting-Anbieter verarbeitet, um die Seite auszuliefern.
        </p>

        <h2 style={h2}>5. Deine Rechte</h2>
        <p style={p}>
          Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung deiner Daten sowie ein Beschwerderecht bei der österreichischen Datenschutzbehörde. Wende dich dazu einfach an die oben genannte E-Mail-Adresse.
        </p>

        <h2 style={h2}>6. Speicherdauer</h2>
        <p style={p}>
          Bestelldaten werden so lange gespeichert, wie es gesetzliche Aufbewahrungspflichten (insb. steuerrechtlich) vorschreiben, danach werden sie gelöscht.
        </p>
      </div>
    </div>
  );
}
