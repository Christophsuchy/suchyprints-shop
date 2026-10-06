// Vercel Serverless Function: schickt dem Kunden nach erfolgreicher Zahlung eine Bestellbestätigung über Brevo.
// Die Bestelldaten werden NICHT vom Browser übernommen, sondern direkt aus Supabase gelesen –
// so kann niemand über diese Schnittstelle beliebige Mails verschicken.
// Benötigte Umgebungsvariablen (Vercel):
//   BREVO_API_KEY               – bereits vorhanden
//   SUPABASE_SERVICE_ROLE_KEY   – Supabase → Project Settings → API Keys → service_role (geheim!)
//   SUPABASE_URL                – optional, Standard: https://opsbjglkegoyoeqmpxxa.supabase.co

const SENDER = { name: "SuchyPrints", email: "christoph.suchy@suchyprints.at" };
const MAX_AGE_MINUTES = 30;

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const euro = (n) => Number(n || 0).toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function buildHtml(order, shippingInfo) {
  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items
    .map(
      (i) => `<tr><td style="padding:6px 0;font-size:14px;">${esc(i.qty)}× ${esc(i.name)}</td>
        <td style="padding:6px 0;font-size:14px;text-align:right;white-space:nowrap;">${euro(Number(i.qty) * Number(i.price))}</td></tr>`
    )
    .join("");
  const firstName = esc(String(order.customer_name || "").trim().split(/\s+/)[0] || "");
  const address = shippingInfo
    ? `<tr><td style="font-size:14px;line-height:1.6;padding-bottom:20px;"><strong>Lieferadresse</strong><br>${esc(shippingInfo).replace(/\n/g, "<br>")}</td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F4EF;font-family:Arial,Helvetica,sans-serif;color:#2B2E4A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EF;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;padding:32px 28px;">
<tr><td style="font-size:22px;font-weight:bold;padding-bottom:4px;">SuchyPrints</td></tr>
<tr><td style="font-size:13px;color:#7A7A82;padding-bottom:24px;">Handgefertigte 3D-Drucke aus der Steiermark</td></tr>
<tr><td style="font-size:18px;font-weight:bold;padding-bottom:10px;">Danke für deine Bestellung${firstName ? ", " + firstName : ""}!</td></tr>
<tr><td style="font-size:15px;line-height:1.6;padding-bottom:20px;">Wir haben deine Bestellung und deine Zahlung erhalten. Deine Teile werden jetzt gedruckt und in der Regel innerhalb von 2–4 Werktagen verschickt.</td></tr>
<tr><td style="padding-bottom:6px;font-size:13px;color:#7A7A82;">Bestellnummer: ${esc(order.id)}<br>PayPal-Transaktion: ${esc(order.paypal_transaction_id)}</td></tr>
<tr><td style="padding:12px 0 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #EEE;border-bottom:1px solid #EEE;">
${rows}
<tr><td style="padding:10px 0 6px;font-size:15px;font-weight:bold;border-top:1px solid #EEE;">Gesamt (bezahlt)</td><td style="padding:10px 0 6px;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #EEE;">${euro(order.total)}</td></tr>
</table>
<p style="font-size:12px;color:#7A7A82;margin:8px 0 0;">Gemäß § 6 Abs. 1 Z 27 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).</p></td></tr>
${address}
<tr><td style="font-size:13px;line-height:1.6;color:#2B2E4A;padding-bottom:20px;">Es gelten unsere <a href="https://suchyprints.at/agb" style="color:#A85A32;">AGB</a>. Informationen zu deinem <a href="https://suchyprints.at/widerruf" style="color:#A85A32;">Widerrufsrecht</a> und das Muster-Widerrufsformular findest du auf unserer Website. Bei Fragen antworte einfach auf diese Mail.</td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#9A9AA2;padding-top:20px;border-top:1px solid #EEE;">SuchyPrints · Christoph Suchy · Murgasse 3, 8121 Deutschfeistritz, Österreich<br><a href="https://suchyprints.at" style="color:#9A9AA2;">suchyprints.at</a> · christoph.suchy@suchyprints.at</td></tr>
</table></td></tr></table></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { BREVO_API_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://opsbjglkegoyoeqmpxxa.supabase.co";
  if (!BREVO_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Umgebungsvariablen für Bestellbestätigung fehlen");
    return res.status(500).json({ error: "not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const orderId = String(body?.orderId || "").trim();
  const transactionId = String(body?.transactionId || "").trim();
  const shippingInfo = String(body?.shippingInfo || "").slice(0, 400);
  if (!orderId || !transactionId || orderId.length > 64 || transactionId.length > 64) {
    return res.status(400).json({ error: "invalid_request" });
  }

  try {
    const q = new URLSearchParams({
      select: "id,customer_name,customer_email,items,total,paypal_transaction_id,created_at",
      id: `eq.${orderId}`,
      paypal_transaction_id: `eq.${transactionId}`,
      limit: "1",
    });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?${q}`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    if (!r.ok) {
      console.error("Supabase-Fehler", r.status, await r.text());
      return res.status(502).json({ error: "db_error" });
    }
    const [order] = await r.json();
    if (!order) return res.status(404).json({ error: "order_not_found" });
    const ageMin = (Date.now() - new Date(order.created_at).getTime()) / 60000;
    if (!(ageMin >= -5 && ageMin <= MAX_AGE_MINUTES)) return res.status(410).json({ error: "too_old" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(order.customer_email || "")) return res.status(400).json({ error: "bad_email" });

    const mail = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: SENDER,
        replyTo: SENDER,
        to: [{ email: order.customer_email, name: order.customer_name || undefined }],
        subject: "Deine Bestellung bei SuchyPrints",
        htmlContent: buildHtml(order, shippingInfo),
        tags: ["bestellbestaetigung"],
      }),
    });
    if (!mail.ok) {
      console.error("Brevo-Fehler", mail.status, await mail.text());
      return res.status(502).json({ error: "mail_error" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Bestellbestätigung fehlgeschlagen", err);
    return res.status(502).json({ error: "unexpected" });
  }
}
