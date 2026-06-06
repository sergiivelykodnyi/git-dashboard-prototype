import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { app } from "electron";
import { Config } from "../../../shared/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let CONFIG_FILE = "";

export function getConfigFile(): string {
  if (!CONFIG_FILE) {
    try {
      const userData = app.getPath("userData");
      // Ensure the directory exists
      if (!fs.existsSync(userData)) {
        fs.mkdirSync(userData, { recursive: true });
      }
      CONFIG_FILE = path.join(userData, "config.json");

      // Migrate from old local root config if it exists in the workspace
      const rootConfig = path.resolve(__dirname, "../../config.json");
      if (!fs.existsSync(CONFIG_FILE) && fs.existsSync(rootConfig)) {
        try {
          fs.copyFileSync(rootConfig, CONFIG_FILE);
        } catch (err) {
          console.error("Failed to migrate config.json from project root:", err);
        }
      }
    } catch {
      // Fallback for tests/dev tooling outside Electron shell lifecycle
      CONFIG_FILE = path.resolve(__dirname, "../../config.json");
    }
  }
  return CONFIG_FILE;
}

export function loadConfig(): Config {
  const file = getConfigFile();
  if (fs.existsSync(file)) {
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));

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
  const file = getConfigFile();
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
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
