import type { Repo, LogEntry, ProjectWithStatus } from "@ui/types";

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

  setProjects(projects: ProjectWithStatus[]): void;
  setRepos(repos: Repo[]): void;
  updateRepo(repo: Repo): void;
  removeRepo(path: string, projectId?: string): void;
  setActiveRepo(path: string | null): void;
  addLog(msg: string, type: LogEntry["type"]): void;
  clearLogs(): void;
  setLastRefresh(): void;
  toggleLogOpen(): void;
  setLogOpen(open: boolean): void;
  setThemeMode(mode: ThemeMode): void;
  setAddRepoModalOpen(open: boolean): void;
  setNewProjectModalOpen(open: boolean): void;
}

