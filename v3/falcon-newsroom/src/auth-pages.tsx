import { useEffect, useMemo, useState } from "react";
import LoginCardSection, {
  SignUpCardSection,
} from "@/components/ui/login-signup";

type AuthMode = "login" | "signup";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function modeFromPath(pathname: string): AuthMode {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  return normalizedPath === "/signup" ? "signup" : "login";
}

function redirectForRole(role: string | undefined) {
  if (role === "owner") return "/owner";
  if (role === "writer") return "/stories";
  return role === "guest" ? "/interviewees" : "/dashboard";
}

export default function AuthPages() {
  const initialMode = useMemo(() => modeFromPath(window.location.pathname), []);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    const syncMode = () => setMode(modeFromPath(window.location.pathname));
    window.addEventListener("popstate", syncMode);
    return () => window.removeEventListener("popstate", syncMode);
  }, []);

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/api/auth/session`, {
      headers: { "Accept": "application/json" },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.authenticated) return;
        window.location.replace(redirectForRole(payload.user?.role));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    const search = window.location.search || "";
    window.history.pushState(null, "", `${nextMode === "signup" ? "/signup" : "/login"}${search}`);
  };

  return mode === "signup" ? (
    <SignUpCardSection onModeChange={handleModeChange} />
  ) : (
    <LoginCardSection onModeChange={handleModeChange} />
  );
}
