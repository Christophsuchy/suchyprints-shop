import React, { useEffect, useState } from "react";
import { PERSONALIZE_FONTS } from "./shopData";

// Live-Vorschau für personalisierte Produkte (vereinfachte Darstellung als SVG)
function shade(hex, f) {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}
function isLight(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

function FitText({ text, x, y, maxWidth, maxSize, font, fill, rotate }) {
  const len = Math.max(1, text.length);
  const size = Math.min(maxSize, maxWidth / (len * font.width));
  return (
    <text
      x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontFamily={font.css} fontWeight={font.weight} fontSize={size} fill={fill}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ letterSpacing: font.id === "technisch" ? 0 : "0.01em" }}
    >
      {text}
    </text>
  );
}

// ---------- Hausnummer-Schild „Modern“ (gleiches Layout wie der STL-Generator schild.py) ----------
let _ctx = null;
function textW(txt, weight, sizeMm, tracking = 0) {
  if (typeof document === "undefined") return txt.length * sizeMm * 0.6;
  if (!_ctx) _ctx = document.createElement("canvas").getContext("2d");
  _ctx.font = `${weight} ${sizeMm * 1.38 * 10}px Poppins`;
  return _ctx.measureText(txt).width / 10 + tracking * Math.max(0, txt.length - 1);
}
export function houseSignLayout(nr, name, top = "FAMILIE", WMAX = 250) {
  let nrSize = 62, nameSize = 17, need = 0, nw = 0, ok = true;
  for (let i = 0; i < 80; i++) {
    nw = textW(nr, 700, nrSize);
    const mw = textW(name, 500, nameSize), tw = textW(top, 300, 8, 1.2);
    need = 20 + nw + 14 + 1.6 + 11 + Math.max(mw, tw) + 20;
    if (need <= WMAX) break;
    if (nameSize > 11) nameSize *= 0.97;
    else if (nrSize > 34) nrSize *= 0.97;
    else if (nameSize > 10) nameSize *= 0.97;
    else { ok = false; break; }
  }
  const W = Math.max(150, Math.min(WMAX, need));
  const xn = -W / 2 + 20 + nw / 2, xd = -W / 2 + 20 + nw + 14, xr = xd + 1.6 + 11;
  return { W, H: 100, nrSize, nameSize, xn, xd, xr, ok: ok && need <= WMAX + 0.5 };
}

function HouseSign({ nr, name, plate, ink, placeholder }) {
  const [, setReady] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    Promise.all(["300", "500", "700"].map((w) => document.fonts.load(`${w} 40px Poppins`))).then(() => setReady((x) => x + 1)).catch(() => {});
  }, []);
  const L = houseSignLayout(nr, name);
  const s = 364 / L.W, cx = 200, cy = 196;            // mm -> SVG
  const X = (x) => cx + x * s, Y = (y) => cy - y * s;
  const fs = (mm) => mm * 1.38 * s;
  const edge = shade(plate, -0.45), inkShadow = shade(ink, -0.35);
  const op = placeholder ? 0.45 : 1;
  const T = (props, children) => <text fontFamily="Poppins, sans-serif" dominantBaseline="central" {...props}>{children}</text>;
  const layer = (dx, dy, fill) => (
    <g transform={`translate(${dx} ${dy})`} fill={fill} opacity={op}>
      {T({ x: X(L.xn), y: Y(-2), textAnchor: "middle", fontWeight: 700, fontSize: fs(L.nrSize) }, nr)}
      <rect x={X(L.xd)} y={Y(30)} width={1.6 * s} height={60 * s} />
      {T({ x: X(L.xr + 1), y: Y(10), fontWeight: 300, fontSize: fs(8), letterSpacing: 1.2 * s }, "FAMILIE")}
      {T({ x: X(L.xr), y: Y(-8), fontWeight: 500, fontSize: fs(L.nameSize) }, name)}
    </g>
  );
  return (
    <g>
      <ellipse cx="200" cy={Y(-50) + 26} rx={L.W * s * 0.5} ry="14" fill="url(#floor)" />
      <rect x={X(-L.W / 2) + 4} y={Y(50) + 7} width={L.W * s} height={100 * s} rx={8 * s} fill={edge} />
      <rect x={X(-L.W / 2)} y={Y(50)} width={L.W * s} height={100 * s} rx={8 * s} fill={plate} />
      <rect x={X(-L.W / 2)} y={Y(50)} width={L.W * s} height={100 * s} rx={8 * s} fill="url(#layers)" />
      {layer(1.6, 2.2, inkShadow)}
      {layer(0, 0, ink)}
      <text x="200" y={Y(-50) + 52} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12.5" fill={L.ok ? "#7A7A82" : "#A32D2D"}>
        {L.ok ? `ca. ${Math.round(L.W / 10)} × 10 cm` : "Text zu lang – bitte kürzen"}
      </text>
    </g>
  );
}


