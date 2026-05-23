import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Config } from "../../shared/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, "../../config.json");

export function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      return {
        repoPaths: Array.isArray(raw.repoPaths)
          ? raw.repoPaths.filter((p: unknown) => typeof p === "string")
          : [],
        scanDir: typeof raw.scanDir === "string" ? raw.scanDir : "",
      };
    } catch {
      return { repoPaths: [], scanDir: "" };
    }
  }
  return { repoPaths: [], scanDir: "" };
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function resolveRepoPath(
  inputPath: string | null | undefined,
): string | null {
  if (!inputPath || typeof inputPath !== "string") return null;
  const resolved = path.resolve(inputPath);
  try {
    const real = fs.realpathSync(resolved);
    if (!fs.statSync(real).isDirectory()) return null;
    return real;
  } catch {
    return null;
  }
}
