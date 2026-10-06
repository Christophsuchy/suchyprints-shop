import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { btn, inp, card } from "./ui";
import { Mail, FileBox, Image as ImageIcon, ExternalLink, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export const REQUEST_STATUS = [
  { id: "offen", label: "Offen", bg: "#FAEEDA", color: "#854F0B" },
  { id: "angebot", label: "Angebot geschickt", bg: "#E3ECFB", color: "#1F4A9A" },
  { id: "angenommen", label: "Angenommen", bg: "#EDE4FA", color: "#5B2A9A" },
  { id: "erledigt", label: "Erledigt", bg: "#EAF3DE", color: "#27500A" },
  { id: "abgelehnt", label: "Abgelehnt", bg: "#EEEFF1", color: "#4B5563" },
];
const DETAIL_LABELS = { size: "Maße", color: "Farbe(n)", material: "Material", quantity: "Stückzahl", deadline: "Bis wann", link: "Link" };

function RequestCard({ r, onChange }) {
  const [open, setOpen] = useState(r.status === "offen");
  const [note, setNote] = useState(r.note || "");
  const st = REQUEST_STATUS.find((s) => s.id === r.status) || REQUEST_STATUS[0];

  const [links, setLinks] = useState({});
  useEffect(() => {
    if (!open || !(r.files || []).length) return;
    let alive = true;
    Promise.all(r.files.map((f) =>
      supabase.storage.from("request-files")
        .createSignedUrl(f.path, 3600, /\.(jpe?g|png|gif|pdf)$/i.test(f.name) ? undefined : { download: f.name })
        .then(({ data }) => [f.path, data?.signedUrl])
    )).then((pairs) => alive && setLinks(Object.fromEntries(pairs)));
    return () => { alive = false; };
  }, [open, r.files]);
  const setStatus = async (status) => { await supabase.from("requests").update({ status }).eq("id", r.id); onChange(); };
  const saveNote = async () => { if (note !== (r.note || "")) await supabase.from("requests").update({ note }).eq("id", r.id); };
  const remove = async () => {
    if (!window.confirm("Anfrage endgültig löschen?")) return;
    const paths = (r.files || []).map((f) => f.path);
    if (paths.length) await supabase.storage.from("request-files").remove(paths);
    await supabase.from("requests").delete().eq("id", r.id);
    onChange();
  };
  const details = Object.entries(r.details || {}).filter(([, v]) => v);

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14.5 }}>{r.name} <span style={{ fontWeight: 400, color: "#6B7280", fontSize: 13 }}>· {r.kind}</span></p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#6B7280" }}>{new Date(r.created_at).toLocaleString("de-AT")}{(r.files || []).length ? ` · ${(r.files || []).length} Datei(en)` : ""}</p>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, padding: "4px 10px", borderRadius: 999, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>{st.label}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 12, borderTop: "1px solid #EDEEF1", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-line" }}>{r.description}</p>
          {details.length > 0 && (
            <table style={{ fontSize: 13, borderCollapse: "collapse" }}><tbody>
              {details.map(([k, v]) => (
                <tr key={k}><td style={{ color: "#6B7280", padding: "2px 12px 2px 0", verticalAlign: "top" }}>{DETAIL_LABELS[k] || k}</td>
                  <td style={{ padding: "2px 0", wordBreak: "break-word" }}>{k === "link" && /^https?:\/\//i.test(v) ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : v}</td></tr>
              ))}
            </tbody></table>
          )}
          {(r.files || []).length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {r.files.map((f) => (
                <a key={f.path} href={links[f.path] || undefined} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none", opacity: links[f.path] ? 1 : 0.5 }}>
                  {/\.(jpe?g|png|gif)$/i.test(f.name) ? <ImageIcon size={13} /> : <FileBox size={13} />} {f.name} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>Interne Notiz</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} rows={2} placeholder="z. B. Angebot 24 € geschickt am …" style={{ ...inp, resize: "vertical", marginTop: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <a href={`mailto:${r.email}?subject=${encodeURIComponent("Deine Anfrage bei SuchyPrints")}`} style={{ ...btn, textDecoration: "none" }}><Mail size={13} /> {r.email}</a>
            <select value={r.status} onChange={(e) => setStatus(e.target.value)} style={{ ...inp, width: "auto" }}>
              {REQUEST_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button onClick={remove} style={{ ...btn, color: "#A32D2D", marginLeft: "auto" }}><Trash2 size={13} /> Löschen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestsAdmin({ onCount }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("aktiv");
  const load = async () => {
    const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    if (error) { setErr(error.message); setRows([]); return; }
    setErr("");
    setRows(data);
    onCount?.(data.filter((r) => r.status === "offen").length);
  };
  useEffect(() => { load(); }, []);

  if (!rows) return <p style={{ color: "#6B7280" }}>Lädt…</p>;
  if (err) return <div style={card}><p style={{ margin: 0, fontSize: 14 }}>{/relation|does not exist|schema cache/i.test(err) ? "Die Anfragen-Tabelle fehlt noch in der Datenbank. Bitte zuerst den SQL-Schritt ausführen." : err}</p></div>;
  const shown = rows.filter((r) => filter === "alle" || !["erledigt", "abgelehnt"].includes(r.status));
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["aktiv", "Offene & laufende"], ["alle", "Alle"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ ...btn, background: filter === id ? "#1B1D21" : "#fff", color: filter === id ? "#fff" : "#1B1D21" }}>{label}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p style={{ color: "#6B7280" }}>{rows.length ? "Keine offenen Anfragen." : "Noch keine Anfragen. Neue kommen über suchyprints.at/anfrage rein."}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map((r) => <RequestCard key={r.id + r.status} r={r} onChange={load} />)}
        </div>
      )}
    </div>
  );
}
