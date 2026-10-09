import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Camera, Ruler, Wrench, Package, ShieldAlert, Check } from "lucide-react";
import { useReferences, refKind } from "./ReferenceGallery";

const KIND = "Ersatzteil nach Foto oder Maß";
const PREFILL = "Was ist kaputt? \nWofür / in welchem Gerät (Marke, Modell)? \nMuss es etwas aushalten (Hitze, Druck, draußen)? \n";
const toForm = { pathname: "/anfrage" };
const formState = { kind: KIND, prefill: PREFILL };

const PARTS = [
  "Drehknöpfe & Griffe",
  "Clips, Laschen & Halterungen",
  "Batterie- & Gehäusedeckel",
  "Abdeckkappen & Stopfen",
  "Möbel- & Regalteile",
  "Teile für Garten & Werkstatt",
  "Auto-Innenraum & Moped",
  "Haushaltsgeräte (Kunststoffteile)",
];

const TIPS = [
  [Camera, "Fotos von allen Seiten", "Vorne, hinten, seitlich – und ein Foto davon, wo das Teil eingebaut ist."],
  [Ruler, "Lineal oder Münze daneben", "Dann sehen wir die Größe. Mit Schieblehre gemessene Maße (Löcher, Dicke) helfen am meisten."],
  [Wrench, "Gerät & Modell", "Marke und Modellnummer stehen oft auf einem Typenschild. Manchmal gibt's dazu schon Maße."],
  [Package, "Altes Teil schicken", "Bei kniffligen Formen kannst du uns das Original auch schicken. Die Adresse bekommst du mit dem Angebot."],
];

const MATERIALS = [
  ["PETG", "Robust und hitzebeständiger – für Auto, Garten, Küche und alles, was draußen ist."],
  ["PLA", "Formstabil und sauber – für Innenräume ohne Hitze."],
  ["TPU", "Flexibel wie Gummi – für Füße, Puffer, Dichtungen und Clips, die nachgeben müssen."],
];

const FAQ = [
  ["Was kostet ein Ersatzteil?", "Das hängt vom Aufwand ab: Wie kompliziert ist das Teil nachzukonstruieren, wie groß ist es? Du bekommst vorher ein konkretes Angebot und entscheidest dann – unverbindlich."],
  ["Wie schnell geht das?", "Eine Einschätzung mit Preis bekommst du in der Regel in 1–2 Werktagen. Die Lieferzeit steht dann im Angebot."],
  ["Passt das Teil sicher?", "Wir messen und konstruieren sorgfältig nach. Wenn es auf Zehntelmillimeter ankommt, stimmen wir die Maße vorher mit dir ab."],
  ["Brauche ich eine 3D-Datei?", "Nein. Fotos und ein paar Maße reichen. Wenn du schon eine Datei hast (STL, 3MF, STEP), lad sie einfach mit hoch."],
];

