import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { supabase } from "../supabaseClient";
import { btn, btnDark, inp, card, lbl, euro } from "./ui";
import { isReference } from "../shopData";

// Preiskalkulation im Dashboard: Kosten pro Produkt (gespeichert in data.calc),
// Grundwerte in der versteckten Zeile "_kalkulation" (active = false, erscheint nie im Shop).
export const CALC_ROW_ID = "_kalkulation";
const DEFAULTS = { mat: { PLA: 20, PETG: 22, TPU: 30, ASA: 28 }, scrap: 0.1, kwh: 0.3, watt: 110, printerCost: 900, life: 4000, wear: 0.1, wage: 20, markup: 0.3, feePct: 0.015, feeFix: 0.25, vat: 0 };

// Startwerte (Schätzungen von Claude) für Produkte ohne eigene Kalkulation – werden erst beim Bearbeiten gespeichert
const ESTIMATES = [
  [/schl(ü|ue)sselbrett/i, { g: 95, h: 5, min: 15, pack: 1.5, other: 0.3 }],
  [/pflanzenstecker/i, { g: 37, h: 2, min: 10, pack: 1, other: 0 }],
  [/hausnummer/i, { g: 150, h: 6, min: 15, pack: 2, other: 0 }],
  [/zahnrad-fidget 2er/i, { g: 50, h: 3, min: 8, pack: 1, other: 0 }],
  [/zahnrad-fidget/i, { g: 25, h: 1.5, min: 5, pack: 0.8, other: 0 }],
  [/teelicht/i, { g: 120, h: 4, min: 10, pack: 1.5, other: 0 }],
  [/schach/i, { g: 400, h: 20, min: 30, pack: 3, other: 0 }],
];
const FIELDS = [["g", "Gewicht (g)"], ["h", "Druckzeit (h)"], ["min", "Arbeitszeit (min)"], ["pack", "Verpackung (€)"], ["other", "Sonstiges (€)"]];
const BASE = [
  ["Filament (€/kg)", ["PLA", "PETG", "TPU", "ASA"].map((m) => ["mat." + m, m, "€/kg"])],
  ["Druck", [["scrap", "Ausschuss / Fehldrucke", "%"], ["kwh", "Strompreis", "€/kWh"], ["watt", "Leistung Drucker", "Watt"], ["printerCost", "Kaufpreis Drucker + AMS", "€"], ["life", "Lebensdauer", "Druckstunden"], ["wear", "Verschleiß", "€/Druckstunde"]]],
  ["Preis", [["wage", "Dein Stundenlohn", "€/h"], ["markup", "Gewinnaufschlag", "%"], ["feePct", "Zahlungsgebühr", "%"], ["feeFix", "Zahlungsgebühr fix", "€/Bestellung"], ["vat", "Umsatzsteuer", "% (0 = Kleinunternehmer)"]]],
];
const PCT_KEYS = ["scrap", "markup", "feePct", "vat"];
const num = (v) => { const x = parseFloat(String(v ?? "").replace(",", ".")); return Number.isFinite(x) ? x : 0; };
const pct = (n) => (Number.isFinite(n) ? (n * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " %" : "–");

export function calcPrice(S, material, c, price) {
  const mp = S.mat?.[String(material || "PLA").split(" ")[0]] ?? S.mat?.PLA ?? 0;
  const mat = num(c.g) / 1000 * mp * (1 + S.scrap);
  const power = num(c.h) * S.watt / 1000 * S.kwh;
  const machine = num(c.h) * (S.printerCost / Math.max(S.life, 1) + S.wear);
  const labor = num(c.min) / 60 * S.wage;
  const cost = mat + power + machine + labor + num(c.pack) + num(c.other);
  const minPrice = (cost * (1 + S.markup) + S.feeFix) / Math.max(1 - S.feePct, 0.01) * (1 + S.vat);
  const rec = minPrice < 5 ? Math.ceil(minPrice * 10 - 1e-9) / 10 : Math.ceil(minPrice - 0.9 - 1e-9) + 0.9;
  const p = num(price);
  const profit = p ? p / (1 + S.vat) - p * S.feePct - S.feeFix - cost : NaN;
  const verdict = !p ? ["–", "#6B7280", "#F3F4F6"] : p < minPrice ? ["zu billig", "#A33A2C", "#F8DEDA"] : p < minPrice * 1.3 ? ["knapp", "#A06410", "#FBEBD2"] : ["gut", "#2F7A55", "#E0F0E7"];
  return { mat, power, machine, labor, cost, minPrice, rec, profit, margin: p ? profit / p : NaN, hourly: p && num(c.min) ? (profit + labor) / (num(c.min) / 60) : NaN, verdict };
}

const Pill = ({ v }) => <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 999, color: v[1], background: v[2], whiteSpace: "nowrap" }}>{v[0]}</span>;
const Row = ({ k, v, strong }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: strong ? 14.5 : 13, fontWeight: strong ? 600 : 400, color: strong ? "#1B1D21" : "#4B5563", fontVariantNumeric: "tabular-nums" }}><span>{k}</span><span>{v}</span></div>
);

