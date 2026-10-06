// Vercel Serverless Function: Anfrage für individuelle Drucke (mit Dateien).
// Schickt die Anfrage samt Anhängen per Brevo an SuchyPrints und eine Eingangsbestätigung an den Kunden.
// Fotos werden im Browser verkleinert, 3D-Dateien im Browser gzip-komprimiert und hier als ZIP angehängt
// (Brevo erlaubt keine .stl/.3mf-Anhänge direkt).
import { gunzipSync, deflateRawSync } from "node:zlib";


const OWNER = { name: "SuchyPrints", email: "christoph.suchy@suchyprints.at" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IMG_EXT = /\.(jpe?g|png|gif|pdf)$/i;
const MODEL_EXT = /\.(stl|3mf|obj|step|stp|f3d)$/i;

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

// --- minimaler ZIP-Writer (Deflate) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function makeZip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf8");
    const comp = deflateRawSync(f.data, { level: 9 });
    const crc = crc32(f.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
    lh.writeUInt32LE(0, 10); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(f.data.length, 22);
    lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, name, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt32LE(0, 12); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(f.data.length, 24);
    ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);
    offset += lh.length + name.length + comp.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

async function sendMail(key, payload) {
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${await r.text()}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { BREVO_API_KEY } = process.env;
  if (!BREVO_API_KEY) return res.status(500).json({ error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (body?.website) return res.status(200).json({ ok: true }); // Honeypot

  const d = {
    name: clip(body?.name, 80),
    email: clip(body?.email, 254).toLowerCase(),
    kind: clip(body?.kind, 60),
    description: clip(body?.description, 3000),
    size: clip(body?.size, 120),
    color: clip(body?.color, 120),
    material: clip(body?.material, 40),
    quantity: clip(body?.quantity, 10),
    deadline: clip(body?.deadline, 60),
    link: clip(body?.link, 500),
  };
  if (!d.name || !EMAIL_RE.test(d.email) || d.description.length < 10) return res.status(400).json({ error: "invalid_input" });

  // Dateien: Bilder/PDF direkt, 3D-Modelle (gzip) gesammelt als ZIP
  const attachments = [];
  const models = [];
  const stored = [];
  try {
    for (const f of (Array.isArray(body?.files) ? body.files : []).slice(0, 6)) {
      const name = clip(f?.name, 100).replace(/[\\/:*?"<>|]/g, "_");
      const buf = Buffer.from(String(f?.content || ""), "base64");
      if (!name || !buf.length) continue;
      if (f.gzip && MODEL_EXT.test(name)) {
        const raw = gunzipSync(buf, { maxOutputLength: 60 * 1024 * 1024 });
        models.push({ name, data: raw });
        stored.push({ name, data: raw, type: "application/octet-stream" });
      } else if (IMG_EXT.test(name)) {
        attachments.push({ name, content: buf.toString("base64") });
        stored.push({ name, data: buf, type: /\.pdf$/i.test(name) ? "application/pdf" : /\.png$/i.test(name) ? "image/png" : /\.gif$/i.test(name) ? "image/gif" : "image/jpeg" });
      }
    }
    if (models.length) attachments.push({ name: "3D-Dateien.zip", content: makeZip(models).toString("base64") });
  } catch (err) {
    console.error("Dateien konnten nicht verarbeitet werden", err);
    return res.status(400).json({ error: "bad_files" });
  }

  // Anfrage zusätzlich in der Datenbank speichern (für die Übersicht im Dashboard).
  // Schlägt das fehl, wird trotzdem gemailt.
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://opsbjglkegoyoeqmpxxa.supabase.co";
  if (SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const auth = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` };
      const requestId = crypto.randomUUID();
      const fileList = [];
      for (const [i, f] of stored.entries()) {
        const path = `${requestId}/${i + 1}-${f.name.replace(/[^\w.\-]+/g, "_")}`;
        const up = await fetch(`${SUPABASE_URL}/storage/v1/object/request-files/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
          method: "POST",
          headers: { ...auth, "content-type": f.type },
          body: f.data,
        });
        if (up.ok) fileList.push({ name: f.name, path, size: f.data.length });
        else console.error("Datei-Upload fehlgeschlagen", up.status, await up.text());
      }
      const ins = await fetch(`${SUPABASE_URL}/rest/v1/requests`, {
        method: "POST",
        headers: { ...auth, "content-type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          id: requestId, name: d.name, email: d.email, kind: d.kind, description: d.description,
          details: { size: d.size, color: d.color, material: d.material, quantity: d.quantity, deadline: d.deadline, link: d.link },
          files: fileList, status: "offen",
        }),
      });
      if (!ins.ok) console.error("Anfrage speichern fehlgeschlagen", ins.status, await ins.text());
    } catch (err) {
      console.error("Anfrage speichern fehlgeschlagen", err);
    }
  }

  const rows = [
    ["Name", d.name], ["E-Mail", d.email], ["Art der Anfrage", d.kind], ["Maße", d.size], ["Farbe(n)", d.color],
    ["Material", d.material], ["Stückzahl", d.quantity], ["Wunschtermin", d.deadline], ["Link zu Dateien", d.link],
  ].filter(([, v]) => v);
  const table = rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#7A7A82;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;">${esc(v)}</td></tr>`).join("");
  const descHtml = esc(d.description).replace(/\n/g, "<br>");
  const fileNote = attachments.length ? `<p style="font-size:13px;color:#7A7A82;">Anhänge: ${attachments.map((a) => esc(a.name)).join(", ")}${models.length ? ` (enthält ${models.map((m) => esc(m.name)).join(", ")})` : ""}</p>` : "";

  try {
    await sendMail(BREVO_API_KEY, {
      sender: OWNER,
      to: [OWNER],
      replyTo: { email: d.email, name: d.name },
      subject: `Neue Anfrage: ${d.kind || "Individueller Druck"} – ${d.name}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;color:#2B2E4A;font-size:14px;line-height:1.6;"><h2 style="margin:0 0 12px;">Neue individuelle Anfrage</h2><table style="font-size:14px;border-collapse:collapse;">${table}</table><h3 style="margin:18px 0 6px;">Beschreibung</h3><p>${descHtml}</p>${fileNote}<p style="font-size:12px;color:#9A9AA2;">Einfach auf diese Mail antworten, um dem Kunden zu schreiben.</p></div>`,
      ...(attachments.length ? { attachment: attachments } : {}),
      tags: ["anfrage"],
    });
    await sendMail(BREVO_API_KEY, {
      sender: OWNER,
      replyTo: OWNER,
      to: [{ email: d.email, name: d.name }],
      subject: "Deine Anfrage bei SuchyPrints",
      htmlContent: `<div style="background:#F7F4EF;padding:28px 12px;font-family:Arial,sans-serif;color:#2B2E4A;"><div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;padding:28px 24px;font-size:15px;line-height:1.6;">
<div style="font-size:20px;font-weight:bold;margin-bottom:14px;">Danke für deine Anfrage, ${esc(d.name.split(/\s+/)[0])}!</div>
<p>Wir haben deine Anfrage erhalten und schauen sie uns genau an. In der Regel melden wir uns innerhalb von 1–2 Werktagen mit einer Einschätzung und einem Preis.</p>
<p style="font-size:13px;color:#7A7A82;margin-top:18px;">Deine Angaben:</p><table style="font-size:13px;border-collapse:collapse;">${table}</table>
<p style="font-size:13px;color:#7A7A82;margin-top:12px;">${descHtml}</p>
<p>Du willst noch etwas ergänzen? Antworte einfach auf diese Mail – gern auch mit weiteren Fotos.</p>
<p style="font-size:12px;color:#9A9AA2;border-top:1px solid #EEE;padding-top:14px;margin-top:20px;">SuchyPrints · Christoph Suchy · Murgasse 3, 8121 Deutschfeistritz, Österreich · <a href="https://suchyprints.at" style="color:#9A9AA2;">suchyprints.at</a></p></div></div>`,
      tags: ["anfrage-bestaetigung"],
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Anfrage-Mail fehlgeschlagen", err);
    return res.status(502).json({ error: "mail_error" });
  }
}
