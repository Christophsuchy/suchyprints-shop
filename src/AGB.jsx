import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const h2 = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "28px 0 10px" };
const p = { lineHeight: 1.7, fontSize: 14, margin: "0 0 10px", color: "#3A3540" };

export default function AGB() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 32 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, margin: "0 0 32px" }}>Allgemeine Geschäftsbedingungen</h1>

        <h2 style={h2}>1. Geltungsbereich</h2>
        <p style={p}>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen, die über suchyprints.at abgegeben werden, abgeschlossen zwischen SuchyPrints, Christoph Suchy, Murgasse 3, 8121 Deutschfeistritz (nachfolgend „Verkäufer") und dem Kunden.
        </p>

        <h2 style={h2}>2. Vertragsschluss</h2>
        <p style={p}>
          Die Darstellung der Produkte im Shop stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Bestellung. Mit Absenden der Bestellung (inkl. erfolgreicher Zahlung) gibt der Kunde ein verbindliches Angebot zum Kauf ab. Der Vertrag kommt durch Bestätigung des Verkäufers (z. B. per E-Mail) zustande.
        </p>

        <h2 style={h2}>3. Preise und Zahlung</h2>
        <p style={p}>
          Alle angegebenen Preise verstehen sich in Euro. Die Zahlung erfolgt ausschließlich über PayPal. Der Kaufpreis ist mit Vertragsschluss fällig.
        </p>

        <h2 style={h2}>4. Individuelle Anfertigungen</h2>
        <p style={p}>
          Bei nach Kundenspezifikation angefertigten Produkten (Kategorie „Individuell") wird vorab ein Angebot erstellt, das erst nach Bestätigung durch den Kunden verbindlich wird.
        </p>

        <h2 style={h2}>5. Versand</h2>
        <p style={p}>
          Der Versand erfolgt innerhalb der auf der Website angegebenen Lieferzeit. Bei Lieferverzögerungen wird der Kunde informiert.
        </p>

        <h2 style={h2}>6. Gewährleistung</h2>
        <p style={p}>
          Es gelten die gesetzlichen Gewährleistungsbestimmungen. Bei berechtigten Mängeln hat der Kunde Anspruch auf Verbesserung, Austausch, Preisminderung oder Wandlung nach Maßgabe der gesetzlichen Vorschriften.
        </p>

        <h2 style={h2}>7. Widerrufsrecht</h2>
        <p style={p}>
          Es gilt die separate Widerrufsbelehrung. Bei individuell angefertigten Produkten ist das Widerrufsrecht gesetzlich ausgeschlossen.
        </p>

        <h2 style={h2}>8. Haftung</h2>
        <p style={p}>
          Der Verkäufer haftet nach den gesetzlichen Bestimmungen. Eine Haftung für leichte Fahrlässigkeit ist, soweit gesetzlich zulässig, ausgeschlossen.
        </p>

        <h2 style={h2}>9. Schlussbestimmungen</h2>
        <p style={p}>
          Es gilt österreichisches Recht. Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </div>
    </div>
  );
}
