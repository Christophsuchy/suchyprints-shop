import { Layers, Home, Cog, Gamepad2, Wand2 } from "lucide-react";

// Solange false, zeigt der Shop oben den Hinweis "Shop startet bald".
// Zum offiziellen Start einfach auf true setzen.
export const SHOP_OPEN = false;

// Farbauswahl für Fidgets – Reihenfolge = Anzeige im Shop. css darf auch ein Verlauf sein.
export const FIDGET_COLORS = [
  { id: "schwarz", label: "Schwarz", css: "#1d1d1f" },
  { id: "weiss", label: "Weiß", css: "#f5f5f2" },
  { id: "grau", label: "Grau", css: "#8a8d91" },
  { id: "dunkelblau", label: "Dunkelblau", css: "#1f3a7a" },
  { id: "hellblau", label: "Hellblau", css: "#7cc4f0" },
  { id: "gruen", label: "Grün", css: "#2e9e5b" },
  { id: "gelb", label: "Gelb", css: "#f5cf2d" },
  { id: "orange", label: "Orange", css: "#f07c1e" },
  { id: "rot", label: "Rot", css: "#d23a32" },
  { id: "rosa", label: "Rosa", css: "#f2a3c4" },
  { id: "blau-lila", label: "Blau/Lila (2-färbig)", css: "linear-gradient(135deg, #2f6fed 50%, #8a4fd8 50%)" },
  { id: "regenbogen", label: "Regenbogen", css: "conic-gradient(#e53935, #fb8c00, #fdd835, #43a047, #1e88e5, #8e24aa, #e53935)" },
];

// Einfarbige Auswahl für personalisierte Produkte (ohne Verläufe)
export const SOLID_COLORS = FIDGET_COLORS.filter((c) => !c.css.includes("gradient"));

// Schriftarten für die Live-Vorschau personalisierter Produkte
export const PERSONALIZE_FONTS = [
  { id: "modern", label: "Modern", css: "'Space Grotesk', sans-serif", weight: 700, width: 0.6 },
  { id: "klar", label: "Klar", css: "'Inter', sans-serif", weight: 600, width: 0.58 },
  { id: "technisch", label: "Technisch", css: "'JetBrains Mono', monospace", weight: 500, width: 0.62 },
];

// Warenkorb-Schlüssel: Produkt-ID plus gewählte Farben, z.B. "p23|schwarz" oder "p25|rot|gelb".
// Personalisierte Produkte hängen Wunschtext (t:), Schrift (f:) und Zusatzangabe (x:) an, z.B. "p15|rot|t:Anna|f:modern".
// Spruch-Vorschläge fürs Schlüsselbrett (Kunde kann auch eigenen Spruch schreiben)
// names: true = enthält Beispielnamen, die der Kunde im Feld ändern soll
export const KEYBOARD_SAYINGS = [
  { group: "Steirisch", items: [{ text: "Hoam is, wo de Schlüssel hängan" }, { text: "Ned suachn – do hängans" }] },
  { group: "Pärchen", items: [{ text: "Anna & Max – unsere Schlüssel", names: true }, { text: "Zwei Herzen, ein Schlüsselbrett" }] },
  { group: "Familie", items: [{ text: "Familie Huber – alle Schlüssel hier!", names: true }, { text: "Jeder Schlüssel hat sein Platzerl" }] },
  { group: "Lustig", items: [{ text: "Schlüssel hier – Ausreden woanders" }, { text: "Bevor du fragst: Sie hängen hier." }] },
];

