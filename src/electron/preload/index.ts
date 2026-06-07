import { contextBridge, ipcRenderer } from "electron";
import type { IElectronAPI, ProjectConfig } from "../../shared/types.js";

const api: IElectronAPI = {
  projects: {
    load: () => ipcRenderer.invoke("projects:load"),
    save: (config: ProjectConfig[]) => ipcRenderer.invoke("projects:save", config),
    addRepo: (projectId: string, name: string, path: string) =>
      ipcRenderer.invoke("projects:addRepo", { projectId, name, path }),
    removeRepo: (projectId: string, path: string) =>
      ipcRenderer.invoke("projects:removeRepo", { projectId, path }),
    getStatus: () => ipcRenderer.invoke("projects:getStatus"),
  },
  git: {
    execute: (path: string, action: string, message?: string) =>
      ipcRenderer.invoke("git:execute", { path, action, message }),
    executeProject: (projectId: string, action: string, message?: string) =>
      ipcRenderer.invoke("git:executeProject", { projectId, action, message }),
    executeAll: (action: string, message?: string) =>
      ipcRenderer.invoke("git:executeAll", { action, message }),
    validate: (path: string) => ipcRenderer.invoke("git:validate", path),
    getStatus: (path: string) => ipcRenderer.invoke("git:getStatus", path),
  },
  system: {
    selectDirectory: () => ipcRenderer.invoke("system:selectDirectory"),
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
