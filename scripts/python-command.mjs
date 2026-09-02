import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const root = resolve(import.meta.dirname, "..");

const venvPythonCandidates = process.platform === "win32"
  ? [resolve(root, "venv", "Scripts", "python.exe")]
  : [
      resolve(root, "venv", "bin", "python"),
      resolve(root, "venv", "bin", "python3"),
    ];

const venvPython = venvPythonCandidates.find((candidate) => existsSync(candidate));

export const pythonCommand = process.env.INSCRIBE_PYTHON
  || process.env.FALCON_V3_PYTHON
  || venvPython
  || (process.platform === "win32" ? "python" : "python3");
