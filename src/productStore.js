import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { PRODUCTS as STATIC_PRODUCTS, STATIC_REFERENCES, FIDGET_COLORS, SOLID_COLORS } from "./shopData";

// Produkte kommen aus Supabase (Tabelle "products", im Dashboard bearbeitbar).
// Ist die Tabelle leer oder nicht erreichbar, nutzt der Shop das Sortiment aus shopData.js.

export const COLOR_SETS = {
  fidget: { label: "Fidget-Farben (inkl. Verläufe)", colors: FIDGET_COLORS },
  solid: { label: "Einfarbig", colors: SOLID_COLORS },
};

// Produkt → speicherbare Form (Farblisten werden als Kürzel gespeichert)
export function productToData(p) {
  const { id, colors, ...rest } = p;
  let colorSet = rest.colorSet || null;
  if (colors === FIDGET_COLORS) colorSet = "fidget";
  else if (colors === SOLID_COLORS) colorSet = "solid";
  else if (colors && !colorSet) colorSet = "fidget";
  return { ...rest, colorSet };
}

export function productFromRow(row) {
  const data = row.data || {};
  const set = COLOR_SETS[data.colorSet];
  return { ...data, id: row.id, colors: set ? set.colors : undefined, colorCount: set ? data.colorCount || 1 : 0 };
}

let cache = null;

// fest eingebaute Kundenprojekte vorne einreihen (nicht doppelt, falls gleiche id im Dashboard angelegt wird)
function withStaticRefs(list) {
  const ids = new Set(list.map((p) => p.id));
  return [...STATIC_REFERENCES.filter((r) => !ids.has(r.id)), ...list];
}
let pending = null;

export function loadProducts(force = false) {
  if (cache && !force) return Promise.resolve(cache);
  if (pending && !force) return pending;
  const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: "timeout" }), 3000));
  pending = Promise.race([
    supabase.from("products").select("id, data, sort").eq("active", true).order("sort", { ascending: true }),
    timeout,
  ])
    .then((res) => {
      cache = withStaticRefs(!res?.error && res?.data?.length ? res.data.map(productFromRow) : STATIC_PRODUCTS);
      return cache;
    })
    .catch(() => (cache = withStaticRefs(STATIC_PRODUCTS)))
    .finally(() => { pending = null; });
  return pending;
}

// Liefert null, solange geladen wird
export function useProducts() {
  const [products, setProducts] = useState(cache);
  useEffect(() => {
    let alive = true;
    if (!cache) loadProducts().then((p) => alive && setProducts(p));
    return () => { alive = false; };
  }, []);
  return products;
}
