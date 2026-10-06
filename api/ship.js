// Vercel Serverless Function: Bestellung als verschickt markieren und Kunden mit Sendungsnummer informieren.
// Nur für den eingeloggten Shop-Betreiber (Supabase-Login aus dem Dashboard wird geprüft).
// Benötigt SUPABASE_SERVICE_ROLE_KEY und BREVO_API_KEY.

const SENDER = { name: "SuchyPrints", email: "christoph.suchy@suchyprints.at" };
const CARRIERS = {
  post: { label: "Österreichische Post", url: (n) => `https://www.post.at/s/sendungsdetails?snr=${encodeURIComponent(n)}` },
  dhl: { label: "DHL", url: (n) => `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${encodeURIComponent(n)}` },
  dpd: { label: "DPD", url: (n) => `https://tracking.dpd.de/status/de_DE/parcel/${encodeURIComponent(n)}` },
  gls: { label: "GLS", url: (n) => `https://gls-group.com/AT/de/paket-verfolgen?match=${encodeURIComponent(n)}` },
  hermes: { label: "Hermes", url: (n) => `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation#${encodeURIComponent(n)}` },
  ohne: { label: "Brief / ohne Sendungsnummer", url: null },
};
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY } = process.env;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://opsbjglkegoyoeqmpxxa.supabase.co";
  if (!SUPABASE_SERVICE_ROLE_KEY || !BREVO_API_KEY) return res.status(500).json({ error: "not_configured" });

  // Login prüfen
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "unauthorized" });
  const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` } });
  if (!who.ok) return res.status(401).json({ error: "unauthorized" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const orderId = String(body?.orderId || "");
  const carrierKey = CARRIERS[body?.carrier] ? body.carrier : "post";
  const tracking = String(body?.tracking || "").trim().slice(0, 60);
  const notify = body?.notify !== false;
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return res.status(400).json({ error: "invalid_order" });
  if (carrierKey !== "ohne" && !tracking) return res.status(400).json({ error: "tracking_missing" });

  const db = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" };
  const upd = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: "PATCH",
    headers: { ...db, Prefer: "return=representation" },
    body: JSON.stringify({ status: "verschickt", tracking_number: tracking || null, carrier: CARRIERS[carrierKey].label, shipped_at: new Date().toISOString() }),
  });
  if (!upd.ok) {
    console.error("Status-Update fehlgeschlagen", upd.status, await upd.text());
    return res.status(502).json({ error: "db_error" });
  }
  const [order] = await upd.json();
  if (!order) return res.status(404).json({ error: "order_not_found" });
  if (!notify) return res.status(200).json({ ok: true, mailed: false });

  const c = CARRIERS[carrierKey];
  const link = c.url && tracking ? c.url(tracking) : null;
  const firstName = esc(String(order.customer_name || "").trim().split(/\s+/)[0] || "");
  const items = (Array.isArray(order.items) ? order.items : []).filter((i) => !String(i.name).startsWith("Versand"))
    .map((i) => `<li>${esc(i.qty)}× ${esc(i.name)}</li>`).join("");
  const html = `<div style="background:#F7F4EF;padding:28px 12px;font-family:Arial,sans-serif;color:#2B2E4A;"><div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;padding:28px 24px;font-size:15px;line-height:1.6;">
<div style="font-size:22px;font-weight:bold;margin-bottom:4px;">SuchyPrints</div>
<div style="font-size:18px;font-weight:bold;margin:18px 0 10px;">Dein Paket ist unterwegs${firstName ? ", " + firstName : ""}! 📦</div>
<p>Deine Bestellung wurde gerade verschickt${c.url ? ` mit ${esc(c.label)}` : ""}.</p>
${items ? `<ul style="padding-left:18px;margin:10px 0 16px;">${items}</ul>` : ""}
${tracking ? `<p style="margin:0 0 6px;">Sendungsnummer: <strong>${esc(tracking)}</strong></p>` : ""}
${link ? `<p style="margin:18px 0;"><a href="${esc(link)}" style="display:inline-block;background:#2B2E4A;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px;">Sendung verfolgen</a></p>` : ""}
${order.review_token ? `<p style="font-size:14px;">Wenn alles angekommen ist, freuen wir uns riesig über deine <a href="https://suchyprints.at/bewertung/${esc(order.review_token)}" style="color:#A85A32;">Bewertung</a> – gern mit Foto!</p>` : ""}
<p style="font-size:14px;">Fragen? Antworte einfach auf diese Mail.</p>
<p style="font-size:12px;color:#9A9AA2;border-top:1px solid #EEE;padding-top:14px;margin-top:20px;">SuchyPrints · Christoph Suchy · Murgasse 3, 8121 Deutschfeistritz, Österreich · <a href="https://suchyprints.at" style="color:#9A9AA2;">suchyprints.at</a></p></div></div>`;
  const mail = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: SENDER, replyTo: SENDER, to: [{ email: order.customer_email, name: order.customer_name || undefined }], subject: "Deine SuchyPrints-Bestellung ist unterwegs", htmlContent: html, tags: ["versand"] }),
  });
  if (!mail.ok) {
    console.error("Versand-Mail fehlgeschlagen", mail.status, await mail.text());
    return res.status(200).json({ ok: true, mailed: false, error: "mail_error" });
  }
  return res.status(200).json({ ok: true, mailed: true });
}
