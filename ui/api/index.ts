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
  api.get("/projects/status").then((r) => r.data);

export const fetchRepoStatus = (path: string): Promise<Repo> =>
  api.get("/repos/status", { params: { path } }).then((r) => r.data);

export const runGitAction = (
  path: string,
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api.post("/repos/git/execute", { path, action, message }).then((r) => r.data);

export const runProjectGitAction = (
  projectId: string,
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api
    .post(`/projects/${projectId}/git/execute`, { action, message })
    .then((r) => r.data);

export const runAllGitAction = (
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api.post("/repos/git/execute-all", { action, message }).then((r) => r.data);

export const addRepo = (
  projectId: string,
  name: string,
  path: string,
): Promise<{ ok: boolean; error?: string }> =>
  api.post(`/projects/${projectId}/repos`, { name, path }).then((r) => r.data);

export const removeRepo = (
  path: string,
  projectId?: string,
): Promise<{ ok: boolean }> => {
  if (!projectId) return Promise.reject(new Error("projectId required"));
  return api
    .delete(`/projects/${projectId}/repos`, { data: { path } })
    .then((r) => r.data);
};

export const getConfig = (): Promise<ProjectConfig[]> =>
  api.get("/projects").then((r) => r.data);

export const saveConfig = (config: ProjectConfig[]): Promise<{ ok: boolean }> =>
  api.post("/projects", config).then((r) => r.data);

export const validateDirectory = (
  path: string,
): Promise<{ valid: boolean; name?: string; error?: string }> => {
  const trimmed = path.trim();
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

  return api.get("/repos/validate", { params: { path: trimmed } }).then((r) => {
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
