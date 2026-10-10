import React, { useEffect, useRef, useState } from "react";
import ShopPreview from "./ShopPreview";
import { supabase } from "../supabaseClient";
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES, MATERIALS, TAG_LABELS } from "../shopData";
import { productToData, COLOR_SETS } from "../productStore";
import { btn, btnDark, inp, card, lbl, euro } from "./ui";
import { Pencil, Plus, Eye, EyeOff, Upload, X, Loader2, Save, Trash2, ChevronLeft, Download, GripVertical, Check } from "lucide-react";

const STATUS = [
  { id: "verfuegbar", label: "Verfügbar (bestellbar)", inStock: true, comingSoon: false, color: "#27500A", bg: "#EAF3DE" },
  { id: "bald", label: "Bald verfügbar", inStock: false, comingSoon: true, color: "#854F0B", bg: "#FAEEDA" },
  { id: "aus", label: "Ausverkauft", inStock: false, comingSoon: false, color: "#7A1F1F", bg: "#F6E1E1" },
];
const statusOf = (d) => (d.inStock ? STATUS[0] : d.comingSoon ? STATUS[1] : STATUS[2]);
const PERS_TYPES = [
  { id: "", label: "Keine Personalisierung" },
  { id: "keychain", label: "Schlüsselanhänger (rund)" },
  { id: "nameplate", label: "Namensschild" },
  { id: "bowl", label: "Napf-Untersteller" },
  { id: "penholder", label: "Stiftehalter" },
  { id: "housesign", label: "Hausnummer-Schild (Nummer + Name, 2 Farben)" },
  { id: "keyboard", label: "Schlüsselbrett mit Spruch (2 Farben)" },
  { id: "plantmarkers", label: "Pflanzenstecker-Set (Namen mit Beistrich, 2 Farben)" },
];
const PERS_PRESETS = {
  housesign: { label: "Familienname", maxLength: 18, extraLabel: "Hausnummer", extraPlaceholder: "z. B. 12 oder 7b" },
  keyboard: { label: "Spruch", maxLength: 40, extraLabel: "", extraPlaceholder: "" },
  plantmarkers: { label: "Namen (mit Beistrich getrennt)", maxLength: 160, maxNames: 6, extraLabel: "", extraPlaceholder: "" },
};

