import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shop from "./Shop";
import Dashboard from "./Dashboard";
import Impressum from "./Impressum";
import NotFound from "./NotFound";
import Datenschutz from "./Datenschutz";
import AGB from "./AGB";
import Widerruf from "./Widerruf";
import ProductPage from "./ProductPage";
import Kontakt from "./Kontakt";
import CookieBanner from "./CookieBanner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/agb" element={<AGB />} />
        <Route path="/widerruf" element={<Widerruf />} />
        <Route path="/produkt/:id" element={<ProductPage />} />
        <Route path="/kontakt" element={<Kontakt />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}
