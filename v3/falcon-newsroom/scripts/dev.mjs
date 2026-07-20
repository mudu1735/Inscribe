import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const healthUrl = "http://127.0.0.1:5003/api/health";
const requiredCapabilities = [
  "admin-users",
  "guest-role-v1",
  "rbac-v4",
  "stories",
  "pitches",
  "pitch-owner-submit",
  "shared-workflow-activity",
  "workspace-settings",
];
const venvPython = resolve(root, "..", "..", "venv", "Scripts", "python.exe");
const pythonCommand = process.env.FALCON_V3_PYTHON || (existsSync(venvPython) ? venvPython : "python");

let authProcess = null;
let viteProcess = null;
let shuttingDown = false;

async function readAuthHealth() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 750);
  try {
    const response = await fetch(healthUrl, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json().catch(() => null);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function hasRequiredCapabilities(payload) {
  const capabilities = new Set(Array.isArray(payload?.capabilities) ? payload.capabilities : []);
  return payload?.service === "falcon-newsroom-v3-auth"
    && requiredCapabilities.every((capability) => capabilities.has(capability));
}

async function isAuthHealthy() {
  return hasRequiredCapabilities(await readAuthHealth());
}

function stopStaleFalconBackendOnPort() {
  if (process.platform !== "win32") return false;
  let output = "";
  try {
    output = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
  } catch {
    return false;
  }

  const stalePids = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!line.includes(":5003")) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5 && parts[1]?.endsWith(":5003") && parts[3] === "LISTENING") {
      stalePids.add(parts[4]);
    }
  }

  for (const pid of stalePids) {
    try {
      execFileSync("taskkill", ["/pid", pid, "/t", "/f"], { stdio: "ignore" });
    } catch {
      return false;
    }
  }
  return stalePids.size > 0;
}

async function waitForAuth() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15000) {
    if (await isAuthHealthy()) return;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
  }
  throw new Error("v3 auth backend did not become ready on 127.0.0.1:5003.");
}

function spawnChild(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  return child;
}

function stopChild(child) {
  if (!child || child.killed) return;
  if (process.platform === "win32" && child.pid) {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  stopChild(viteProcess);
  stopChild(authProcess);
  setTimeout(() => process.exit(code), 100);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const initialHealth = await readAuthHealth();
if (hasRequiredCapabilities(initialHealth)) {
  console.log("[v3 dev] Auth backend already running on 127.0.0.1:5003.");
} else {
  if (initialHealth?.service === "falcon-newsroom-v3-auth") {
    console.log("[v3 dev] Restarting stale v3 auth backend on 127.0.0.1:5003...");
    stopStaleFalconBackendOnPort();
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
  }
  console.log("[v3 dev] Starting v3 auth backend on 127.0.0.1:5003...");
  authProcess = spawnChild(pythonCommand, ["-B", "-m", "server.auth_app"]);
  authProcess.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[v3 dev] Auth backend exited with code ${code}.`);
      shutdown(code || 1);
    }
  });
  await waitForAuth();
}

console.log("[v3 dev] Starting Vite on 127.0.0.1:5173...");
viteProcess = spawnChild("npx", ["vite", "--host", "127.0.0.1", "--port", "5173", "--strictPort"]);
viteProcess.on("exit", (code) => shutdown(code || 0));