export const cartKey = (id, colors = [], opts = {}) => {
  const parts = [id, ...colors];
  if (opts.text) parts.push("t:" + encodeURIComponent(opts.text));
  if (opts.font) parts.push("f:" + opts.font);
  if (opts.extra) parts.push("x:" + encodeURIComponent(opts.extra));
  return parts.join("|");
};
export const parseCartKey = (key) => {
  const [id, ...rest] = String(key).split("|");
  const colors = [];
  let text = "", font = "", extra = "";
  for (const part of rest) {
    if (part.startsWith("t:")) text = safeDecode(part.slice(2));
    else if (part.startsWith("f:")) font = part.slice(2);
    else if (part.startsWith("x:")) extra = safeDecode(part.slice(2));
    else colors.push(part);
  }
  return { id, colors, text, font, extra };
};
function safeDecode(v) {
  try { return decodeURIComponent(v); } catch { return v; }
}
export const personalizeLabel = (product, { text, font, extra }) => {
  if (!product?.personalize || !text) return "";
  if (product.personalize.type === "plantmarkers") return `Pflanzenstecker: ${text}`;
  if (product.personalize.type === "keyboard") return `Spruch „${text}“`;
  if (product.personalize.type === "housesign") return `Hausnummer ${extra || "?"} · „Familie ${text}“`;
  const f = PERSONALIZE_FONTS.find((x) => x.id === font);
  const bits = [`„${text}“`];
  if (f) bits.push(`Schrift ${f.label}`);
  if (extra && product.personalize.extraLabel) bits.push(`${product.personalize.extraLabel}: ${extra}`);
  return bits.join(" · ");
};
export const colorLabel = (product, colorId) =>
  (product?.colors || []).find((c) => c.id === colorId)?.label || colorId;

export const CATEGORIES = [
  { id: "alle", label: "Alle", icon: Layers },
  { id: "deko", label: "Deko", icon: Home },
  { id: "technik", label: "Technik", icon: Cog },
  { id: "spielzeug", label: "Spielzeug", icon: Gamepad2 },
  { id: "individuell", label: "Individuell", icon: Wand2 },
  { id: "referenz", label: "Kundenprojekt (Galerie auf der Anfrage-Seite)", icon: Wand2 },
];

// Bereiche im Shop:
// - Kundenprojekte (category "referenz") erscheinen nur als Beispielbilder auf der Anfrage-Seite
// - Dienstleistungen (category "individuell" ohne Personalisierung, z. B. Ersatzteil) laufen über das Anfrage-Formular
// - alles andere sind bestellbare Produkte, personalisierbare eingeschlossen
export const isReference = (p) => p?.category === "referenz";

// Fest eingebaute Kundenprojekte (zusätzlich zu denen aus dem Dashboard, erscheinen zuerst)
export const STATIC_REFERENCES = [
  {
    id: "ref-handgas-traktor",
    category: "referenz",
    name: "Handgas-Griff für Traktor – Ersatzteil",
    description: "Der Griff vom Handgashebel war kaputt und als Ersatzteil nicht mehr zu bekommen. Nach Maß nachkonstruiert und aus TPU gedruckt – das ist flexibel und griffig, fühlt sich also fast wie Gummi an. Sitzt wie das Original und hält im Alltag.",
    images: ["/referenzen/handgas-traktor-1.webp", "/referenzen/handgas-traktor-2.webp", "/referenzen/handgas-traktor-3.webp"],
    static: true,
  },
];
export const isService = (p) => p?.category === "individuell" && !p?.personalize;
export const isShopProduct = (p) => !!p && !isReference(p) && !isService(p);

export const MATERIALS = {
  PLA: { label: "PLA", color: "#FF6A13" },
  PETG: { label: "PETG", color: "#2F6FED" },
  TPU: { label: "TPU (flexibel)", color: "#1D9E75" },
};

