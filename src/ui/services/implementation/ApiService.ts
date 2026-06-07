import type { IApiService } from "@ui/services/interfaces/IApiService";
import type {
  Repo,
  GitAction,
  GitActionResult,
  ProjectWithStatus,
  ProjectConfig,
} from "@ui/types";
import type { IElectronAPI } from "@shared/types";

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

export class ApiService implements IApiService {
  fetchRepos(): Promise<ProjectWithStatus[]> {
    // Cast is fine because types are structurally compatible
    return window.electronAPI.projects.getStatus() as unknown as Promise<ProjectWithStatus[]>;
  }

  fetchRepoStatus(path: string): Promise<Repo> {
    return window.electronAPI.git.getStatus(path) as unknown as Promise<Repo>;
  }

  runGitAction(
    path: string,
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    return window.electronAPI.git.execute(path, action, message) as unknown as Promise<GitActionResult>;
  }

  runProjectGitAction(
    projectId: string,
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    return window.electronAPI.git.executeProject(projectId, action, message) as unknown as Promise<GitActionResult>;
  }

  runAllGitAction(
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    return window.electronAPI.git.executeAll(action, message) as unknown as Promise<GitActionResult>;
  }

  addRepo(
    projectId: string,
    name: string,
    path: string,
  ): Promise<{ ok: boolean; error?: string }> {
    return window.electronAPI.projects.addRepo(projectId, name, path);
  }

  removeRepo(
    path: string,
    projectId?: string,
  ): Promise<{ ok: boolean }> {
    if (!projectId) return Promise.reject(new Error("projectId required"));
    return window.electronAPI.projects.removeRepo(projectId, path);
  }

  getConfig(): Promise<ProjectConfig[]> {
    return window.electronAPI.projects.load();
  }

  saveConfig(config: ProjectConfig[]): Promise<{ ok: boolean }> {
    return window.electronAPI.projects.save(config);
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

    return window.electronAPI.git.validate(trimmed).then((isValid) => {
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

