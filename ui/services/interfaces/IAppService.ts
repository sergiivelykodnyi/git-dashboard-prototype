import type {
  Repo,
  LogEntry,
  ProjectWithStatus,
  GitAction,
  GitActionResult,
  ProjectConfig,
} from "@ui/types";
import type { ToastItem } from "@ui/services/interfaces/IToastService";

export type ThemeMode = "system" | "dark" | "light";

export interface IAppService {
  projects: ProjectWithStatus[];
  repos: Repo[];
  activeRepoPath: string | null;
  logs: LogEntry[];
  lastRefresh: Date | null;
  isLogOpen: boolean;
  themeMode: ThemeMode;
  showAddRepoModal: boolean;
  showNewProjectModal: boolean;
  toasts: ToastItem[];

  setProjects(projects: ProjectWithStatus[]): void;
  setRepos(repos: Repo[]): void;
  updateRepo(repo: Repo): void;
  setActiveRepo(path: string | null): void;
  addLog(msg: string, type: LogEntry["type"]): void;
  clearLogs(): void;
  setLastRefresh(): void;
  toggleLogOpen(): void;
  setLogOpen(open: boolean): void;
  setThemeMode(mode: ThemeMode): void;
  setAddRepoModalOpen(open: boolean): void;
  setNewProjectModalOpen(open: boolean): void;
  showToast(msg: string, type?: "ok" | "err"): void;

  // API Integration Methods
  fetchRepos(): Promise<void>;
  runGitAction(path: string, action: GitAction, message?: string): Promise<GitActionResult>;
  runProjectGitAction(projectId: string, action: GitAction, message?: string): Promise<GitActionResult>;
  runAllGitAction(action: GitAction, message?: string): Promise<GitActionResult>;
  addRepo(projectId: string, name: string, path: string): Promise<{ ok: boolean; error?: string }>;
  removeRepo(path: string, projectId?: string): Promise<{ ok: boolean }>;
  getConfig(): Promise<ProjectConfig[]>;
  saveConfig(config: ProjectConfig[]): Promise<{ ok: boolean }>;
  validateDirectory(path: string): Promise<{ valid: boolean; name?: string; error?: string }>;
}


