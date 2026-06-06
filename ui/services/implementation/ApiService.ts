import axios from "axios";
import type { IApiService } from "@ui/services/interfaces/IApiService";
import type {
  Repo,
  GitAction,
  GitActionResult,
  ProjectWithStatus,
  ProjectConfig,
} from "@ui/types";

export class ApiService implements IApiService {
  private api = axios.create({
    baseURL: "http://localhost:5800/api",
    timeout: 30000,
  });

  fetchRepos(): Promise<ProjectWithStatus[]> {
    return this.api.get("/projects/status").then((r) => r.data);
  }

  fetchRepoStatus(path: string): Promise<Repo> {
    return this.api.get("/repos/status", { params: { path } }).then((r) => r.data);
  }

  runGitAction(
    path: string,
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    return this.api.post("/repos/git/execute", { path, action, message }).then((r) => r.data);
  }

  runProjectGitAction(
    projectId: string,
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    return this.api
      .post(`/projects/${projectId}/git/execute`, { action, message })
      .then((r) => r.data);
  }

  runAllGitAction(
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    return this.api.post("/repos/git/execute-all", { action, message }).then((r) => r.data);
  }

  addRepo(
    projectId: string,
    name: string,
    path: string,
  ): Promise<{ ok: boolean; error?: string }> {
    return this.api.post(`/projects/${projectId}/repos`, { name, path }).then((r) => r.data);
  }

  removeRepo(
    path: string,
    projectId?: string,
  ): Promise<{ ok: boolean }> {
    if (!projectId) return Promise.reject(new Error("projectId required"));
    return this.api
      .delete(`/projects/${projectId}/repos`, { data: { path } })
      .then((r) => r.data);
  }

  getConfig(): Promise<ProjectConfig[]> {
    return this.api.get("/projects").then((r) => r.data);
  }

  saveConfig(config: ProjectConfig[]): Promise<{ ok: boolean }> {
    return this.api.post("/projects", config).then((r) => r.data);
  }

  validateDirectory(
    path: string,
  ): Promise<{ valid: boolean; name?: string; error?: string }> {
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

    return this.api.get("/repos/validate", { params: { path: trimmed } }).then((r) => {
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
  }
}