// Startsortiment – einfach weitere Objekte in dieses Array einfügen, es gibt kein festes Limit.
// inStock: false blendet den Kaufen-Button aus und zeigt "Ausverkauft".
// colors / colorCount: Farbauswahl auf der Produktseite (colorCount 2 = zwei Farben wählen, z.B. für Sets).
// images: [...] zeigt echte Fotos statt Illustration, video: { mp4, webm, poster } eine Endlos-Animation auf der Produktseite.
// comingSoon: true (zusammen mit inStock: false) zeigt stattdessen "Bald verfügbar" – für Produkte in Entwicklung.
export const PRODUCTS = [
  { id: "p1", name: "Geometrische Vase, klein", category: "deko", material: "PLA", price: 14.9, hue: "#FF6A13", tag: "aktion", inStock: false, comingSoon: true, description: "Schlichte, facettierte Vase im geometrischen Stil – ein dezenter Blickfang für Trockenblumen oder als Deko-Objekt allein. Wasserdicht bei Verwendung von PLA nur bedingt, daher am besten für trockene Deko." },
  { id: "p2", name: "Wandregal-Winkel", category: "deko", material: "PETG", price: 12.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Schlichter Regalwinkel aus robustem PETG für kleine Wandregale und Deko-Bretter. Montagematerial (Schrauben, Dübel) ist nicht enthalten." },
  { id: "p3", name: "Teelicht-Set, 3 Stück", category: "deko", material: "PETG", price: 15.0, hue: "#2F6FED", tag: "beliebt", inStock: false, comingSoon: true, description: "Drei geometrische Teelichthalter im Set, je ca. 6 cm Durchmesser. Sorgen für ein schönes Lichtspiel an der Wand. Für Teelichter in Alu-Hülle oder LED-Teelichter – Kerzen bitte nie unbeaufsichtigt brennen lassen." },
  { id: "p6", name: "Werkzeug-Organizer", category: "technik", material: "PLA", price: 22.0, hue: "#FF6A13", tag: "neu", inStock: false, comingSoon: true, description: "Modularer Organizer für kleines Werkzeug und Schrauben, stapelbar und mit beschriftbaren Fächern." },
  { id: "p9", name: "Beweglicher Drache (Fidget)", category: "spielzeug", material: "TPU", price: 19.0, hue: "#1D9E75", tag: "beliebt", inStock: false, comingSoon: true, description: "Beweglich gedruckter Fidget-Drache, ganz ohne Zusammenbau – jedes Gelenk wird direkt mitgedruckt." },
  { id: "p11", name: "Schachfiguren-Set", category: "deko", material: "PLA", price: 34.0, hue: "#FF6A13", tag: "neu", inStock: false, comingSoon: true, description: "Komplettes Schachfiguren-Set in modernem, geometrischem Design, passend für Standard-Schachbretter." },
  { id: "p12", name: "Handy-Ständer, klappbar", category: "technik", material: "PETG", price: 9.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Klappbarer Handyständer für den Schreibtisch, passt zusammengeklappt in jede Tasche." },
  { id: "p13", name: "Stiftehalter mit Namen", category: "individuell", material: "PLA", price: 7.5, hue: "#1D9E75", inStock: false, comingSoon: true, description: "Sechseckiger Stiftehalter für den Schreibtisch – mit deinem Namen oder einem kurzen Text. Tipp deinen Wunschtext ein und sieh sofort, wie er aussieht.",
    colors: SOLID_COLORS, colorCount: 1, personalize: { type: "penholder", label: "Wunschtext", maxLength: 12 } },
  { id: "p14", name: "Seifenschale mit Ablauf", category: "deko", material: "PETG", price: 6.5, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Ovale Seifenschale mit integrierten Ablauflöchern, damit die Seife nicht in der Nässe liegt." },
  { id: "p15", name: "Schlüsselanhänger, personalisiert", category: "individuell", material: "PLA", price: 4.5, hue: "#D4537E", inStock: false, comingSoon: true, description: "Runder Schlüsselanhänger mit deinem Wunschnamen oder Kürzel. Tipp den Namen ein und sieh sofort, wie er aussieht.",
    colors: SOLID_COLORS, colorCount: 1, personalize: { type: "keychain", label: "Name oder Kürzel", maxLength: 10 } },
  { id: "p16", name: "Blumentopf mit integrierter Untertasse", category: "deko", material: "PETG", price: 16.0, hue: "#1D9E75", tag: "neu", inStock: false, comingSoon: true, description: "Geometrischer Blumentopf mit passgenau integrierter Untertasse – kein separates Tablett nötig, sauberer Look fürs Fensterbrett. Wasserfest durch PETG." },
  { id: "p17", name: "Spiral-Vase, Vase-Mode", category: "deko", material: "PLA", price: 13.5, hue: "#FF6A13", tag: "beliebt", inStock: false, comingSoon: true, description: "Im sogenannten „Vase Mode” gedruckt – eine einzige durchgehende Wand ohne Absätze, wirkt dadurch fast wie gedrehte Keramik. Für trockene Deko, nicht wasserdicht." },
  { id: "p18", name: "Kopfhörer-Ständer, geometrisch", category: "technik", material: "PLA", price: 14.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Facettierter Kopfhörer-Ständer für den Schreibtisch, standfest durch breiten Sockel. Passt für die meisten Over-Ear-Kopfhörer." },
  { id: "p19", name: "Napf-Untersteller mit Tiernamen", category: "individuell", material: "PETG", price: 19.0, hue: "#D4537E", tag: "neu", inStock: false, comingSoon: true, description: "Untersteller für Edelstahlnäpfe, mit dem Namen deines Tieres vorne eingelassen. Tipp den Namen ein, sieh dir die Vorschau an und gib den Durchmesser deines Napfs an.",
    colors: SOLID_COLORS, colorCount: 1, personalize: { type: "bowl", label: "Name deines Tieres", maxLength: 12, extraLabel: "Napf-Ø oben (cm)", extraPlaceholder: "z. B. 16" } },
  { id: "p20", name: "Namensschild, personalisiert", category: "individuell", material: "PLA", price: 9.0, hue: "#FF6A13", inStock: false, comingSoon: true, description: "Personalisiertes Namensschild – für Tür, Regal oder als Geschenk. Tipp deinen Wunschnamen ein und sieh sofort, wie er aussieht. Optional mit LED-Hinterleuchtung gegen Aufpreis (einfach anfragen).",
    colors: SOLID_COLORS, colorCount: 1, personalize: { type: "nameplate", label: "Wunschname", maxLength: 16 } },
  { id: "p22", name: "Infinity-Würfel (Fidget)", category: "spielzeug", material: "PLA", price: 12.0, hue: "#FF6A13", tag: "neu", inStock: false, comingSoon: true, description: "Acht Würfel, verbunden durch mitgedruckte Gelenke – lässt sich endlos in sich selbst falten. Der perfekte Fidget für den Schreibtisch. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
  { id: "p23", name: "Zahnrad-Fidget", category: "spielzeug", material: "PLA", price: 9.9, hue: "#2F6FED", inStock: false, comingSoon: true,
    colors: FIDGET_COLORS, colorCount: 1,
    images: ["/products/zahnrad-fidget-1.webp", "/products/zahnrad-fidget-2.webp", "/products/zahnrad-fidget-3.webp"],
    video: { mp4: "/products/zahnrad-fidget-spin.mp4", webm: "/products/zahnrad-fidget-spin.webm", poster: "/products/zahnrad-fidget-spin-poster.webp" },
    description: "Zahnräder zum Drehen für zwischendurch: Ein gezahnter Ring, ein Rad in der Mitte und vier kleine Zahnräder greifen ineinander – dreh die Mitte und alles läuft mit. Herrlich beruhigend und in einem Stück gedruckt, ganz ohne Zusammenbau. Ø 60 mm, 10 mm hoch. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
  { id: "p25", name: "Zahnrad-Fidget 2er-Set", category: "spielzeug", material: "PLA", price: 17.9, hue: "#2F6FED", tag: "neu", inStock: false, comingSoon: true,
    colors: FIDGET_COLORS, colorCount: 2,
    images: ["/products/zahnrad-fidget-1.webp", "/products/zahnrad-fidget-2.webp", "/products/zahnrad-fidget-3.webp"],
    video: { mp4: "/products/zahnrad-fidget-spin.mp4", webm: "/products/zahnrad-fidget-spin.webm", poster: "/products/zahnrad-fidget-spin-poster.webp" },
    description: "Zwei Zahnrad-Fidgets in deinen Wunschfarben – eins für dich, eins zum Verschenken (oder einfach zwei zum Abwechseln). Jedes in einem Stück gedruckt, ganz ohne Zusammenbau. Ø 60 mm, 10 mm hoch. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
  { id: "p24", name: "Fidget-Spinner", category: "spielzeug", material: "PLA", price: 11.0, hue: "#D4537E", inStock: false, comingSoon: true, description: "Klassischer Fidget-Spinner in eigenem SuchyPrints-Design, mit Kugellager für lange, ruhige Drehungen. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
  { id: "p26", name: "Hausnummer-Schild, personalisiert", category: "individuell", material: "PETG", price: 24.99, hue: "#3A3C42", tag: "neu", inStock: false, comingSoon: true,
    colors: SOLID_COLORS, colorCount: 2, personalize: { type: "housesign", label: "Familienname", maxLength: 18, extraLabel: "Hausnummer", extraPlaceholder: "z. B. 12 oder 7b" },
    description: "Dein Hausnummer-Schild im modernen Design: große Hausnummer, feiner Trennstrich und darunter „Familie“ mit eurem Namen. Gib Nummer und Namen ein und sieh sofort die Vorschau. Zweifarbig gedruckt (Platte + Schrift) aus wetterfestem PETG – ideal für Hauswand, Zaun oder Briefkasten." },
  { id: "p21", name: "Ersatzteil nach Foto oder Maß", category: "individuell", material: "PLA", price: 12.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Ein Teil kaputt und nicht mehr erhältlich? Schick uns ein Foto und die Maße – wir modellieren und drucken dir einen passenden Ersatz. Preis ist ein Richtwert und hängt vom Aufwand ab, wir melden uns vorab mit einem konkreten Angebot." },
];

export const TAG_LABELS = {
  aktion: { label: "Aktion", bg: "linear-gradient(135deg, var(--accent-soft), var(--accent-dark))", color: "#fff" },
  neu: { label: "Neu", bg: "var(--ink)", color: "#fff" },
  beliebt: { label: "Beliebt", bg: "#fff", color: "var(--ink)" },
};

// Beispiel-Rabattcodes – hier einfach eigene Codes eintragen/ändern (Wert = Rabatt in Prozent, z.B. 0.1 = 10%)
export const DISCOUNT_CODES = {
  WILLKOMMEN10: 0.10,
  SUCHY15: 0.15,
};

export const FAQS = [
  {
    q: "Wohin versendet ihr und was kostet der Versand?",
    a: "Wir versenden nach Österreich (4,90 €, gratis ab 50 €) und Deutschland (12,90 €, gratis ab 80 €). Innerhalb der EU fallen keine Zollgebühren an. Andere Länder auf Anfrage über das Kontaktformular.",
  },
  {
    q: "Wie lange dauert die Herstellung?",
    a: "Die meisten Produkte werden innerhalb von 2–4 Werktagen gedruckt und versendet. Bei individuellen Anfragen kann es je nach Auslastung etwas länger dauern – du bekommst aber immer vorab eine Einschätzung.",
  },
  {
    q: "Welches Material wird verwendet?",
    a: "Je nach Produkt kommt PLA, PETG oder flexibles TPU zum Einsatz. Die Materialangabe findest du direkt bei jedem Produkt.",
  },
  {
    q: "Kann ich ein eigenes Design drucken lassen?",
    a: "Klar! Schick uns dein Modell (z. B. als STL-Datei) oder deine Idee über die Kategorie „Individuell” – wir kalkulieren Material, Zeit und Preis für dich.",
  },
  {
    q: "Wie pflege ich meine 3D-gedruckten Objekte?",
    a: "Am besten mit einem feuchten Tuch abwischen. PLA-Objekte sollten nicht dauerhaft direkter Sonne oder Hitze über 50°C ausgesetzt werden, da sie sich sonst verformen können.",
  },
];

export function formatPrice(n) {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// Versand – Länder und Preise (hier anpassen)
export const SHIPPING_RATES = {
  AT: { label: "Österreich", cost: 4.9, freeFrom: 50, days: "2–4 Werktage" },
  DE: { label: "Deutschland", cost: 12.9, freeFrom: 80, days: "4–7 Werktage" },
};
