import axios from "axios";
import type {
  Repo,
  GitAction,
  GitActionResult,
  ProjectWithStatus,
  ProjectConfig,
} from "@ui/types";

const api = axios.create({
  baseURL: "http://localhost:5800/api",
  timeout: 30000,
});

export const fetchRepos = (): Promise<ProjectWithStatus[]> =>
  api.get("/repos").then((r) => r.data);

export const fetchRepoStatus = (path: string): Promise<Repo> =>
  api.get("/repos/status", { params: { path } }).then((r) => r.data);

export const runGitAction = (
  path: string,
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api.post("/repos/git/dir", { path, action, message }).then((r) => r.data);

export const runProjectGitAction = (
  projectId: string,
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api
    .post(`/repos/project/${projectId}/git`, { action, message })
    .then((r) => r.data);

export const runAllGitAction = (
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api.post("/repos/git", { action, message }).then((r) => r.data);

export const fetchAllRepos = (): Promise<ProjectWithStatus[]> =>
  api.post("/repos/fetch-all").then((r) => r.data);

export const addRepo = (
  projectId: string,
  name: string,
  dir: string,
): Promise<{ ok: boolean; error?: string }> =>
  api.post("/repos/add", { projectId, name, dir }).then((r) => r.data);

export const removeRepo = (
  path: string,
  projectId?: string,
): Promise<{ ok: boolean }> =>
  api.delete("/repos", { data: { path, projectId } }).then((r) => r.data);

export const getConfig = (): Promise<ProjectConfig[]> =>
  api.get("/config").then((r) => r.data);

export const saveConfig = (config: ProjectConfig[]): Promise<{ ok: boolean }> =>
  api.post("/config", config).then((r) => r.data);

export const validateDirectory = (
  dir: string,
): Promise<{ valid: boolean; name?: string; error?: string }> => {
  const trimmed = dir.trim();
  const isAbsolute =
    trimmed.startsWith("/") ||
    trimmed.startsWith("~") ||
    /^[a-zA-Z]:[/\\]/.test(trimmed) ||
    trimmed.startsWith("\\\\");

  if (!isAbsolute && trimmed.length > 0) {
    return Promise.resolve({
      valid: false,
      error:
        "Please enter an absolute path (e.g. /Users/you/projects/repo or ~/projects/repo)",
    });
  }

  return api
    .get("/repos/git/validate", { params: { dir: trimmed } })
    .then((r) => {
      const isValid = r.data === true;
      let derivedName: string | undefined;
      if (isValid && trimmed) {
        const s = trimmed.replace(/\.git$/i, "").replace(/[/\\\\]+$/, "");
        const parts = s.split(/[/\\:]/).filter(Boolean);
        derivedName = (parts[parts.length - 1] || "").trim();
      }
      return {
        valid: isValid,
        name: derivedName,
        error: isValid ? undefined : "Not a valid git repository",
      };
    });
};
