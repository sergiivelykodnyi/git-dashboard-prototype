import { create } from "zustand";
import type { Repo, LogEntry } from "../types";

let logId = 0;

interface AppState {
  repos: Repo[];
  activeRepoPath: string | null;
  logs: LogEntry[];
  lastRefresh: Date | null;

  setRepos: (repos: Repo[]) => void;
  updateRepo: (repo: Repo) => void;
  removeRepo: (path: string) => void;
  setActiveRepo: (path: string | null) => void;
  addLog: (msg: string, type: LogEntry["type"]) => void;
  clearLogs: () => void;
  setLastRefresh: () => void;
}

function applySystemTheme() {
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "mocha"
    : "latte";
  document.documentElement.dataset.theme = theme;
}

applySystemTheme();
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", applySystemTheme);

export const useAppStore = create<AppState>((set) => ({
  repos: [],
  activeRepoPath: null,
  logs: [],
  lastRefresh: null,

  setRepos: (repos) => set({ repos }),

  updateRepo: (repo) =>
    set((state) => ({
      repos: state.repos.map((r) => (r.path === repo.path ? repo : r)),
    })),

  removeRepo: (path) =>
    set((state) => ({
      repos: state.repos.filter((r) => r.path !== path),
      activeRepoPath:
        state.activeRepoPath === path ? null : state.activeRepoPath,
    })),

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
}));
