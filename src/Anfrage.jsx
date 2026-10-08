import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, X, Send, Loader2, Check, FileBox, Image as ImageIcon } from "lucide-react";
import ReferenceGallery from "./ReferenceGallery";

const KINDS = ["Ersatzteil nach Foto oder Maß", "Eigenes 3D-Modell drucken (STL/3MF)", "Personalisiertes Geschenk", "Etwas anderes"];
const MATERIALS = ["Egal / Empfehlung", "PLA", "PETG (robuster, hitzebeständiger)", "TPU (flexibel)"];
const MODEL_RE = /\.(stl|3mf|obj|step|stp|f3d)$/i;
const IMG_RE = /\.(jpe?g|png|heic|heif|webp|gif)$/i;
const MAX_TOTAL = 3.2 * 1024 * 1024; // Platz im Upload nach Komprimierung

const card = { background: "#fff", border: "1px solid #E4DFD6", borderRadius: 16, padding: "22px 20px", marginBottom: 16 };
const field = { width: "100%", border: "1px solid #D9D2C8", borderRadius: 10, padding: "11px 14px", fontSize: 14.5, fontFamily: "'Inter', sans-serif", outline: "none", background: "#fff", color: "#2B2E4A" };
const label = { display: "block", fontSize: 13, fontWeight: 600, margin: "0 0 7px" };

