import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const h2 = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "28px 0 10px" };
const p = { lineHeight: 1.7, fontSize: 14, margin: "0 0 10px", color: "#3A3540" };

export default function Widerruf() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 32 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, margin: "0 0 32px" }}>Widerrufsbelehrung</h1>

        <h2 style={h2}>Widerrufsrecht</h2>
        <p style={p}>
          Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter die Ware in Besitz genommen hast.
        </p>
        <p style={p}>
          Um dein Widerrufsrecht auszuüben, musst du uns (SuchyPrints, Christoph Suchy, Murgasse 3, 8121 Deutschfeistritz, Österreich, christoph.suchy@suchyprints.at) mittels einer eindeutigen Erklärung (z. B. per E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren.
        </p>

        <h2 style={h2}>Folgen des Widerrufs</h2>
        <p style={p}>
          Wenn du diesen Vertrag widerrufst, erstatten wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurück, an dem die Mitteilung über deinen Widerruf bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel (PayPal), das du bei der ursprünglichen Transaktion eingesetzt hast.
        </p>
        <p style={p}>
          Wir können die Rückzahlung verweigern, bis wir die Ware zurückerhalten haben oder du den Nachweis erbracht hast, dass du die Ware zurückgesandt hast, je nachdem, welches der frühere Zeitpunkt ist.
        </p>

        <h2 style={h2}>Ausschluss des Widerrufsrechts</h2>
        <p style={p}>
          Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind (§ 18 Abs. 1 Z 3 FAGG). Dies betrifft insbesondere Produkte aus der Kategorie „Individuell".
        </p>

        <h2 style={h2}>Muster-Widerrufsformular</h2>
        <p style={p}>
          (Wenn du den Vertrag widerrufen willst, kannst du dieses Formular ausfüllen und an uns zurücksenden.)
        </p>
        <p style={{ ...p, padding: 16, background: "#fff", border: "1px solid #E4DFD6", borderRadius: 10 }}>
          An SuchyPrints, Christoph Suchy, Murgasse 3, 8121 Deutschfeistritz, Österreich, christoph.suchy@suchyprints.at:<br /><br />
          Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren:<br />
          Bestellt am: _______ / Erhalten am: _______<br />
          Name des/der Verbraucher(s):<br />
          Anschrift des/der Verbraucher(s):<br />
          Datum:
        </p>
      </div>
    </div>
  );
}
