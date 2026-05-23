export interface GitFile {
  path: string;
  index: string;
  working_dir: string;
}

export interface LastCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface Repo {
  name: string;
  path: string;
  branch: string;
  tracking: string | null;
  hasRemote: boolean;
  ahead: number;
  behind: number;
  changed: number;
  staged: number;
  stash: number;
  isClean: boolean;
  lastCommit: LastCommit | null;
  files: GitFile[];
  error?: string;
}

export type GitAction = "fetch" | "pull" | "push" | "commit";

export interface GitActionResult {
  success: boolean;
  result: string;
  status?: Repo;
}

export interface LogEntry {
  id: number;
  msg: string;
  type: "ok" | "err" | "info";
  time: string;
}
