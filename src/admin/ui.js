// Gemeinsame Styles fürs Dashboard
export const btn = { border: "1px solid #D3D7DD", background: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#1B1D21", fontFamily: "Inter, sans-serif" };
export const btnDark = { ...btn, background: "#1B1D21", color: "#fff", borderColor: "#1B1D21" };
export const inp = { border: "1px solid #D3D7DD", borderRadius: 8, padding: "8px 10px", fontSize: 13.5, outline: "none", fontFamily: "Inter, sans-serif", background: "#fff", color: "#1B1D21", width: "100%", boxSizing: "border-box" };
export const card = { background: "#fff", border: "1px solid #D3D7DD", borderRadius: 12, padding: "16px 18px" };
export const lbl = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", margin: "0 0 5px" };
export const euro = (n) => Number(n || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
