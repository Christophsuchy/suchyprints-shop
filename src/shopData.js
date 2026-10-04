import { Layers, Home, Cog, Gamepad2, Wand2 } from "lucide-react";

// Solange false, zeigt der Shop oben den Hinweis "Shop startet bald".
// Zum offiziellen Start einfach auf true setzen.
export const SHOP_OPEN = false;

export const CATEGORIES = [
  { id: "alle", label: "Alle", icon: Layers },
  { id: "deko", label: "Deko", icon: Home },
  { id: "technik", label: "Technik", icon: Cog },
  { id: "spielzeug", label: "Spielzeug", icon: Gamepad2 },
  { id: "individuell", label: "Individuell", icon: Wand2 },
];

export const MATERIALS = {
  PLA: { label: "PLA", color: "#FF6A13" },
  PETG: { label: "PETG", color: "#2F6FED" },
  TPU: { label: "TPU (flexibel)", color: "#1D9E75" },
};

// Startsortiment – einfach weitere Objekte in dieses Array einfügen, es gibt kein festes Limit.
// inStock: false blendet den Kaufen-Button aus und zeigt "Ausverkauft".
// images: [...] zeigt echte Fotos statt Illustration, video: { mp4, webm, poster } eine Endlos-Animation auf der Produktseite.
// comingSoon: true (zusammen mit inStock: false) zeigt stattdessen "Bald verfügbar" – für Produkte in Entwicklung.
export const PRODUCTS = [
  { id: "p1", name: "Geometrische Vase, klein", category: "deko", material: "PLA", price: 14.9, originalPrice: 18.5, hue: "#FF6A13", tag: "aktion", inStock: false, comingSoon: true, description: "Schlichte, facettierte Vase im geometrischen Stil – ein dezenter Blickfang für Trockenblumen oder als Deko-Objekt allein. Wasserdicht bei Verwendung von PLA nur bedingt, daher am besten für trockene Deko." },
  { id: "p2", name: "Wandregal-Winkel", category: "deko", material: "PETG", price: 12.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Schlichter Regalwinkel aus robustem PETG für kleine Wandregale und Deko-Bretter. Montagematerial (Schrauben, Dübel) ist nicht enthalten." },
  { id: "p3", name: "Teelicht-Set, 3 Stück", category: "deko", material: "PETG", price: 15.0, hue: "#2F6FED", tag: "beliebt", inStock: false, comingSoon: true, description: "Drei geometrische Teelichthalter im Set, je ca. 6 cm Durchmesser. Sorgen für ein schönes Lichtspiel an der Wand. Für Teelichter in Alu-Hülle oder LED-Teelichter – Kerzen bitte nie unbeaufsichtigt brennen lassen." },
  { id: "p6", name: "Werkzeug-Organizer", category: "technik", material: "PLA", price: 22.0, hue: "#FF6A13", tag: "neu", inStock: false, comingSoon: true, description: "Modularer Organizer für kleines Werkzeug und Schrauben, stapelbar und mit beschriftbaren Fächern." },
  { id: "p9", name: "Beweglicher Drache (Fidget)", category: "spielzeug", material: "TPU", price: 19.0, hue: "#1D9E75", tag: "beliebt", inStock: false, comingSoon: true, description: "Beweglich gedruckter Fidget-Drache, ganz ohne Zusammenbau – jedes Gelenk wird direkt mitgedruckt." },
  { id: "p11", name: "Schachfiguren-Set", category: "deko", material: "PLA", price: 34.0, hue: "#FF6A13", tag: "neu", inStock: false, comingSoon: true, description: "Komplettes Schachfiguren-Set in modernem, geometrischem Design, passend für Standard-Schachbretter." },
  { id: "p12", name: "Handy-Ständer, klappbar", category: "technik", material: "PETG", price: 9.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Klappbarer Handyständer für den Schreibtisch, passt zusammengeklappt in jede Tasche." },
  { id: "p13", name: "Stiftehalter mit Namen", category: "individuell", material: "PLA", price: 7.5, hue: "#1D9E75", inStock: false, comingSoon: true, description: "Sechseckiger Stiftehalter für den Schreibtisch – auf Wunsch mit deinem Namen oder einem kurzen Text. Wunschtext bitte bei der Bestellung angeben." },
  { id: "p14", name: "Seifenschale mit Ablauf", category: "deko", material: "PETG", price: 6.5, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Ovale Seifenschale mit integrierten Ablauflöchern, damit die Seife nicht in der Nässe liegt." },
  { id: "p15", name: "Schlüsselanhänger, personalisiert", category: "individuell", material: "PLA", price: 4.5, hue: "#D4537E", inStock: false, comingSoon: true, description: "Runder Schlüsselanhänger mit deinem Wunschnamen oder Kürzel. Wunschtext bitte bei der Bestellung angeben." },
  { id: "p16", name: "Blumentopf mit integrierter Untertasse", category: "deko", material: "PETG", price: 16.0, hue: "#1D9E75", tag: "neu", inStock: false, comingSoon: true, description: "Geometrischer Blumentopf mit passgenau integrierter Untertasse – kein separates Tablett nötig, sauberer Look fürs Fensterbrett. Wasserfest durch PETG." },
  { id: "p17", name: "Spiral-Vase, Vase-Mode", category: "deko", material: "PLA", price: 13.5, hue: "#FF6A13", tag: "beliebt", inStock: false, comingSoon: true, description: "Im sogenannten „Vase Mode” gedruckt – eine einzige durchgehende Wand ohne Absätze, wirkt dadurch fast wie gedrehte Keramik. Für trockene Deko, nicht wasserdicht." },
  { id: "p18", name: "Kopfhörer-Ständer, geometrisch", category: "technik", material: "PLA", price: 14.0, hue: "#2F6FED", inStock: false, comingSoon: true, description: "Facettierter Kopfhörer-Ständer für den Schreibtisch, standfest durch breiten Sockel. Passt für die meisten Over-Ear-Kopfhörer." },
  { id: "p19", name: "Napf-Untersteller mit Tiernamen", category: "individuell", material: "PETG", price: 19.0, hue: "#D4537E", tag: "neu", inStock: false, comingSoon: true, description: "Untersteller für Edelstahlnäpfe, mit dem Namen deines Tieres vorne eingelassen. Bitte bei der Bestellung den gewünschten Namen sowie den Durchmesser deines Napfs angeben." },
  { id: "p20", name: "Namensschild, personalisiert", category: "individuell", material: "PLA", price: 9.0, hue: "#FF6A13", inStock: false, comingSoon: true, description: "Personalisiertes Namensschild – für Tür, Regal oder als Geschenk. Wunschname bitte bei der Bestellung angeben, optional mit LED-Hinterleuchtung gegen Aufpreis (einfach anfragen)." },
  { id: "p22", name: "Infinity-Würfel (Fidget)", category: "spielzeug", material: "PLA", price: 12.0, hue: "#FF6A13", tag: "neu", inStock: false, comingSoon: true, description: "Acht Würfel, verbunden durch mitgedruckte Gelenke – lässt sich endlos in sich selbst falten. Der perfekte Fidget für den Schreibtisch. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
  { id: "p23", name: "Zahnrad-Fidget", category: "spielzeug", material: "PLA", price: 9.5, hue: "#2F6FED", inStock: false, comingSoon: true,
    images: ["/products/zahnrad-fidget-1.webp", "/products/zahnrad-fidget-2.webp", "/products/zahnrad-fidget-3.webp"],
    video: { mp4: "/products/zahnrad-fidget-spin.mp4", webm: "/products/zahnrad-fidget-spin.webm", poster: "/products/zahnrad-fidget-spin-poster.webp" },
    description: "Zahnräder zum Drehen für zwischendurch: Ein gezahnter Ring, ein Rad in der Mitte und vier kleine Zahnräder greifen ineinander – dreh die Mitte und alles läuft mit. Herrlich beruhigend und in einem Stück gedruckt, ganz ohne Zusammenbau. Ø 60 mm, 10 mm hoch. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
  { id: "p24", name: "Fidget-Spinner", category: "spielzeug", material: "PLA", price: 11.0, hue: "#D4537E", inStock: false, comingSoon: true, description: "Klassischer Fidget-Spinner in eigenem SuchyPrints-Design, mit Kugellager für lange, ruhige Drehungen. Enthält Kleinteile, nicht für Kinder unter 3 Jahren geeignet." },
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
