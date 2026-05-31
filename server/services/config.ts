import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { Config } from "../../shared/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, "../../config.json");

export function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));

      // If it is the new array format
      if (Array.isArray(raw)) {
        return raw.map((proj) => {
          const p = proj as Record<string, unknown>;
          return {
            id: typeof p.id === "string" ? p.id : "",
            name: typeof p.name === "string" ? p.name : "",
            repos: Array.isArray(p.repos)
              ? p.repos.map((repo) => {
                  const r = repo as Record<string, unknown>;

                  return {
                    name: typeof r.name === "string" ? r.name : "",
                    path: typeof r.path === "string" ? r.path : "",
                  };
                })
              : [],
          };
        });
      }

      return [];
    } catch {
      return [];
    }
  }
  return [];
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function resolveRepoPath(
  inputPath: string | null | undefined,
): string | null {
  if (!inputPath || typeof inputPath !== "string") return null;
  let expandedPath = inputPath.trim();
  if (expandedPath.startsWith("~")) {
    expandedPath = path.join(os.homedir(), expandedPath.slice(1));
  }
  const resolved = path.resolve(expandedPath);
  try {
    const real = fs.realpathSync(resolved);
    if (!fs.statSync(real).isDirectory()) return null;
    return real;
  } catch {
    return null;
  }
}