const toBase64 = (buf) => {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
    return { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", data: await blob.arrayBuffer(), gzip: false };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function gzipFile(file) {
  const stream = file.stream().pipeThrough(new CompressionStream("gzip"));
  return { name: file.name, data: await new Response(stream).arrayBuffer(), gzip: true };
}

export default function Anfrage() {
  const location = useLocation();
  const [f, setF] = useState({
    name: "", email: "", kind: location.state?.kind || KINDS[0], description: location.state?.prefill || "",
    size: "", color: "", material: MATERIALS[0], quantity: "1", deadline: "", link: "",
  });
  const [files, setFiles] = useState([]); // { name, data, gzip, kind }
  const [busy, setBusy] = useState(false);
  const [prep, setPrep] = useState(false);
  const [hp, setHp] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const total = files.reduce((s, x) => s + x.data.byteLength, 0);

  const addFiles = async (list) => {
    setError("");
    setPrep(true);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= 6) { setError("Maximal 6 Dateien."); break; }
      try {
        let item = null;
        if (MODEL_RE.test(file.name)) item = { ...(await gzipFile(file)), kind: "model" };
        else if (/\.pdf$/i.test(file.name)) item = { name: file.name, data: await file.arrayBuffer(), gzip: false, kind: "doc" };
        else if (IMG_RE.test(file.name) || file.type.startsWith("image/")) item = { ...(await shrinkImage(file)), kind: "image" };
        else { setError(`„${file.name}“ wird nicht unterstützt (Fotos, PDF, STL, 3MF, OBJ, STEP).`); continue; }
        if (next.reduce((s, x) => s + x.data.byteLength, 0) + item.data.byteLength > MAX_TOTAL) {
          setError(`„${file.name}“ ist zu groß. Lade größere Dateien z. B. bei WeTransfer oder Google Drive hoch und füg unten den Link ein.`);
          continue;
        }
        next.push(item);
      } catch {
        setError(`„${file.name}“ konnte nicht gelesen werden. Bei iPhone-Fotos (HEIC) hilft es, sie als JPG zu exportieren.`);
      }
    }
    setFiles(next);
    setPrep(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!f.name.trim() || !f.email.trim() || f.description.trim().length < 10) {
      setError("Bitte Name, E-Mail und eine kurze Beschreibung (mind. 10 Zeichen) angeben.");
      return;
    }
    if (!consent) { setError("Bitte bestätige den Datenschutz-Hinweis."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, website: hp, files: files.map((x) => ({ name: x.name, gzip: x.gzip, content: toBase64(x.data) })) }),
      });
      if (r.status === 400) throw new Error("input");
      if (!r.ok) throw new Error("server");
      setSent(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message === "input"
        ? "Bitte prüf deine Angaben (E-Mail-Adresse, Beschreibung)."
        : "Senden hat leider nicht geklappt. Bitte später erneut versuchen oder direkt an christoph.suchy@suchyprints.at schreiben.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F7F4EF", color: "#2B2E4A" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#7A7A82", fontSize: 13.5, textDecoration: "none", marginBottom: 26 }}>
          <ArrowLeft size={15} /> Zurück zum Shop
        </Link>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, margin: "0 0 8px" }}>Nach deiner Idee</h1>
        <p style={{ color: "#5C5763", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
          Ersatzteil, eigenes Modell oder eine Idee im Kopf? Beschreib uns, was du brauchst – gern mit Fotos oder 3D-Datei.
          Wir melden uns in der Regel innerhalb von 1–2 Werktagen mit Einschätzung und Preis. Die Anfrage ist unverbindlich.
        </p>

        {!sent && <ReferenceGallery />}

        {sent ? (
          <div style={{ ...card, textAlign: "center", padding: "36px 24px" }}>
            <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(15,110,86,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Check size={26} color="#0F6E56" />
            </div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 21, margin: "0 0 8px" }}>Anfrage ist da – danke!</p>
            <p style={{ color: "#7A7A82", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>Du bekommst gleich eine Bestätigung per E-Mail. Wir melden uns bald bei dir.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={card}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                <div><label style={label}>Name *</label><input value={f.name} onChange={set("name")} maxLength={80} style={field} /></div>
                <div><label style={label}>E-Mail *</label><input type="email" value={f.email} onChange={set("email")} maxLength={254} style={field} /></div>
              </div>
              <label style={{ ...label, marginTop: 16 }}>Worum geht's?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {KINDS.map((k) => (
                  <button key={k} type="button" onClick={() => setF((x) => ({ ...x, kind: k }))} aria-pressed={f.kind === k}
                    style={{ fontSize: 13.5, padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                      background: f.kind === k ? "#2B2E4A" : "#fff", color: f.kind === k ? "#fff" : "#2B2E4A", border: f.kind === k ? "1px solid #2B2E4A" : "1px solid #D9D2C8" }}>
                    {k}
                  </button>
                ))}
              </div>
              <label style={{ ...label, marginTop: 16 }}>Beschreibung *</label>
              <textarea value={f.description} onChange={set("description")} rows={5} maxLength={3000}
                placeholder="Was soll gedruckt werden? Wofür wird es verwendet? Muss es etwas aushalten (Hitze, Gewicht, Wasser)?"
                style={{ ...field, resize: "vertical" }} />
            </div>

            <div style={card}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <div><label style={label}>Maße (ca.)</label><input value={f.size} onChange={set("size")} maxLength={120} placeholder="z. B. 8 × 4 × 2 cm" style={field} /></div>
                <div><label style={label}>Wunschfarbe(n)</label><input value={f.color} onChange={set("color")} maxLength={120} placeholder="z. B. Schwarz" style={field} /></div>
                <div>
                  <label style={label}>Material</label>
                  <select value={f.material} onChange={set("material")} style={field}>{MATERIALS.map((m) => <option key={m}>{m}</option>)}</select>
                </div>
                <div><label style={label}>Stückzahl</label><input value={f.quantity} onChange={set("quantity")} maxLength={10} inputMode="numeric" style={field} /></div>
                <div><label style={label}>Bis wann? (optional)</label><input value={f.deadline} onChange={set("deadline")} maxLength={60} placeholder="z. B. vor Weihnachten" style={field} /></div>
              </div>
            </div>

            <div style={card}>
              <label style={label}>Fotos, Skizzen oder 3D-Dateien</label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: "2px dashed #D9D2C8", borderRadius: 14, padding: "26px 16px", cursor: "pointer", textAlign: "center", background: "#FBFAF7" }}
              >
                {prep ? <Loader2 size={22} color="#A85A32" className="an-spin" /> : <Upload size={22} color="#A85A32" />}
                <span style={{ fontSize: 14, fontWeight: 600 }}>Dateien auswählen oder hierher ziehen</span>
                <span style={{ fontSize: 12, color: "#7A7A82" }}>Fotos (JPG, PNG), PDF, STL, 3MF, OBJ, STEP · bis zu 6 Dateien</span>
                <input type="file" multiple accept="image/*,.pdf,.stl,.3mf,.obj,.step,.stp,.f3d" style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </label>
              {files.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {files.map((x, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, background: "#F7F4EF", borderRadius: 10, padding: "8px 12px" }}>
                      {x.kind === "model" ? <FileBox size={16} color="#A85A32" /> : <ImageIcon size={16} color="#A85A32" />}
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</span>
                      <span style={{ color: "#7A7A82", fontSize: 12 }}>{(x.data.byteLength / 1024 / 1024).toFixed(1)} MB</span>
                      <button type="button" aria-label={`${x.name} entfernen`} onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7A82", padding: 2 }}><X size={15} /></button>
                    </div>
                  ))}
                  <span style={{ fontSize: 11.5, color: "#7A7A82" }}>{Math.round((total / MAX_TOTAL) * 100)} % des Upload-Platzes belegt</span>
                </div>
              )}
              <label style={{ ...label, marginTop: 16 }}>Link zu größeren Dateien (optional)</label>
              <input value={f.link} onChange={set("link")} maxLength={500} placeholder="z. B. WeTransfer, Google Drive, Printables" style={field} />
            </div>

            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "#5C5763", lineHeight: 1.5, margin: "4px 0 16px", cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: "#A85A32", flexShrink: 0 }} />
              <span>Ich bin einverstanden, dass meine Angaben und Dateien zur Bearbeitung meiner Anfrage verwendet werden. Mehr in der <Link to="/datenschutz" style={{ color: "#A85A32" }}>Datenschutzerklärung</Link>.</span>
            </label>
            {error && <p style={{ color: "#A32D2D", fontSize: 13.5, margin: "0 0 14px" }}>{error}</p>}
            <button type="submit" disabled={busy || prep}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #C97A4E, #82431F)", color: "#fff", border: "none", borderRadius: 999, padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy || prep ? 0.7 : 1 }}>
              {busy ? <Loader2 size={16} className="an-spin" /> : <Send size={15} />} {busy ? "Wird gesendet …" : "Anfrage senden"}
            </button>
          </form>
        )}
      </div>
      <style>{`.an-spin{animation:an-spin .8s linear infinite}@keyframes an-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
