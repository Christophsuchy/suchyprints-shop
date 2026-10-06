// Vercel Serverless Function: trägt eine E-Mail-Adresse per Double-Opt-in bei Brevo ein.
// Benötigte Umgebungsvariablen (Vercel → Project → Settings → Environment Variables):
//   BREVO_API_KEY          – API-Schlüssel aus Brevo (SMTP & API → API-Schlüssel)
//   BREVO_LIST_ID          – ID der Kontaktliste, z. B. 3
//   BREVO_DOI_TEMPLATE_ID  – ID der Double-Opt-in-Vorlage in Brevo
//   BREVO_REDIRECT_URL     – (optional) Seite nach dem Bestätigen, Standard: https://suchyprints.at/?newsletter=bestaetigt

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, BREVO_REDIRECT_URL } = process.env;
  if (!BREVO_API_KEY || !BREVO_LIST_ID || !BREVO_DOI_TEMPLATE_ID) {
    console.error("Brevo-Umgebungsvariablen fehlen");
    return res.status(500).json({ error: "not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = String(body?.email || "").trim().toLowerCase();
  // Honeypot-Feld: echte Besucher füllen es nie aus
  if (body?.website) return res.status(200).json({ ok: true });
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: "invalid_email" });
  }

  try {
    const r = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        email,
        includeListIds: [Number(BREVO_LIST_ID)],
        templateId: Number(BREVO_DOI_TEMPLATE_ID),
        redirectionUrl: BREVO_REDIRECT_URL || "https://suchyprints.at/?newsletter=bestaetigt",
      }),
    });
    if (r.ok || r.status === 204) return res.status(200).json({ ok: true });
    const detail = await r.text();
    console.error("Brevo-Fehler", r.status, detail);
    // Bereits eingetragene Kontakte nicht als Fehler anzeigen
    if (r.status === 400 && /already|exist/i.test(detail)) return res.status(200).json({ ok: true });
    return res.status(502).json({ error: "brevo_error" });
  } catch (err) {
    console.error("Brevo nicht erreichbar", err);
    return res.status(502).json({ error: "brevo_unreachable" });
  }
}