export default function Ersatzteil() {
  const refs = useReferences().filter((p) => refKind(p) === KIND).slice(0, 6);
  useEffect(() => { document.title = "Ersatzteil-Service · SuchyPrints"; return () => { document.title = "SuchyPrints"; }; }, []);

  return (
    <div className="et" style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <style>{`
        .et-wrap { max-width: 860px; margin: 0 auto; padding: 40px 20px 80px; }
        .et-eyebrow { display: block; font-size: 12px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: #A85A32; margin-bottom: 10px; }
        .et h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(32px, 6vw, 46px); line-height: 1.05; letter-spacing: -1px; margin: 0 0 14px; text-wrap: balance; }
        .et h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 21px; margin: 0 0 14px; }
        .et-lead { color: #5C5763; font-size: 16px; line-height: 1.65; margin: 0 0 24px; max-width: 620px; }
        .et-cta { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #C97A4E, #82431F); color: #fff; border-radius: 999px; padding: 14px 26px; font-size: 15px; font-weight: 600; text-decoration: none; box-shadow: 0 8px 18px rgba(130, 67, 31, 0.28); }
        .et-cta:focus-visible { outline: 3px solid #2B2E4A; outline-offset: 3px; }
        .et-note { color: #7A7A82; font-size: 13px; margin: 12px 0 0; }
        .et-sec { margin-top: 44px; }
        .et-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .et-chip { background: #fff; border: 1px solid #E4DFD6; border-radius: 999px; padding: 8px 14px; font-size: 13.5px; }
        .et-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .et-step { background: #fff; border: 1px solid #E4DFD6; border-radius: 14px; padding: 16px 14px; display: flex; gap: 10px; }
        .et-step-n { flex-shrink: 0; width: 26px; height: 26px; border-radius: 999px; background: #A85A32; color: #fff; font: 700 13px 'Space Grotesk', sans-serif; display: flex; align-items: center; justify-content: center; }
        .et-step-t { display: block; font-weight: 600; font-size: 14px; margin: 2px 0 4px; }
        .et-step-d { display: block; color: #7A7A82; font-size: 13px; line-height: 1.45; }
        .et-tips { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .et-tip { background: #fff; border: 1px solid #E4DFD6; border-radius: 14px; padding: 16px; display: flex; gap: 12px; align-items: flex-start; }
        .et-tip-i { flex-shrink: 0; width: 38px; height: 38px; border-radius: 10px; background: rgba(168, 90, 50, 0.1); color: #A85A32; display: flex; align-items: center; justify-content: center; }
        .et-tip b { display: block; font-size: 14px; margin-bottom: 3px; }
        .et-tip span { color: #7A7A82; font-size: 13px; line-height: 1.5; }
        .et-mat { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .et-mat div { background: #fff; border: 1px solid #E4DFD6; border-radius: 14px; padding: 14px; }
        .et-mat b { font-family: 'Space Grotesk', sans-serif; font-size: 16px; display: block; margin-bottom: 4px; }
        .et-mat span { color: #7A7A82; font-size: 13px; line-height: 1.5; }
        .et-refs { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .et-ref { background: #fff; border: 1px solid #E4DFD6; border-radius: 14px; overflow: hidden; }
        .et-ref img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; }
        .et-ref p { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 14px; margin: 0; padding: 10px 12px 12px; }
        .et-limit { display: flex; gap: 12px; align-items: flex-start; background: #FFF6EF; border: 1px solid #F0D9C6; border-radius: 14px; padding: 16px; font-size: 13.5px; line-height: 1.55; color: #5C5763; }
        .et-faq details { background: #fff; border: 1px solid #E4DFD6; border-radius: 12px; padding: 14px 16px; }
        .et-faq { display: grid; gap: 8px; }
        .et-faq summary { font-weight: 600; font-size: 14.5px; cursor: pointer; }
        .et-faq p { color: #5C5763; font-size: 13.5px; line-height: 1.6; margin: 10px 0 0; }
        .et-end { margin-top: 48px; background: #2B2E4A; color: #F2EFE8; border-radius: 20px; padding: 30px 26px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px; }
        .et-end p { margin: 0; }
        .et-end .t { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; }
        .et-end .d { color: #C9C7D4; font-size: 14px; margin-top: 4px; }
        @media (max-width: 640px) {
          .et-steps, .et-tips, .et-mat { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="et-wrap">
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 26 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>

        <span className="et-eyebrow">Ersatzteil-Service</span>
        <h1>Kaputt? Wir drucken's nach.</h1>
        <p className="et-lead">
          Abgebrochener Knopf, verlorener Deckel, gerissener Clip – und das Teil gibt's nirgends mehr zu kaufen?
          Schick uns ein Foto und ein paar Maße. Wir konstruieren das Teil nach und drucken es dir in einem passenden Material.
        </p>
        <Link to={toForm} state={formState} className="et-cta">Foto schicken & Angebot holen <ArrowRight size={16} /></Link>
        <p className="et-note">Unverbindlich · Einschätzung meist in 1–2 Werktagen</p>

        <section className="et-sec">
          <h2>Typische Teile</h2>
          <div className="et-chips">{PARTS.map((p) => <span key={p} className="et-chip">{p}</span>)}</div>
        </section>

        <section className="et-sec">
          <h2>So läuft's ab</h2>
          <div className="et-steps">
            {[
              ["1", "Foto & Maße schicken", "Übers Formular – mit Fotos, ein paar Maßen und wofür das Teil ist."],
              ["2", "Nachkonstruktion & Angebot", "Wir schauen uns das Teil an und schicken dir Preis und Lieferzeit."],
              ["3", "Druck & Versand", "Passt alles, drucken wir dein Ersatzteil und schicken es dir zu."],
            ].map(([n, t, d]) => (
              <div key={n} className="et-step">
                <span className="et-step-n">{n}</span>
                <span><span className="et-step-t">{t}</span><span className="et-step-d">{d}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="et-sec">
          <h2>So helfen uns deine Fotos am meisten</h2>
          <div className="et-tips">
            {TIPS.map(([Icon, t, d]) => (
              <div key={t} className="et-tip">
                <span className="et-tip-i"><Icon size={18} /></span>
                <span><b>{t}</b><span>{d}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="et-sec">
          <h2>Das richtige Material</h2>
          <div className="et-mat">{MATERIALS.map(([m, d]) => <div key={m}><b>{m}</b><span>{d}</span></div>)}</div>
          <p className="et-note">Nicht sicher? Kein Problem – wir empfehlen dir das passende Material im Angebot.</p>
        </section>

        {refs.length > 0 && (
          <section className="et-sec">
            <h2>Schon nachgedruckt</h2>
            <div className="et-refs">
              {refs.map((p) => (
                <div key={p.id} className="et-ref">
                  <img src={p.images[0]} alt={p.name} loading="lazy" />
                  <p>{p.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="et-sec">
          <div className="et-limit">
            <ShieldAlert size={20} color="#A85A32" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              <b style={{ color: "#2B2E4A" }}>Was wir nicht nachdrucken:</b> sicherheitsrelevante Teile wie Bremsen, Lenkung,
              Gurte oder Kindersitze, und Teile, an denen Gas oder Netzstrom hängt. Da gehört ein Originalteil hin.
            </span>
          </div>
        </section>

        <section className="et-sec">
          <h2>Häufige Fragen</h2>
          <div className="et-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        <div className="et-end">
          <div>
            <p className="t">Teil kaputt?</p>
            <p className="d"><Check size={14} style={{ verticalAlign: -2 }} /> Foto genügt für den Anfang</p>
          </div>
          <Link to={toForm} state={formState} className="et-cta">Jetzt anfragen <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  );
}
