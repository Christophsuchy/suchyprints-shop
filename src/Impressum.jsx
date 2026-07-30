import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Impressum() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 32 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, margin: "0 0 32px" }}>Impressum</h1>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "0 0 10px" }}>
            Angaben gemäß § 5 ECG
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 14.5, margin: 0 }}>
            SuchyPrints<br />
            Christoph Suchy<br />
            Murgasse 3<br />
            8121 Deutschfeistritz<br />
            Österreich
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "0 0 10px" }}>
            Kontakt
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 14.5, margin: 0 }}>
            E-Mail: christoph.suchy@suchyprints.at<br />
            Telefon: wird ergänzt
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "0 0 10px" }}>
            Gewerberechtliche Angaben
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 14.5, margin: 0, color: "#7A7A82" }}>
            Gewerbeanmeldung ausständig – wird in Kürze ergänzt.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: "0 0 10px" }}>
            EU-Streitschlichtung
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 14.5, margin: 0 }}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, abrufbar unter{" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" style={{ color: "#A85A32" }}>
              ec.europa.eu/consumers/odr
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
