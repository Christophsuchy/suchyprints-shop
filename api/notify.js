// Vercel Serverless Function: "Benachrichtige mich, wenn verfügbar" für einzelne Produkte.
// Legt in Brevo pro Produkt automatisch eine Liste "Produkt: <Name> (pXX)" an und trägt die
// Adresse per Double-Opt-in dort (und in der allgemeinen Warteliste) ein.
// Zum Verfügbarkeits-Start einfach in Brevo eine Kampagne an die jeweilige Produkt-Liste schicken.
// Nutzt BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID (bereits in Vercel eingetragen).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^p\d{1,3}$/;

async function brevo(path, key, init = {}) {
  const r = await fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json", ...(init.headers || {}) },
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
}

async function findOrCreateList(key, productId, productName) {
  const suffix = `(${productId})`;
  for (let offset = 0; offset < 500; offset += 50) {
    const res = await brevo(`/contacts/lists?limit=50&offset=${offset}`, key);
    if (!res.ok) throw new Error("lists " + res.status);
    const lists = res.data?.lists || [];
    const hit = lists.find((l) => String(l.name).endsWith(suffix));
    if (hit) return hit.id;
    if (lists.length < 50) break;
  }
  const folders = await brevo(`/contacts/folders?limit=10&offset=0`, key);
  const folderId = folders.data?.folders?.[0]?.id;
  if (!folderId) throw new Error("no folder");
  const created = await brevo(`/contacts/lists`, key, {
    method: "POST",
    body: JSON.stringify({ name: `Produkt: ${productName} ${suffix}`, folderId }),
  });
  if (!created.ok || !created.data?.id) throw new Error("create list " + created.status);
  return created.data.id;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, BREVO_REDIRECT_URL } = process.env;
  if (!BREVO_API_KEY || !BREVO_DOI_TEMPLATE_ID) return res.status(500).json({ error: "not_configured" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (body?.website) return res.status(200).json({ ok: true }); // Honeypot
  const email = String(body?.email || "").trim().toLowerCase();
  const productId = String(body?.productId || "").trim();
  const productName = String(body?.productName || "").replace(/[^\p{L}\p{N} ,.\-–&()/+]/gu, "").trim().slice(0, 60);
  if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: "invalid_email" });
  if (!ID_RE.test(productId) || !productName) return res.status(400).json({ error: "invalid_product" });

  try {
    const listId = await findOrCreateList(BREVO_API_KEY, productId, productName);
    const listIds = [listId];
    if (BREVO_LIST_ID) listIds.push(Number(BREVO_LIST_ID));
    const r = await brevo(`/contacts/doubleOptinConfirmation`, BREVO_API_KEY, {
      method: "POST",
      body: JSON.stringify({
        email,
        includeListIds: listIds,
        templateId: Number(BREVO_DOI_TEMPLATE_ID),
        redirectionUrl: (BREVO_REDIRECT_URL || "https://suchyprints.at/?newsletter=bestaetigt"),
      }),
    });
    if (r.ok || r.status === 204) return res.status(200).json({ ok: true });
    console.error("Brevo DOI-Fehler", r.status, r.data);
    return res.status(502).json({ error: "brevo_error" });
  } catch (err) {
    console.error("Benachrichtigung fehlgeschlagen", err);
    return res.status(502).json({ error: "unexpected" });
  }
}
