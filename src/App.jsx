/**
 * src/App.jsx
 *
 * Simple two-route app:
 *   /   → MenuPage  (public — shows the menu image + order form)
 *   *   → redirect to /
 *
 * No auth, no sessions, no guards.
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MenuPage from "./pages/MenuPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
