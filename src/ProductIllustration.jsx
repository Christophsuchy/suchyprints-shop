import React from "react";

// Einfache Linien-Illustrationen pro Produkt-ID, passend zum Logo-Stil des Shops.
// Werden über die Farbfläche gelegt, um die Objektform anzudeuten (keine echten Fotos).
const PATHS = {
  p1: ( // Geometrische Vase
    <>
      <path d="M38 20 L62 20 L58 45 L64 85 Q50 92 36 85 L42 45 Z" />
      <line x1="42" y1="45" x2="58" y2="45" />
    </>
  ),
  p2: ( // Wandregal-Halterung (L-Winkel)
    <>
      <path d="M25 30 L25 75 L75 75" />
      <path d="M25 30 L40 30 L40 60 L75 60 L75 75" />
    </>
  ),
  p3: ( // Teelicht-Set
    <>
      <circle cx="32" cy="65" r="16" />
      <circle cx="62" cy="70" r="13" />
      <circle cx="48" cy="45" r="11" />
      <path d="M48 30 Q44 36 48 40 Q52 36 48 30 Z" fill="currentColor" />
    </>
  ),
  p4: ( // Kabelclip-Set
    <>
      <path d="M30 50 Q30 30 50 30 Q70 30 70 50" />
      <path d="M25 55 Q50 75 75 55" strokeDasharray="2 6" />
      <circle cx="30" cy="50" r="4" fill="currentColor" />
      <circle cx="70" cy="50" r="4" fill="currentColor" />
    </>
  ),
  p5: ( // Lüfterhalterung
    <>
      <rect x="25" y="25" width="50" height="50" rx="6" />
      <circle cx="50" cy="50" r="16" />
      <path d="M50 34 Q58 42 50 50 Q42 58 50 66 Q58 58 50 50 Q42 42 50 34" fill="currentColor" />
      <circle cx="30" cy="30" r="2.5" fill="currentColor" />
      <circle cx="70" cy="30" r="2.5" fill="currentColor" />
      <circle cx="30" cy="70" r="2.5" fill="currentColor" />
      <circle cx="70" cy="70" r="2.5" fill="currentColor" />
    </>
  ),
  p6: ( // Werkzeug-Organizer
    <>
      <rect x="20" y="30" width="60" height="45" rx="4" />
      <line x1="40" y1="30" x2="40" y2="75" />
      <line x1="60" y1="30" x2="60" y2="75" />
      <line x1="20" y1="52" x2="80" y2="52" />
    </>
  ),
  p7: ( // Ersatz-Scharnier
    <>
      <rect x="18" y="40" width="28" height="20" rx="3" />
      <rect x="54" y="40" width="28" height="20" rx="3" />
      <circle cx="50" cy="50" r="6" />
    </>
  ),
  p8: ( // Stapelbares Puzzle-Set
    <>
      <path d="M25 25 h25 v10 a7 7 0 0 1 0 14 v11 h-25 v-25 a7 7 0 0 0 0 -10 z" />
      <path d="M50 25 h25 v25 h-11 a7 7 0 0 0 0 14 h11 v11 h-25 z" transform="translate(0,0)" />
    </>
  ),
  p9: ( // Beweglicher Fidget-Drache
    <>
      <path d="M20 65 Q30 45 45 50 Q55 53 60 42 L68 30 L65 42 L75 38 L66 48 Q58 62 45 60 Q32 58 20 65 Z" />
      <circle cx="63" cy="36" r="2" fill="currentColor" />
    </>
  ),
  p10: ( // Mini-Katapult
    <>
      <path d="M22 75 L78 75" />
      <path d="M30 75 L30 55 L50 75" />
      <line x1="50" y1="35" x2="50" y2="75" />
      <line x1="42" y1="40" x2="58" y2="40" />
      <circle cx="65" cy="30" r="5" />
    </>
  ),
  p11: ( // Schachfiguren-Set
    <>
      <path d="M42 78 h16 v-6 h-16 z" />
      <path d="M45 72 h10 l-2 -30 h-6 z" />
      <circle cx="50" cy="34" r="7" />
    </>
  ),
  p12: ( // Handy-Ständer
    <>
      <rect x="38" y="20" width="24" height="42" rx="4" />
      <path d="M30 75 L70 75 L60 55 L40 55 Z" />
    </>
  ),
  p13: ( // Stiftehalter sechseckig
    <>
      <path d="M50 22 L72 35 L72 62 L50 75 L28 62 L28 35 Z" />
      <line x1="42" y1="40" x2="42" y2="15" />
      <line x1="50" y1="40" x2="50" y2="10" />
      <line x1="58" y1="40" x2="58" y2="17" />
    </>
  ),
  p14: ( // Seifenschale mit Ablauf
    <>
      <ellipse cx="50" cy="52" rx="30" ry="16" />
      <circle cx="40" cy="50" r="2" fill="currentColor" />
      <circle cx="50" cy="52" r="2" fill="currentColor" />
      <circle cx="60" cy="50" r="2" fill="currentColor" />
    </>
  ),
  p15: ( // Schlüsselanhänger rund
    <>
      <circle cx="50" cy="58" r="20" />
      <circle cx="50" cy="30" r="7" fill="none" />
    </>
  ),
  p16: ( // Blumentopf mit Untertasse
    <>
      <path d="M38 30 L62 30 L57 65 L43 65 Z" />
      <ellipse cx="50" cy="72" rx="26" ry="7" />
    </>
  ),
  p17: ( // Spiral-Vase
    <>
      <path d="M40 22 Q30 45 40 60 Q50 75 40 88" />
      <path d="M60 22 Q70 45 60 60 Q50 75 60 88" />
      <path d="M40 22 Q50 18 60 22" />
    </>
  ),
  p18: ( // Kopfhörer-Ständer
    <>
      <path d="M28 45 Q28 20 50 20 Q72 20 72 45" />
      <path d="M24 45 h10 v18 h-10 z" />
      <path d="M66 45 h10 v18 h-10 z" />
      <line x1="50" y1="63" x2="50" y2="80" />
      <line x1="35" y1="80" x2="65" y2="80" />
    </>
  ),
  p19: ( // Napf-Untersteller mit Tiernamen
    <>
      <rect x="20" y="60" width="60" height="14" rx="6" />
      <circle cx="37" cy="55" r="15" />
      <circle cx="63" cy="55" r="15" />
      <line x1="30" y1="68" x2="70" y2="68" strokeDasharray="2 5" />
    </>
  ),
  p20: ( // Namensschild personalisiert
    <>
      <rect x="20" y="35" width="60" height="30" rx="5" />
      <line x1="30" y1="46" x2="70" y2="46" />
      <line x1="30" y1="54" x2="55" y2="54" />
    </>
  ),
  p21: ( // Ersatzteil nach Foto/Maß
    <>
      <path d="M42 25 a12 12 0 1 0 0.1 0 Z" />
      <path d="M50 13 v8 M50 79 v8 M13 50 h8 M79 50 h8 M22 22 l6 6 M72 22 l-6 6 M22 78 l6 -6 M72 78 l-6 -6" />
    </>
  ),
};

export default function ProductIllustration({ id, size = 100, color = "#ffffff", opacity = 0.9 }) {
  const content = PATHS[id];
  if (!content) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      color={color}
      style={{ opacity }}
    >
      {content}
    </svg>
  );
}
