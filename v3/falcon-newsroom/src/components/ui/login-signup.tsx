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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Globe,
  User,
} from "lucide-react";

type AuthMode = "login" | "signup";

interface AuthCardProps {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
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
          .card-animate{animation:fadeUp .7s cubic-bezier(.22,.61,.36,1) .15s both}
        }
        @keyframes fadeUp{from{opacity:1;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
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
      className="ml-1 text-zinc-200 hover:underline"
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
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  const title = isSignup ? "Create your account" : "Welcome back";
  const description = isSignup
    ? "Start your Falcon Newsroom workspace"
    : "Sign in to your Falcon Newsroom account";

  return (
    <section className="fixed inset-0 overflow-hidden bg-zinc-950 text-zinc-50">
      <AuthBackground />

      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
        <span className="text-xs uppercase tracking-[0.14em] text-zinc-400">
          Falcon Newsroom
        </span>
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80"
        >
          <span className="mr-2">Contact</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </header>

      <div className="relative z-10 grid h-full w-full place-items-center px-4 py-20">
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-zinc-400">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            <form
              className="grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                setNotice("Frontend preview only. Authentication is not connected yet.");
              }}
            >
              {isSignup && (
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className="border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600"
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
                    className="border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600"
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
                    className="border-zinc-800 bg-zinc-950 pl-10 pr-10 text-zinc-50 placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:text-zinc-200"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={isSignup ? "terms" : "remember"}
                    className="border-zinc-700 data-[state=checked]:bg-zinc-50 data-[state=checked]:text-zinc-900"
                  />
                  <Label
                    htmlFor={isSignup ? "terms" : "remember"}
                    className="text-zinc-400"
                  >
                    {isSignup ? "I agree" : "Remember me"}
                  </Label>
                </div>
                {!isSignup && (
                  <a href="/login" className="text-sm text-zinc-300 hover:text-zinc-100">
                    Forgot password?
                  </a>
                )}
              </div>

              <Button
                type="submit"
                className="h-10 w-full rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
              >
                {isSignup ? "Create account" : "Continue"}
              </Button>
            </form>

            {notice && (
              <p className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-400">
                {notice}
              </p>
            )}

            <div className="relative">
              <Separator className="bg-zinc-800" />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900/70 px-2 text-[11px] uppercase tracking-widest text-zinc-500">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50 hover:bg-zinc-900/80"
              onClick={() => setNotice("Google sign-in is a frontend preview only.")}
            >
              <Globe className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </CardContent>

          <CardFooter className="flex items-center justify-center text-sm text-zinc-400">
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