// ---------- Schlüsselbrett mit Spruch (gleiches Layout wie der STL-Generator brett.py) ----------
export function splitSaying(t) {
  const words = t.trim().split(/\s+/).filter(Boolean);
  if (words.join(" ").length <= 18 || words.length < 2) return [words.join(" ")];
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" "), b = words.slice(i).join(" ");
    // ausgewogen, aber lieber nach „–“, „:“ oder „,“ umbrechen und nie eine Zeile mit „–“ beginnen
    const d = Math.abs(a.length - b.length) + (/^[–-]/.test(b) ? 100 : 0) - (/[–:-]$/.test(a) ? 10 : /,$/.test(a) ? 4 : 0);
    if (!best || d < best[0]) best = [d, [a, b]];
  }
  return best[1];
}
export function keyBoardLayout(text) {
  const W = 220, TOP = 44, BOT = 2, lines = splitSaying(text), n = lines.length;
  let size = Math.min(n === 1 ? 20 : 14, (TOP - BOT) / (n * 1.5 + 0.1));
  while (Math.max(...lines.map((l) => textW(l, 700, size))) > W - 44 && size > 7) size *= 0.97;
  const lh = size * 1.5, mid = (TOP + BOT) / 2;
  return { W, H: 100, lines, size, ys: lines.map((_, i) => mid + ((n - 1) / 2) * lh - i * lh), ok: size > 7 };
}
function KeyBoard({ text, plate, ink, placeholder }) {
  const [, setReady] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.load("700 40px Poppins").then(() => setReady((x) => x + 1)).catch(() => {});
  }, []);
  const L = keyBoardLayout(text);
  const s = 364 / L.W, cx = 200, cy = 180;
  const X = (x) => cx + x * s, Y = (y) => cy - y * s;
  const edge = shade(plate, -0.45), inkShadow = shade(ink, -0.35);
  const op = placeholder ? 0.45 : 1;
  const hooks = [-80, -40, 0, 40, 80];
  const layer = (dx, dy, fill) => (
    <g transform={`translate(${dx} ${dy})`} fill={fill} opacity={op}>
      {L.lines.map((l, i) => (
        <text key={i} x={X(0)} y={Y(L.ys[i])} textAnchor="middle" dominantBaseline="central" fontFamily="Poppins, sans-serif" fontWeight={700} fontSize={L.size * 1.38 * s}>{l}</text>
      ))}
      <rect x={X(-70)} y={Y(-9.2)} width={140 * s} height={1.2 * s} rx={0.6 * s} />
    </g>
  );
  return (
    <g>
      <ellipse cx="200" cy={Y(-50) + 40} rx={L.W * s * 0.5} ry="14" fill="url(#floor)" />
      <rect x={X(-L.W / 2) + 4} y={Y(50) + 7} width={L.W * s} height={100 * s} rx={8 * s} fill={edge} />
      <rect x={X(-L.W / 2)} y={Y(50)} width={L.W * s} height={100 * s} rx={8 * s} fill={plate} />
      <rect x={X(-L.W / 2)} y={Y(50)} width={L.W * s} height={100 * s} rx={8 * s} fill="url(#layers)" />
      {layer(1.4, 2, inkShadow)}
      {layer(0, 0, ink)}
      {hooks.map((x) => (
        <g key={x}>
          <rect x={X(x - 5) + 3} y={Y(-31 + 13) + 9} width={10 * s} height={15 * s} rx={2.2 * s} fill="rgba(0,0,0,0.28)" />
          <rect x={X(x - 5) + 1.5} y={Y(-31 + 13) + 3} width={10 * s} height={15 * s} rx={2.2 * s} fill={inkShadow} />
          <rect x={X(x - 5)} y={Y(-31 + 13)} width={10 * s} height={15 * s} rx={2.2 * s} fill={ink} />
        </g>
      ))}
      <text x="200" y={Y(-50) + 64} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12.5" fill={L.ok ? "#7A7A82" : "#A32D2D"}>
        {L.ok ? "ca. 22 × 10 cm · 5 Haken" : "Spruch zu lang – bitte kürzen"}
      </text>
    </g>
  );
}

