import { spawn } from "node:child_process";

import { pythonCommand, root } from "./python-command.mjs";

const child = spawn(pythonCommand, process.argv.slice(2), {
  cwd: root,
  stdio: "inherit",
  shell: false,
});

child.on("error", (error) => {
  console.error(`Could not start the configured Python interpreter: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
