import { makeAutoObservable } from "mobx";
import type { Repo, LogEntry, ProjectWithStatus } from "@ui/types";
import type { IAppService, ThemeMode } from "@ui/services/interfaces/IAppService";
import type { IApiService } from "@ui/services/interfaces/IApiService";

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

  api: IApiService;

  constructor(api: IApiService) {
    this.api = api;
    makeAutoObservable(this);
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

  removeRepo(path: string, projectId?: string) {
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
}
