import type {
  Repo,
  GitAction,
  GitActionResult,
  ProjectWithStatus,
  ProjectConfig,
} from "@ui/types";

export interface IApiService {
  fetchRepos(): Promise<ProjectWithStatus[]>;
  fetchRepoStatus(path: string): Promise<Repo>;
  runGitAction(path: string, action: GitAction, message?: string): Promise<GitActionResult>;
  runProjectGitAction(projectId: string, action: GitAction, message?: string): Promise<GitActionResult>;
  runAllGitAction(action: GitAction, message?: string): Promise<GitActionResult>;
  addRepo(projectId: string, name: string, path: string): Promise<{ ok: boolean; error?: string }>;
  removeRepo(path: string, projectId?: string): Promise<{ ok: boolean }>;
  getConfig(): Promise<ProjectConfig[]>;
  saveConfig(config: ProjectConfig[]): Promise<{ ok: boolean }>;
  validateDirectory(path: string): Promise<{ valid: boolean; name?: string; error?: string }>;
}
