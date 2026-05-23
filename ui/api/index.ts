import axios from "axios";
import type { Repo, GitAction, GitActionResult } from "../types";

const api = axios.create({
  baseURL: "http://localhost:5800/api",
  timeout: 30000,
});

export const fetchRepos = (): Promise<Repo[]> =>
  api.get("/repos").then((r) => r.data);

export const fetchRepoStatus = (path: string): Promise<Repo> =>
  api.get("/repos/status", { params: { path } }).then((r) => r.data);

export const runGitAction = (
  path: string,
  action: GitAction,
  message?: string,
): Promise<GitActionResult> =>
  api.post("/repos/git", { path, action, message }).then((r) => r.data);

export const fetchAllRepos = (): Promise<Repo[]> =>
  api.post("/repos/fetch-all").then((r) => r.data);

export const addRepo = (
  path: string,
): Promise<{ ok: boolean; error?: string }> =>
  api.post("/repos/add", { path }).then((r) => r.data);

export const removeRepo = (path: string): Promise<{ ok: boolean }> =>
  api.delete("/repos", { data: { path } }).then((r) => r.data);

export const getConfig = (): Promise<{
  repoPaths: string[];
  scanDir: string;
}> => api.get("/config").then((r) => r.data);

export const saveConfig = (
  repoPaths: string[],
  scanDir: string,
): Promise<{ ok: boolean }> =>
  api.post("/config", { repoPaths, scanDir }).then((r) => r.data);
