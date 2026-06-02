"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

type AuthMode = "login" | "signup";
type NoticeTone = "error" | "success" | "muted";

interface AuthCardProps {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

interface AuthResponse {
  ok?: boolean;
  error?: string;
  redirect?: string;
  authUrl?: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const AUTH_BUFFER_MS = 850;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function safeRedirectTarget(target: string | undefined, fallback = "/dashboard") {
  const normalized = (target || "").trim();
  if (!normalized || !normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }
  if (normalized === "/") return "/dashboard";
  if (normalized === "/records") return "/interviewees";
  if (normalized === "/login" || normalized === "/signup") return fallback;
  return normalized;
}

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json().catch(() => ({}))) as AuthResponse;
  }
  return {};
}

function authErrorForResponse(response: Response, data: AuthResponse) {
  if (data.error) return data.error;
  if (response.status === 404) {
    return "Authentication endpoint unavailable. Restart the v3 backend with the latest code.";
  }
  if (response.status >= 500) {
    return "Authentication server error. Please try again after the backend restarts.";
  }
  return "Authentication failed. Please try again.";
}

function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type Particle = { x: number; y: number; v: number; o: number };
    let particles: Particle[] = [];
    let raf = 0;

    const makeParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i += 1) particles.push(makeParticle());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a;will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,250,250,.24),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
        .hline:nth-child(1)::after{animation-delay:.12s}
        .hline:nth-child(2)::after{animation-delay:.22s}
        .hline:nth-child(3)::after{animation-delay:.32s}
        .vline:nth-child(4)::after{animation-delay:.42s}
        .vline:nth-child(5)::after{animation-delay:.54s}
        .vline:nth-child(6)::after{animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}
        .card-animate{opacity:1;transform:translateY(0)}
        @media (prefers-reduced-motion:no-preference){
          .card-animate{animation:fadeUp .55s cubic-bezier(.22,.61,.36,1) .12s both}
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-50 mix-blend-screen"
      />
    </>
  );
}

function ModeLink({
  mode,
  children,
  onModeChange,
}: {
  mode: AuthMode;
  children: React.ReactNode;
  onModeChange?: (mode: AuthMode) => void;
}) {
  const href = mode === "login" ? "/login" : "/signup";
  return (
    <a
      className="ml-1 text-zinc-200 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      href={href}
      onClick={(event) => {
        if (!onModeChange) return;
        event.preventDefault();
        onModeChange(mode);
      }}
    >
      {children}
    </a>
  );
}