function ProductCalc({ row, S, onSaved }) {
  const d = row.data || {};
  const est = ESTIMATES.find(([re]) => re.test(d.name || ""))?.[1];
  const [c, setC] = useState(() => d.calc || (est ? { ...est, estimate: true } : {}));
  const [price, setPrice] = useState(String(d.price ?? ""));
  const [state, setState] = useState(null); // saving | saved | error
  const [msg, setMsg] = useState("");
  const timer = useRef(null);
  const r = calcPrice(S, d.material, c, d.price);
  const rTarget = calcPrice(S, d.material, c, price);

  const persistCalc = (next) => {
    clearTimeout(timer.current);
    setState("saving");
    timer.current = setTimeout(async () => {
      const { estimate, ...clean } = next;
      const { error } = await supabase.from("products").update({ data: { ...row.data, calc: clean }, updated_at: new Date().toISOString() }).eq("id", row.id);
      if (error) { setState("error"); setMsg("Speichern fehlgeschlagen: " + error.message); return; }
      row.data = { ...row.data, calc: clean };
      setState("saved"); setTimeout(() => setState(null), 1200);
    }, 600);
  };
  const setField = (k, v) => { const next = { ...c, [k]: v.replace(",", "."), estimate: false }; setC(next); persistCalc(next); };
  const savePrice = async () => {
    const p = num(price);
    if (!(p > 0)) { setMsg("Bitte einen gültigen Preis eingeben."); return; }
    setMsg(""); setState("saving");
    const { estimate, ...clean } = c;
    const data = { ...row.data, price: Math.round(p * 100) / 100, calc: clean };
    const { error } = await supabase.from("products").update({ data, updated_at: new Date().toISOString() }).eq("id", row.id);
    if (error) { setState("error"); setMsg("Preis speichern fehlgeschlagen: " + error.message); return; }
    row.data = data; setC(clean); setState("saved"); setMsg(`Shop-Preis ist jetzt ${euro(data.price)}.`); onSaved?.();
  };
  const changed = num(price) !== num(d.price);

  return (
    <div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
      <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, margin: 0 }}>{d.name}</p>
        <span style={{ fontSize: 12, color: "#6B7280" }}>{d.material || "PLA"}{row.active ? "" : " · ausgeblendet"}</span>
        {c.estimate && <span style={{ fontSize: 11.5, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#F4E6DC", color: "#A85A32" }}>Schätzung</span>}
        <span style={{ marginLeft: "auto", fontSize: 12, color: state === "error" ? "#A33A2C" : "#6B7280", display: "inline-flex", alignItems: "center", gap: 4 }}>
          {state === "saving" && <><Loader2 size={12} className="spin" /> speichert</>}{state === "saved" && <><Check size={12} /> gespeichert</>}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, alignContent: "start" }}>
        {FIELDS.map(([k, l]) => (
          <div key={k}><label style={lbl}>{l}</label><input value={c[k] ?? ""} onChange={(e) => setField(k, e.target.value)} inputMode="decimal" style={inp} /></div>
        ))}
      </div>
      <div style={{ background: "#F6F7F9", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
        <Row k="Material + Strom + Drucker" v={euro(r.mat + r.power + r.machine)} />
        <Row k="Arbeitszeit" v={euro(r.labor)} />
        <Row k="Selbstkosten" v={euro(r.cost)} strong />
        <Row k="Mindestpreis" v={euro(r.minPrice)} />
        <Row k="Empfehlung" v={<b style={{ color: "#A85A32", fontSize: 16 }}>{euro(r.rec)}</b>} />
        <div style={{ borderTop: "1px solid #E5E7EB", margin: "6px 0 2px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ color: "#4B5563" }}>Shop-Preis jetzt: <b style={{ color: "#1B1D21" }}>{euro(d.price)}</b></span><Pill v={r.verdict} />
        </div>
        {Number.isFinite(r.profit) && <Row k="Gewinn je Stück · Stundenlohn" v={`${euro(r.profit)} · ${Number.isFinite(r.hourly) ? euro(r.hourly) + "/h" : "–"}`} />}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <input value={price} onChange={(e) => { setPrice(e.target.value); setMsg(""); }} inputMode="decimal" aria-label="Neuer Shop-Preis" style={{ ...inp, width: 100 }} />
          <button style={btn} onClick={() => setPrice(r.rec.toFixed(2))} title="Empfehlung ins Feld übernehmen">= Empfehlung</button>
          <button style={{ ...btnDark, opacity: changed ? 1 : 0.45 }} disabled={!changed} onClick={savePrice}>Als Shop-Preis übernehmen</button>
        </div>
        {changed && Number.isFinite(rTarget.profit) && <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Bei {euro(num(price))}: Gewinn {euro(rTarget.profit)} ({pct(rTarget.margin)}) · <Pill v={rTarget.verdict} /></p>}
        {msg && <p style={{ fontSize: 12.5, color: state === "error" ? "#A33A2C" : "#2F7A55", margin: 0 }}>{msg}</p>}
      </div>
    </div>
  );
}

export default function KalkulationAdmin() {
  const [rows, setRows] = useState(null);
  const [S, setS] = useState(DEFAULTS);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const [sState, setSState] = useState(null);
  const sTimer = useRef(null);

  const load = async () => {
    const { data, error } = await supabase.from("products").select("*").order("sort", { ascending: true });
    if (error) { setErr(error.message); setRows([]); return; }
    const sRow = data.find((r) => r.id === CALC_ROW_ID);
    if (sRow?.data) setS({ ...DEFAULTS, ...sRow.data, mat: { ...DEFAULTS.mat, ...(sRow.data.mat || {}) } });
    setRows(data.filter((r) => !String(r.id).startsWith("_") && !isReference(r.data)));
  };
  useEffect(() => { load(); }, []);

  const getS = (k) => (k.startsWith("mat.") ? S.mat[k.slice(4)] : S[k]);
  const setBase = (k, raw) => {
    const v = num(raw) / (PCT_KEYS.includes(k) ? 100 : 1);
    const next = k.startsWith("mat.") ? { ...S, mat: { ...S.mat, [k.slice(4)]: v } } : { ...S, [k]: v };
    setS(next);
    clearTimeout(sTimer.current); setSState("saving");
    sTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("products").upsert({ id: CALC_ROW_ID, data: next, sort: 999999, active: false, updated_at: new Date().toISOString() });
      setSState(error ? "error" : "saved");
      if (error) setErr("Grundwerte speichern fehlgeschlagen: " + error.message);
    }, 600);
  };

  if (!rows) return <p style={{ color: "#6B7280" }}>Lädt…</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <style>{`.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
        Gewicht und Druckzeit aus Bambu Studio eintragen – Kosten und Empfehlung rechnen sofort mit und werden gespeichert. Der Shop-Preis ändert sich nur, wenn du „Als Shop-Preis übernehmen“ klickst.
      </p>
      {err && <p style={{ color: "#A33A2C", fontSize: 13, margin: 0 }}>{err}</p>}
      <div style={card}>
        <button onClick={() => setOpen((o) => !o)} style={{ ...btn, border: 0, padding: 0, background: "none", fontWeight: 600, fontSize: 14 }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Grundwerte (Filament, Strom, Drucker, Stundenlohn, Aufschlag)
          {sState === "saved" && <span style={{ fontWeight: 400, color: "#2F7A55", fontSize: 12 }}>· gespeichert</span>}
        </button>
        {open && BASE.map(([g, items]) => (
          <div key={g} style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: "#6B7280", margin: "0 0 8px" }}>{g}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {items.map(([k, l, u]) => (
                <div key={k}><label style={lbl}>{l} <span style={{ fontWeight: 400, color: "#6B7280" }}>({u})</span></label>
                  <input defaultValue={PCT_KEYS.includes(k) ? +(getS(k) * 100).toFixed(2) : getS(k)} onChange={(e) => setBase(k, e.target.value)} inputMode="decimal" style={inp} /></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {rows.map((r) => <ProductCalc key={r.id} row={r} S={S} />)}
    </div>
  );
}