export default function PersonalizePreview({ product, colorCss, colorCss2, text, fontId, extra }) {
  const type = product.personalize?.type;
  const base = colorCss && colorCss.startsWith("#") ? colorCss : "#8a8d91";
  const font = PERSONALIZE_FONTS.find((f) => f.id === fontId) || PERSONALIZE_FONTS[0];
  const shown = text?.trim() || (type === "bowl" ? "Bello" : type === "keychain" ? "Anna" : "Dein Name");
  const placeholder = !text?.trim();
  const dark = shade(base, -0.35);
  const darker = shade(base, -0.55);
  const light = shade(base, 0.25);
  // eingelassener Text: dunkler auf hellen Farben, heller auf dunklen
  const ink = isLight(base) ? shade(base, -0.6) : shade(base, 0.45);
  const textFill = placeholder ? (isLight(base) ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.35)") : ink;

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "1 / 1", background: "#EFE9E1", border: "1px solid #E4DFD6" }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%" role="img" aria-label={`Vorschau: ${product.name} mit „${shown}“`}>
        <defs>
          <pattern id="layers" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="3.2" fill="transparent" />
            <rect y="3.2" width="4" height="0.8" fill="rgba(0,0,0,0.06)" />
          </pattern>
          <radialGradient id="floor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {type === "keychain" && (
          <g>
            <ellipse cx="200" cy="335" rx="120" ry="16" fill="url(#floor)" />
            <circle cx="200" cy="72" r="34" fill="none" stroke="#B8BCC2" strokeWidth="7" />
            <circle cx="200" cy="72" r="34" fill="none" stroke="#E6E8EB" strokeWidth="2" />
            <circle cx="206" cy="212" r="118" fill={darker} />
            <circle cx="200" cy="206" r="118" fill={base} />
            <circle cx="200" cy="206" r="118" fill="url(#layers)" />
            <circle cx="200" cy="206" r="100" fill="none" stroke={dark} strokeWidth="3" opacity="0.5" />
            <circle cx="200" cy="116" r="13" fill="#EFE9E1" stroke={dark} strokeWidth="3" />
            <FitText text={shown} x={200} y={216} maxWidth={170} maxSize={64} font={font} fill={textFill} />
          </g>
        )}

        {type === "nameplate" && (
          <g>
            <ellipse cx="200" cy="300" rx="175" ry="16" fill="url(#floor)" />
            <rect x="32" y="138" width="344" height="140" rx="22" fill={darker} />
            <rect x="24" y="128" width="344" height="140" rx="22" fill={base} />
            <rect x="24" y="128" width="344" height="140" rx="22" fill="url(#layers)" />
            <rect x="38" y="142" width="316" height="112" rx="14" fill="none" stroke={dark} strokeWidth="3" opacity="0.45" />
            <circle cx="56" cy="198" r="8" fill="#EFE9E1" stroke={dark} strokeWidth="2.5" />
            <circle cx="336" cy="198" r="8" fill="#EFE9E1" stroke={dark} strokeWidth="2.5" />
            <FitText text={shown} x={196} y={200} maxWidth={240} maxSize={66} font={font} fill={textFill} />
          </g>
        )}

        {type === "bowl" && (
          <g>
            <ellipse cx="200" cy="340" rx="160" ry="18" fill="url(#floor)" />
            {/* Napf */}
            <ellipse cx="200" cy="112" rx="132" ry="30" fill="#C9CDD2" />
            <ellipse cx="200" cy="112" rx="118" ry="24" fill="#9EA4AB" />
            <ellipse cx="200" cy="116" rx="96" ry="17" fill="#B7BCC2" />
            {/* Untersteller */}
            <path d={`M 76 132 L 324 132 L 300 322 L 100 322 Z`} fill={base} />
            <path d={`M 76 132 L 324 132 L 300 322 L 100 322 Z`} fill="url(#layers)" />
            <path d={`M 324 132 L 340 140 L 314 326 L 300 322 Z`} fill={dark} />
            <rect x="70" y="124" width="260" height="14" rx="4" fill={light} />
            <path d={`M 108 186 L 292 186 L 282 280 L 118 280 Z`} fill={dark} opacity="0.18" />
            <FitText text={shown} x={200} y={234} maxWidth={160} maxSize={52} font={font} fill={textFill} />
          </g>
        )}

        {type === "housesign" && (
          <HouseSign
            nr={extra?.trim() || "12"}
            name={text?.trim() || "Muster"}
            plate={colorCss && colorCss.startsWith("#") ? colorCss : "#3A3C42"}
            ink={colorCss2 && colorCss2.startsWith("#") ? colorCss2 : "#EEECE6"}
            placeholder={!text?.trim() && !extra?.trim()}
          />
        )}

        {type === "keyboard" && (
          <KeyBoard
            text={text?.trim() || "Hoam is, wo de Schlüssel hängan"}
            plate={colorCss && colorCss.startsWith("#") ? colorCss : "#2B2E4A"}
            ink={colorCss2 && colorCss2.startsWith("#") ? colorCss2 : "#EEECE6"}
            placeholder={!text?.trim()}
          />
        )}

        {type === "penholder" && (
          <g>
            <ellipse cx="200" cy="340" rx="130" ry="16" fill="url(#floor)" />
            {/* Stifte */}
            <rect x="150" y="40" width="16" height="130" rx="3" fill="#2F6FED" transform="rotate(-8 158 105)" />
            <rect x="196" y="28" width="16" height="140" rx="3" fill="#F5CF2D" />
            <rect x="240" y="44" width="16" height="125" rx="3" fill="#D23A32" transform="rotate(9 248 106)" />
            <polygon points="196,28 212,28 204,12" fill="#3A3A3A" />
            {/* Sechseck-Körper: Front + zwei Seiten */}
            <polygon points="120,120 160,104 240,104 280,120 240,136 160,136" fill={darker} />
            <polygon points="120,120 160,136 160,330 120,312" fill={dark} />
            <polygon points="240,136 280,120 280,312 240,330" fill={dark} />
            <polygon points="160,136 240,136 240,330 160,330" fill={base} />
            <polygon points="160,136 240,136 240,330 160,330" fill="url(#layers)" />
            <FitText text={shown} x={200} y={233} maxWidth={170} maxSize={46} font={font} fill={textFill} rotate={-90} />
          </g>
        )}
      </svg>
      <span style={{ position: "absolute", left: 14, bottom: 12, fontSize: 11.5, color: "#7A7A82", background: "rgba(247,244,239,0.85)", borderRadius: 999, padding: "4px 10px" }}>
        Vorschau – vereinfachte Darstellung
      </span>
    </div>
  );
}
