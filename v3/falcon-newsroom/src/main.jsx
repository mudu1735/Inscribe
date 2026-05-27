import React from "react";
import { createRoot } from "react-dom/client";
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
