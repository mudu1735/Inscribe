import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
import FalconNewsroomFullInteractiveUI from "./App.jsx";
import AuthPages from "./auth-pages";
import "./styles.css";

const authRoutes = new Set(["/login", "/signup"]);
const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
const isAuthRoute = authRoutes.has(currentPath);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAuthRoute ? <AuthPages /> : <FalconNewsroomFullInteractiveUI />}
  </React.StrictMode>
);
