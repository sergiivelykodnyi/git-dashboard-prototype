import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { Config } from "../../shared/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, "../../config.json");

function scanDirectorySimple(dir: string): string[] {
  try {
    const resolved = path.resolve(dir);
    const real = fs.realpathSync(resolved);
    if (!fs.statSync(real).isDirectory()) return [];
    return fs.readdirSync(real).flatMap((name) => {
      try {
        const repoReal = fs.realpathSync(path.join(real, name));
        if (
          fs.statSync(repoReal).isDirectory() &&
          fs.existsSync(path.join(repoReal, ".git"))
        ) {
          return [repoReal];
        }
        return [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));

      // If it's the old schema (an object with repoPaths)
      if (
        raw &&
        !Array.isArray(raw) &&
        ("repoPaths" in raw || "scanDir" in raw)
      ) {
        const legacyPaths: string[] = Array.isArray(raw.repoPaths)
          ? raw.repoPaths.filter((p: unknown) => typeof p === "string")
          : [];
        const legacyScanDir: string =
          typeof raw.scanDir === "string" ? raw.scanDir : "";

        const defaultProject = {
          id: "default-project",
          name: "Default Project",
          repos: [] as { name: string; dir: string }[],
        };

        const seenDirs = new Set<string>();

        // Add regular repo paths
        legacyPaths.forEach((dir) => {
          const resolved = resolveRepoPath(dir);
          if (resolved && !seenDirs.has(resolved)) {
            seenDirs.add(resolved);
            defaultProject.repos.push({
              name: path.basename(resolved),
              dir: resolved,
            });
          }
        });

        // Add scanned repo paths
        if (legacyScanDir) {
          const scanned = scanDirectorySimple(legacyScanDir);
          scanned.forEach((dir) => {
            const resolved = resolveRepoPath(dir);
            if (resolved && !seenDirs.has(resolved)) {
              seenDirs.add(resolved);
              defaultProject.repos.push({
                name: path.basename(resolved),
                dir: resolved,
              });
            }
          });
        }

        const migratedConfig: Config = [defaultProject];
        saveConfig(migratedConfig);
        return migratedConfig;
      }

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
                    dir: typeof r.dir === "string" ? r.dir : "",
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
