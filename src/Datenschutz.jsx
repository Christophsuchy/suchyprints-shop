import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const h2 = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "28px 0 10px" };
const p = { lineHeight: 1.7, fontSize: 14, margin: "0 0 10px", color: "#3A3540" };

export default function Datenschutz() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
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

        <h2 style={h2}>4. Newsletter</h2>
        <p style={p}>
          Wenn du dich für unseren Newsletter anmeldest, verarbeiten wir deine E-Mail-Adresse auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), um dich über den Shop-Start, neue Produkte und Aktionen zu informieren. Die Anmeldung erfolgt im Double-Opt-in-Verfahren: Du erhältst zuerst eine E-Mail mit einem Bestätigungslink, erst danach wirst du eingetragen. Dabei werden der Zeitpunkt der Anmeldung und der Bestätigung gespeichert, um die Einwilligung nachweisen zu können.
        </p>
        <p style={p}>
          Für den Versand nutzen wir den Dienst Brevo (Sendinblue SAS, 106 boulevard Haussmann, 75008 Paris, Frankreich). Deine Daten werden auf Servern in der EU gespeichert. Mit Brevo besteht ein Auftragsverarbeitungsvertrag.
        </p>
        <p style={p}>
          Du kannst deine Einwilligung jederzeit widerrufen – über den Abmeldelink in jeder Newsletter-Mail oder per E-Mail an uns. Deine Adresse wird dann aus der Liste gelöscht.
        </p>

        <h2 style={h2}>5. Hosting</h2>
        <p style={p}>
          Diese Website wird über Vercel Inc. gehostet. Beim Aufruf der Seite werden technisch notwendige Daten (z. B. IP-Adresse, Zugriffszeitpunkt) durch den Hosting-Anbieter verarbeitet, um die Seite auszuliefern.
        </p>

        <h2 style={h2}>6. Deine Rechte</h2>
        <p style={p}>
          Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung deiner Daten sowie ein Beschwerderecht bei der österreichischen Datenschutzbehörde. Wende dich dazu einfach an die oben genannte E-Mail-Adresse.
        </p>

        <h2 style={h2}>7. Speicherdauer</h2>
        <p style={p}>
          Bestelldaten werden so lange gespeichert, wie es gesetzliche Aufbewahrungspflichten (insb. steuerrechtlich) vorschreiben, danach werden sie gelöscht. Newsletter-Daten speichern wir, bis du dich abmeldest.
        </p>
      </div>
    </div>
  );
}