function AuthCard({ mode, onModeChange }: AuthCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [remember, setRemember] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<NoticeTone>("muted");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    setNotice("");
    setNoticeTone("muted");
    setShowPassword(false);
    setPassword("");
    setConfirmPassword("");
  }, [mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("auth") === "google" ? params.get("error") : "";
    if (!googleError) return;

    setNotice(googleError);
    setNoticeTone("error");
    params.delete("auth");
    params.delete("error");
    const nextQuery = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`);
  }, []);

  const title = isSignup ? "Create your account" : "Welcome back";
  const description = isSignup
    ? "Start your Falcon Newsroom workspace"
    : "Sign in to your Falcon Newsroom account";

  const showNotice = (message: string, tone: NoticeTone = "error") => {
    setNotice(message);
    setNoticeTone(tone);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    if (isSignup && password !== confirmPassword) {
      showNotice("Passwords do not match.");
      return;
    }

    if (isSignup && password.length < 8) {
      showNotice("Password must be at least 8 characters.");
      return;
    }

    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
    const payload = isSignup
      ? {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }
      : {
          email: email.trim(),
          password,
          remember,
        };

    setIsSubmitting(true);
    setNotice("");
    const startedAt = window.performance.now();

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await parseAuthResponse(response);
      const elapsed = window.performance.now() - startedAt;
      if (elapsed < AUTH_BUFFER_MS) {
        await sleep(AUTH_BUFFER_MS - elapsed);
      }

      if (!response.ok || !data.ok) {
        showNotice(authErrorForResponse(response, data));
        return;
      }

      showNotice(isSignup ? "Account created. Opening the newsroom..." : "Signed in. Opening the newsroom...", "success");
      window.location.assign(safeRedirectTarget(data.redirect, isSignup ? "/interviewees" : "/dashboard"));
    } catch {
      const elapsed = window.performance.now() - startedAt;
      if (elapsed < AUTH_BUFFER_MS) {
        await sleep(AUTH_BUFFER_MS - elapsed);
      }
      showNotice("Could not reach the authentication server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleSubmitting) return;

    setIsGoogleSubmitting(true);
    setNotice("");
    const next = new URLSearchParams(window.location.search).get("next") || "";
    const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

    try {
      const response = await fetch(`${API_BASE}/api/auth/google/start${nextQuery}`, {
        headers: { "Accept": "application/json" },
        credentials: "include",
      });
      const data = await parseAuthResponse(response);
      if (!response.ok || !data.ok || !data.authUrl) {
        showNotice(authErrorForResponse(response, data));
        return;
      }
      window.location.assign(data.authUrl);
    } catch {
      showNotice("Could not start Google sign-in. Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const noticeClass =
    noticeTone === "success"
      ? "text-emerald-200"
      : noticeTone === "error"
        ? "text-red-200"
        : "text-zinc-400";

  return (
    <section className="fixed inset-0 overflow-hidden bg-zinc-950 text-zinc-50">
      <AuthBackground />

      <header className="absolute left-0 right-0 top-0 z-10 flex items-center border-b border-zinc-800/80 px-6 py-5">
        <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">
          Falcon Newsroom
        </span>
      </header>

      <div className="relative z-10 grid h-full w-full place-items-center px-4 py-24">
        <Card className="card-animate w-full max-w-md border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/30">
          <CardHeader className="space-y-2 p-7 pb-5">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-zinc-400">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 px-7 pb-6">
            <form className="grid gap-5" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName" className="text-zinc-300">
                      First name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                        maxLength={80}
                        disabled={isSubmitting}
                        className="h-11 border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lastName" className="text-zinc-300">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      maxLength={80}
                      disabled={isSubmitting}
                      className="h-11 border-zinc-800 bg-zinc-950 text-zinc-50 placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={254}
                    disabled={isSubmitting}
                    className="h-11 border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={isSignup ? 8 : undefined}
                    maxLength={256}
                    disabled={isSubmitting}
                    className="h-11 border-zinc-800 bg-zinc-950 pl-10 pr-10 text-zinc-50 placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 transition hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-300">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={256}
                    disabled={isSubmitting}
                    className="h-11 border-zinc-800 bg-zinc-950 text-zinc-50 placeholder:text-zinc-600"
                  />
                </div>
              )}

              {!isSignup && (
                <label className="flex w-fit items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-zinc-100 accent-zinc-100"
                  />
                  Remember me
                </label>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                aria-busy={isSubmitting}
                className="h-11 w-full rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignup ? "Creating account" : "Signing in"}
                  </>
                ) : (
                  isSignup ? "Create account" : "Continue"
                )}
              </Button>
            </form>

            {notice && (
              <p
                className={`text-sm font-medium ${noticeClass}`}
                role={noticeTone === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {notice}
              </p>
            )}

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-zinc-600">
              <span className="h-px flex-1 bg-zinc-800" />
              <span>or</span>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isGoogleSubmitting}
              aria-busy={isGoogleSubmitting}
              className="h-11 w-full rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50 hover:bg-zinc-900/80"
              onClick={handleGoogleSignIn}
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Google
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center px-7 pb-7 pt-0 text-sm text-zinc-400">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <ModeLink
              mode={isSignup ? "login" : "signup"}
              onModeChange={onModeChange}
            >
              {isSignup ? "Sign in" : "Create one"}
            </ModeLink>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

export default function LoginCardSection({
  onModeChange,
}: {
  onModeChange?: (mode: AuthMode) => void;
}) {
  return <AuthCard mode="login" onModeChange={onModeChange} />;
}

export function SignUpCardSection({
  onModeChange,
}: {
  onModeChange?: (mode: AuthMode) => void;
}) {
  return <AuthCard mode="signup" onModeChange={onModeChange} />;
}
