import { makeAutoObservable } from "mobx";
import type {
  Repo,
  LogEntry,
  ProjectWithStatus,
  GitAction,
  GitActionResult,
  ProjectConfig,
} from "@ui/types";
import type { IAppService, ThemeMode } from "@ui/services/interfaces/IAppService";
import type { IApiService } from "@ui/services/interfaces/IApiService";
import type { IToastService, ToastItem } from "@ui/services/interfaces/IToastService";

let logId = 0;
const STORAGE_KEY = "git-dashboard-theme";

function getInitialThemeMode(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light" || saved === "system") {
    return saved;
  }
  return "system";
}

let currentThemeMode: ThemeMode = getInitialThemeMode();

function applyTheme(mode: ThemeMode) {
  currentThemeMode = mode;
  let theme: "mocha" | "latte";
  if (mode === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "mocha"
      : "latte";
  } else {
    theme = mode === "dark" ? "mocha" : "latte";
  }
  document.documentElement.dataset.theme = theme;
}

applyTheme(currentThemeMode);

if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (currentThemeMode === "system") {
        applyTheme("system");
      }
    });
}

export class AppService implements IAppService {
  projects: ProjectWithStatus[] = [];
  repos: Repo[] = [];
  activeRepoPath: string | null = null;
  logs: LogEntry[] = [];
  lastRefresh: Date | null = null;
  isLogOpen: boolean = false;
  themeMode: ThemeMode = getInitialThemeMode();
  showAddRepoModal: boolean = false;
  showNewProjectModal: boolean = false;

  private api: IApiService;
  private toastService: IToastService;

  constructor(api: IApiService, toastService: IToastService) {
    this.api = api;
    this.toastService = toastService;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get toasts(): ToastItem[] {
    return this.toastService.toasts;
  }

  showToast(msg: string, type?: "ok" | "err") {
    this.toastService.show(msg, type);
  }

  setProjects(projects: ProjectWithStatus[]) {
    this.projects = projects;
    this.repos = projects.flatMap((p) => p.repos);
  }

  setRepos(repos: Repo[]) {
    this.repos = repos;
  }

  updateRepo(repo: Repo) {
    this.projects = this.projects.map((proj) => ({
      ...proj,
      repos: proj.repos.map((r) => (r.path === repo.path ? repo : r)),
    }));
    this.repos = this.projects.flatMap((p) => p.repos);
  }

  setActiveRepo(path: string | null) {
    this.activeRepoPath = path;
  }

  addLog(msg: string, type: LogEntry["type"]) {
    this.logs = [
      ...this.logs.slice(-49),
      { id: logId++, msg, type, time: new Date().toLocaleTimeString() },
    ];
  }

  clearLogs() {
    this.logs = [];
  }

  setLastRefresh() {
    this.lastRefresh = new Date();
  }

  toggleLogOpen() {
    this.isLogOpen = !this.isLogOpen;
  }

  setLogOpen(open: boolean) {
    this.isLogOpen = open;
  }

  setThemeMode(mode: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    this.themeMode = mode;
  }

  setAddRepoModalOpen(open: boolean) {
    this.showAddRepoModal = open;
  }

  setNewProjectModalOpen(open: boolean) {
    this.showNewProjectModal = open;
  }

  // API Integration Methods

  async fetchRepos(): Promise<void> {
    try {
      const data = await this.api.fetchRepos();
      this.setProjects(data);
      this.setLastRefresh();
    } catch (err) {
      this.addLog("Cannot connect to server — is it running?", "err");
      throw err;
    }
  }

  async runGitAction(
    path: string,
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    const repoName = path.split("/").pop() ?? path;
    this.addLog(`[${repoName}] Running git ${action}…`, "info");
    try {
      const data = await this.api.runGitAction(path, action, message);
      if (data.success) {
        this.addLog(`[${repoName}] ${data.result}`, "ok");
        if (data.status) {
          this.updateRepo(data.status);
        }
      } else {
        this.addLog(data.result, "err");
      }
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      this.addLog(msg, "err");
      return { success: false, result: msg };
    }
  }

  async runProjectGitAction(
    projectId: string,
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    const project = this.projects.find((p) => p.id === projectId);
    const projName = project ? project.name : projectId;
    this.addLog(`[Project: ${projName}] Running git ${action}…`, "info");
    try {
      const data = await this.api.runProjectGitAction(projectId, action, message);
      if (data.success) {
        this.addLog(`[Project: ${projName}] ${data.result}`, "ok");
        await this.fetchRepos();
      } else {
        this.addLog(`[Project: ${projName}] ${data.result}`, "err");
      }
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      this.addLog(`[Project: ${projName}] Error: ${msg}`, "err");
      return { success: false, result: msg };
    }
  }

  async runAllGitAction(
    action: GitAction,
    message?: string,
  ): Promise<GitActionResult> {
    this.addLog("Running fetch all…", "info");
    try {
      const data = await this.api.runAllGitAction(action, message);
      if (data.success) {
        this.addLog(data.result, "ok");
        await this.fetchRepos();
      } else {
        this.addLog(data.result, "err");
      }
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      this.addLog(`Failed to fetch all repositories: ${msg}`, "err");
      return { success: false, result: msg };
    }
  }

  async addRepo(
    projectId: string,
    name: string,
    path: string,
  ): Promise<{ ok: boolean; error?: string }> {
    const res = await this.api.addRepo(projectId, name, path);
    if (res.ok) {
      await this.fetchRepos();
    }
    return res;
  }

  async removeRepo(
    path: string,
    projectId?: string,
  ): Promise<{ ok: boolean }> {
    const res = await this.api.removeRepo(path, projectId);
    if (res.ok) {
      this.projects = this.projects.map((proj) => {
        if (projectId && proj.id !== projectId) return proj;
        return {
          ...proj,
          repos: proj.repos.filter((r) => r.path !== path),
        };
      });
      this.repos = this.projects.flatMap((p) => p.repos);
      if (this.activeRepoPath === path) {
        this.activeRepoPath = null;
      }
    }
    return res;
  }

  getConfig(): Promise<ProjectConfig[]> {
    return this.api.getConfig();
  }

  async saveConfig(config: ProjectConfig[]): Promise<{ ok: boolean }> {
    const res = await this.api.saveConfig(config);
    if (res.ok) {
      await this.fetchRepos();
    }
    return res;
  }

  validateDirectory(
    path: string,
  ): Promise<{ valid: boolean; name?: string; error?: string }> {
    return this.api.validateDirectory(path);
  }
}
