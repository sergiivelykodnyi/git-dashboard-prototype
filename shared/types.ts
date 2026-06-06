export interface RepoStatus {
  name: string;
  path: string;
  error?: string;
  branch?: string;
  tracking?: string;
  hasRemote: boolean;
  ahead: number;
  behind: number;
  changed: number;
  staged: number;
  stash: number;
  isClean: boolean | null;
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  } | null;
  files: Array<{
    path: string;
    index: string;
    working_dir: string;
  }>;
}

export interface ProjectRepoConfig {
  name: string;
  path: string;
}

export interface ProjectConfig {
  id: string;
  name: string;
  repos: ProjectRepoConfig[];
}

export type Config = ProjectConfig[];

export interface ProjectWithStatus {
  id: string;
  name: string;
  repos: RepoStatus[];
}

export interface IElectronAPI {
  projects: {
    load: () => Promise<ProjectConfig[]>;
    save: (config: ProjectConfig[]) => Promise<{ ok: boolean }>;
    addRepo: (projectId: string, name: string, path: string) => Promise<{ ok: boolean; error?: string }>;
    removeRepo: (projectId: string, path: string) => Promise<{ ok: boolean }>;
    getStatus: () => Promise<ProjectWithStatus[]>;
  };
  git: {
    execute: (
      path: string,
      action: string,
      message?: string,
    ) => Promise<{ success: boolean; result: string; status?: RepoStatus }>;
    executeProject: (
      projectId: string,
      action: string,
      message?: string,
    ) => Promise<{ success: boolean; result: string }>;
    executeAll: (
      action: string,
      message?: string,
    ) => Promise<{ success: boolean; result: string }>;
    validate: (path: string) => Promise<boolean>;
    getStatus: (path: string) => Promise<RepoStatus>;
  };
  system: {
    selectDirectory: () => Promise<string | null>;
  };
}

