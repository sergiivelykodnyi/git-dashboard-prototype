import { create } from "zustand";
import type { Repo, LogEntry, ProjectWithStatus } from "@ui/types";

let logId = 0;

export type ThemeMode = "system" | "dark" | "light";

interface AppState {
  projects: ProjectWithStatus[];
  repos: Repo[]; // Flat array for backward compatibility
  activeRepoPath: string | null;
  logs: LogEntry[];
  lastRefresh: Date | null;
  isLogOpen: boolean;
  themeMode: ThemeMode;

  setProjects: (projects: ProjectWithStatus[]) => void;
  setRepos: (repos: Repo[]) => void; // Flat set for backward compatibility
  updateRepo: (repo: Repo) => void;
  removeRepo: (path: string, projectId?: string) => void;
  setActiveRepo: (path: string | null) => void;
  addLog: (msg: string, type: LogEntry["type"]) => void;
  clearLogs: () => void;
  setLastRefresh: () => void;
  toggleLogOpen: () => void;
  setLogOpen: (open: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

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

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (currentThemeMode === "system") {
      applyTheme("system");
    }
  });

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  repos: [],
  activeRepoPath: null,
  logs: [],
  lastRefresh: null,
  isLogOpen: false,
  themeMode: getInitialThemeMode(),

  setThemeMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    set({ themeMode: mode });
  },

  setProjects: (projects) =>
    set({
      projects,
      repos: projects.flatMap((p) => p.repos),
    }),

  setRepos: (repos) => set({ repos }),

  updateRepo: (repo) =>
    set((state) => {
      const nextProjects = state.projects.map((proj) => ({
        ...proj,
        repos: proj.repos.map((r) => (r.path === repo.path ? repo : r)),
      }));
      return {
        projects: nextProjects,
        repos: nextProjects.flatMap((p) => p.repos),
      };
    }),

  removeRepo: (path, projectId) =>
    set((state) => {
      const nextProjects = state.projects.map((proj) => {
        if (projectId && proj.id !== projectId) return proj;
        return {
          ...proj,
          repos: proj.repos.filter((r) => r.path !== path),
        };
      });
      return {
        projects: nextProjects,
        repos: nextProjects.flatMap((p) => p.repos),
        activeRepoPath:
          state.activeRepoPath === path ? null : state.activeRepoPath,
      };
    }),

  setActiveRepo: (path) => set({ activeRepoPath: path }),

  addLog: (msg, type) =>
    set((state) => ({
      logs: [
        ...state.logs.slice(-49),
        { id: logId++, msg, type, time: new Date().toLocaleTimeString() },
      ],
    })),

  clearLogs: () => set({ logs: [] }),

  setLastRefresh: () => set({ lastRefresh: new Date() }),

  toggleLogOpen: () => set((state) => ({ isLogOpen: !state.isLogOpen })),

  setLogOpen: (open) => set({ isLogOpen: open }),
}));