async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s);
    c.height = Math.round(img.height * s);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#F7F4EF";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Editor({ row, onClose, onSaved, onDeleted }) {
  const [d, setD] = useState(() => ({ ...row.data }));
  const [active, setActive] = useState(row.active !== false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const st = statusOf(d);
  const pers = d.personalize || null;
  const setPers = (k, v) => setD((x) => ({ ...x, personalize: { ...(x.personalize || {}), [k]: v } }));

  const upload = async (files) => {
    setErr("");
    setUploading(true);
    try {
      const urls = [];
      for (const f of Array.from(files)) {
        const blob = await shrink(f);
        const path = `${row.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const { error } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw error;
        urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
      }
      setD((x) => ({ ...x, images: [...(x.images || []), ...urls] }));
    } catch (e) {
      setErr("Foto-Upload fehlgeschlagen: " + (e.message || e));
    } finally {
      setUploading(false);
    }
  };
  const moveImg = (i, dir) => setD((x) => {
    const a = [...(x.images || [])];
    const j = i + dir;
    if (j < 0 || j >= a.length) return x;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...x, images: a };
  });

  const save = async () => {
    setErr("");
    if (!d.name?.trim()) return setErr("Bitte einen Namen eingeben.");
    const price = Number(String(d.price).replace(",", "."));
    if (!(price > 0)) return setErr("Bitte einen gültigen Preis eingeben.");
    const data = { ...d, name: d.name.trim(), price };
    if (!data.tag) delete data.tag;
    if (!data.colorSet) { data.colorSet = null; delete data.colorCount; } else data.colorCount = Number(data.colorCount) || 1;
    if (!data.personalize?.type) delete data.personalize;
    else data.personalize = { ...data.personalize, maxLength: Number(data.personalize.maxLength) || 12 };
    if (data.images && !data.images.length) delete data.images;
    setBusy(true);
    const { error } = await supabase.from("products").upsert({ id: row.id, data, sort: row.sort, active, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) return setErr("Speichern fehlgeschlagen: " + error.message);
    onSaved();
  };
  const remove = async () => {
    if (!window.confirm(`„${d.name}“ wirklich endgültig löschen? (Tipp: „Ausblenden“ geht auch.)`)) return;
    const { error } = await supabase.from("products").delete().eq("id", row.id);
    if (error) return setErr("Löschen fehlgeschlagen: " + error.message);
    onDeleted();
  };

  return (
    <div>
      <button onClick={onClose} style={{ ...btn, marginBottom: 14 }}><ChevronLeft size={14} /> Zurück zur Liste</button>
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>{d.name || "Neues Produkt"} <span style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 400 }}>({row.id})</span></p>
          <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Im Shop sichtbar
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Name</label><input value={d.name || ""} onChange={(e) => set("name", e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Preis (€)</label><input value={d.price ?? ""} onChange={(e) => set("price", e.target.value)} inputMode="decimal" style={inp} /></div>
          <div>
            <label style={lbl}>Status</label>
            <select value={st.id} onChange={(e) => { const s = STATUS.find((x) => x.id === e.target.value); setD((x) => ({ ...x, inStock: s.inStock, comingSoon: s.comingSoon })); }} style={inp}>
              {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Kategorie</label>
            <select value={d.category || "deko"} onChange={(e) => set("category", e.target.value)} style={inp}>
              {CATEGORIES.filter((c) => c.id !== "alle").map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Material</label>
            <select value={d.material || "PLA"} onChange={(e) => set("material", e.target.value)} style={inp}>
              {Object.entries(MATERIALS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Etikett</label>
            <select value={d.tag || ""} onChange={(e) => set("tag", e.target.value)} style={inp}>
              <option value="">Keins</option>
              {Object.entries(TAG_LABELS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Farbe der Platzhalter-Grafik</label>
            <input type="color" value={d.hue || "#2F6FED"} onChange={(e) => set("hue", e.target.value)} style={{ ...inp, padding: 3, height: 37 }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Beschreibung</label>
            <textarea value={d.description || ""} onChange={(e) => set("description", e.target.value)} rows={5} style={{ ...inp, resize: "vertical" }} />
          </div>
        </div>

        <div>
          <label style={lbl}>Fotos <span style={{ fontWeight: 400, color: "#6B7280" }}>(das erste ist das Titelbild)</span></label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(d.images || []).map((src, i) => (
              <div key={src} style={{ position: "relative", width: 96 }}>
                <img src={src} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, border: i === 0 ? "2px solid #A85A32" : "1px solid #D3D7DD", display: "block" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <button type="button" onClick={() => moveImg(i, -1)} disabled={i === 0} style={{ ...btn, padding: "2px 6px" }} aria-label="Nach vorne">◀</button>
                  <button type="button" onClick={() => setD((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) }))} style={{ ...btn, padding: "2px 6px" }} aria-label="Entfernen"><X size={12} /></button>
                  <button type="button" onClick={() => moveImg(i, 1)} disabled={i === (d.images || []).length - 1} style={{ ...btn, padding: "2px 6px" }} aria-label="Nach hinten">▶</button>
                </div>
              </div>
            ))}
            <label style={{ width: 96, height: 96, border: "2px dashed #D3D7DD", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", fontSize: 12, color: "#6B7280", textAlign: "center" }}>
              {uploading ? <Loader2 size={18} /> : <Upload size={18} />}
              {uploading ? "Lädt…" : "Foto hinzufügen"}
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
          {d.video && <p style={{ fontSize: 12, color: "#6B7280", margin: "8px 0 0" }}>Dieses Produkt hat zusätzlich ein Video (bleibt erhalten).</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div>
            <label style={lbl}>Farbauswahl für Kunden</label>
            <select value={d.colorSet || ""} onChange={(e) => set("colorSet", e.target.value || null)} style={inp}>
              <option value="">Keine</option>
              {Object.entries(COLOR_SETS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
            </select>
          </div>
          {d.colorSet && (
            <div>
              <label style={lbl}>Anzahl Farben</label>
              <select value={d.colorCount || 1} onChange={(e) => set("colorCount", Number(e.target.value))} style={inp}>
                <option value={1}>1 Farbe</option>
                <option value={2}>2 Farben (z. B. Set)</option>
              </select>
            </div>
          )}
          <div>
            <label style={lbl}>Personalisierung</label>
            <select value={pers?.type || ""} onChange={(e) => setD((x) => ({ ...x, personalize: e.target.value ? { label: "Wunschtext", maxLength: 12, ...(x.personalize || {}), ...(PERS_PRESETS[e.target.value] || {}), type: e.target.value } : null, ...(["housesign", "keyboard", "plantmarkers"].includes(e.target.value) ? { colorCount: 2 } : {}) }))} style={inp}>
              {PERS_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          {pers?.type && (
            <>
              <div><label style={lbl}>Feldname</label><input value={pers.label || ""} onChange={(e) => setPers("label", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Max. Zeichen</label><input value={pers.maxLength || ""} onChange={(e) => setPers("maxLength", e.target.value)} inputMode="numeric" style={inp} /></div>
              <div><label style={lbl}>Zusatzfeld (optional)</label><input value={pers.extraLabel || ""} onChange={(e) => setPers("extraLabel", e.target.value)} placeholder="z. B. Napf-Ø (cm)" style={inp} /></div>
            </>
          )}
        </div>

        {err && <p style={{ color: "#A32D2D", fontSize: 13, margin: 0 }}>{err}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <button onClick={save} disabled={busy || uploading} style={btnDark}>{busy ? <Loader2 size={14} /> : <Save size={14} />} Speichern</button>
          <button onClick={remove} style={{ ...btn, color: "#A32D2D" }}><Trash2 size={14} /> Löschen</button>
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Änderungen sind sofort im Shop sichtbar (Seite neu laden).</p>
      </div>
    </div>
  );
}

export default function ProductsAdmin() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("products").select("*").order("sort", { ascending: true });
    if (error) { setErr(error.message); setRows([]); return; }
    setErr("");
    setRows(data.filter((r) => !String(r.id).startsWith("_"))); // "_kalkulation" = Grundwerte der Preiskalkulation, kein Produkt
  };
  useEffect(() => { load(); }, []);

  const importStatic = async () => {
    setBusy(true);
    const payload = STATIC_PRODUCTS.map((p, i) => ({ id: p.id, data: productToData(p), sort: (i + 1) * 10, active: true }));
    const { error } = await supabase.from("products").upsert(payload);
    setBusy(false);
    if (error) return setErr("Übernehmen fehlgeschlagen: " + error.message);
    load();
  };
  // --- Ziehen & Ablegen (Maus und Touch) ---
  const [dragId, setDragId] = useState(null);
  const [saveState, setSaveState] = useState(null); // saving | saved
  const listRef = useRef(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const persistOrder = async (ordered) => {
    const changed = ordered.map((r, i) => ({ r, sort: (i + 1) * 10 })).filter(({ r, sort }) => r.sort !== sort);
    if (!changed.length) return;
    setSaveState("saving");
    const results = await Promise.all(changed.map(({ r, sort }) => supabase.from("products").update({ sort }).eq("id", r.id)));
    const failed = results.find((x) => x.error);
    if (failed) { setErr("Reihenfolge speichern fehlgeschlagen: " + failed.error.message); setSaveState(null); return load(); }
    setRows(ordered.map((r, i) => ({ ...r, sort: (i + 1) * 10 })));
    setSaveState("saved");
    setTimeout(() => setSaveState(null), 1500);
  };

  const startDrag = (e, id) => {
    e.preventDefault();
    setDragId(id);
    const onMove = (ev) => {
      const y = ev.clientY;
      const current = rowsRef.current;
      const from = current.findIndex((r) => r.id === id);
      const els = [...(listRef.current?.querySelectorAll("[data-row]") || [])];
      // Einfügeposition = Anzahl der anderen Zeilen, deren Mitte oberhalb des Zeigers liegt
      let to = 0;
      els.forEach((el, i) => {
        if (i === from) return;
        const b = el.getBoundingClientRect();
        if (b.top + b.height / 2 < y) to += 1;
      });
      if (to !== from) {
        const next = [...current];
        const [m] = next.splice(from, 1);
        next.splice(to, 0, m);
        rowsRef.current = next;
        setRows(next);
      }
      // Am Rand automatisch scrollen
      if (y < 60) window.scrollBy(0, -12);
      else if (y > window.innerHeight - 60) window.scrollBy(0, 12);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setDragId(null);
      persistOrder(rowsRef.current);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const toggle = async (r) => { await supabase.from("products").update({ active: !r.active }).eq("id", r.id); load(); };
  const create = () => {
    const max = Math.max(0, ...rows.map((r) => Number(String(r.id).replace(/\D/g, "")) || 0), ...STATIC_PRODUCTS.map((p) => Number(p.id.replace(/\D/g, "")) || 0));
    const sort = Math.max(0, ...rows.map((r) => r.sort || 0)) + 10;
    setEditing({ id: `p${max + 1}`, sort, active: false, data: { name: "", price: "", category: "deko", material: "PLA", hue: "#A85A32", inStock: false, comingSoon: true, description: "" } });
  };

  if (editing) {
    return <Editor row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} onDeleted={() => { setEditing(null); load(); }} />;
  }
  if (!rows) return <p style={{ color: "#6B7280" }}>Lädt…</p>;
  if (err && /relation|does not exist|schema cache/i.test(err)) {
    return <div style={card}><p style={{ margin: 0, fontSize: 14 }}>Die Produkt-Tabelle fehlt noch in der Datenbank. Bitte zuerst den SQL-Schritt ausführen.</p></div>;
  }

  return (
    <div>
      {err && <p style={{ color: "#A32D2D", fontSize: 13 }}>{err}</p>}
      {rows.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 28 }}>
          <p style={{ fontWeight: 600, margin: "0 0 6px" }}>Noch keine Produkte in der Datenbank</p>
          <p style={{ color: "#6B7280", fontSize: 13.5, margin: "0 0 16px" }}>Übernimm einmalig das aktuelle Sortiment ({STATIC_PRODUCTS.length} Produkte) – danach bearbeitest du alles hier.</p>
          <button onClick={importStatic} disabled={busy} style={btnDark}>{busy ? <Loader2 size={14} /> : <Download size={14} />} Aktuelles Sortiment übernehmen</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              {rows.filter((r) => r.active).length} sichtbar · {rows.length} gesamt · zum Sortieren am <GripVertical size={12} style={{ verticalAlign: "-2px" }} /> ziehen
              {saveState === "saving" && <span style={{ marginLeft: 8 }}><Loader2 size={12} style={{ verticalAlign: "-2px" }} /> speichert…</span>}
              {saveState === "saved" && <span style={{ marginLeft: 8, color: "#27500A" }}><Check size={12} style={{ verticalAlign: "-2px" }} /> gespeichert</span>}
            </span>
            <button onClick={create} style={btnDark}><Plus size={14} /> Neues Produkt</button>
          </div>
          <div className="pa-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 360px)", gap: 16, alignItems: "start" }}>
            <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 8, userSelect: dragId ? "none" : undefined }}>
              {rows.map((r) => {
                const d = r.data || {};
                const st = statusOf(d);
                const dragging = dragId === r.id;
                return (
                  <div key={r.id} data-row
                    style={{ ...card, padding: "8px 10px", display: "flex", alignItems: "center", gap: 10, opacity: r.active ? 1 : 0.55,
                      boxShadow: dragging ? "0 10px 24px rgba(0,0,0,0.18)" : "none", borderColor: dragging ? "#A85A32" : "#D3D7DD",
                      transform: dragging ? "scale(1.01)" : "none", transition: "box-shadow .12s, transform .12s", background: "#fff" }}>
                    <span onPointerDown={(e) => startDrag(e, r.id)} title="Ziehen zum Sortieren" aria-label="Ziehen zum Sortieren"
                      style={{ cursor: dragging ? "grabbing" : "grab", color: "#9CA3AF", padding: "6px 2px", touchAction: "none", display: "flex" }}>
                      <GripVertical size={18} />
                    </span>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: d.images?.length ? "#F7F4EF" : d.hue, flexShrink: 0 }}>
                      {d.images?.[0] && <img src={d.images[0]} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {euro(d.price)} · <span style={{ background: st.bg, color: st.color, borderRadius: 999, padding: "1px 8px" }}>{st.label.replace(" (bestellbar)", "")}</span>{!r.active && " · ausgeblendet"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => toggle(r)} style={{ ...btn, padding: "6px 7px" }} aria-label={r.active ? "Ausblenden" : "Einblenden"} title={r.active ? "Im Shop ausblenden" : "Im Shop einblenden"}>{r.active ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                      <button onClick={() => setEditing(r)} style={btn}><Pencil size={13} /> <span className="pa-hide-sm">Bearbeiten</span></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pa-preview" style={{ position: "sticky", top: 16 }}>
              <ShopPreview rows={rows} highlight={dragId} />
            </div>
          </div>
          <style>{`
            @media (max-width: 760px) {
              .pa-layout { grid-template-columns: 1fr !important; }
              .pa-preview { position: static !important; order: -1; }
              .pa-hide-sm { display: none; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
