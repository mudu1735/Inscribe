import { useMemo, useState } from "react";
import LoginCardSection, {
  SignUpCardSection,
} from "@/components/ui/login-signup";

type AuthMode = "login" | "signup";

function modeFromPath(pathname: string): AuthMode {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  return normalizedPath === "/signup" ? "signup" : "login";
}

export default function AuthPages() {
  const initialMode = useMemo(() => modeFromPath(window.location.pathname), []);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    window.history.pushState(null, "", nextMode === "signup" ? "/signup" : "/login");
  };

  return mode === "signup" ? (
    <SignUpCardSection onModeChange={handleModeChange} />
  ) : (
    <LoginCardSection onModeChange={handleModeChange} />
  );
}
