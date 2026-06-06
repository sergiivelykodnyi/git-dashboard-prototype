import { app, BrowserWindow, ipcMain, dialog, nativeImage } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig, saveConfig, resolveRepoPath } from "./services/config.js";
import { getRepoStatus, isGitRepo, executeGitOperation } from "./services/git.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function getIconPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "icon.icns")
    : path.resolve(__dirname, "../../public/icons/icon.png");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist-ui/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Set Dock icon on macOS for development
  if (process.platform === "darwin" && app.dock) {
    app.dock.setIcon(nativeImage.createFromPath(getIconPath()));
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ==========================================
// IPC HANDLERS - PROJECTS
// ==========================================

ipcMain.handle("projects:load", async () => {
  return loadConfig();
});

ipcMain.handle("projects:save", async (_, config) => {
  saveConfig(config);
  return { ok: true };
});

ipcMain.handle("projects:addRepo", async (_, { projectId, name, path: repoPath }) => {
  if (!projectId || !repoPath || !name) {
    return { ok: false, error: "projectId, name, and path required" };
  }

  const resolved = resolveRepoPath(repoPath);
  if (!resolved) {
    return { ok: false, error: "Invalid or non-existent path" };
  }

  if (!isGitRepo(resolved)) {
    return { ok: false, error: "Not a git repository" };
  }

  const config = loadConfig();
  const project = config.find((p) => p.id === projectId);
  if (!project) {
    return { ok: false, error: "Project not found" };
  }

  if (!project.repos.some((r) => r.path === resolved)) {
    project.repos.push({ name, path: resolved });
    saveConfig(config);
  }

  return { ok: true };
});

ipcMain.handle("projects:removeRepo", async (_, { projectId, path: repoPath }) => {
  if (!projectId || !repoPath) {
    return { ok: false, error: "projectId and path required" };
  }

  const config = loadConfig();
  let changed = false;

  config.forEach((proj) => {
    if (proj.id === projectId) {
      const originalLen = proj.repos.length;
      proj.repos = proj.repos.filter((r) => r.path !== repoPath);
      if (proj.repos.length !== originalLen) {
        changed = true;
      }
    }
  });

  if (changed) {
    saveConfig(config);
  }

  return { ok: true };
});

ipcMain.handle("projects:getStatus", async () => {
  const config = loadConfig();

  const projectsWithStatus = await Promise.all(
    config.map(async (project) => {
      const reposStatus = await Promise.all(
        project.repos.map(async (r) => {
          const resolved = resolveRepoPath(r.path);
          if (resolved) {
            const status = await getRepoStatus(resolved);
            if (r.name) {
              status.name = r.name;
            }
            return status;
          } else {
            return {
              name: r.name || path.basename(r.path),
              path: r.path,
              error: "Repository path not found",
              branch: "?",
              isClean: null,
              changed: 0,
              staged: 0,
              stash: 0,
              ahead: 0,
              behind: 0,
              hasRemote: false,
              lastCommit: null,
              files: [],
            };
          }
        }),
      );

      return {
        id: project.id,
        name: project.name,
        repos: reposStatus,
      };
    }),
  );

  return projectsWithStatus;
});

// ==========================================
// IPC HANDLERS - GIT
// ==========================================

ipcMain.handle("git:execute", async (_, { path: repoPath, action, message }) => {
  if (!repoPath || !action) {
    throw new Error("path and action required");
  }

  const resolved = resolveRepoPath(repoPath);
  if (!resolved) {
    throw new Error("Invalid or non-existent path");
  }

  if (!isGitRepo(resolved)) {
    throw new Error("Not a git repository");
  }

  return executeGitOperation(resolved, action, message);
});

ipcMain.handle("git:executeProject", async (_, { projectId, action, message }) => {
  if (!projectId || !action) {
    throw new Error("projectId and action required");
  }

  const config = loadConfig();
  const project = config.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  try {
    const results = await Promise.all(
      project.repos.map(async (r) => {
        const resolved = resolveRepoPath(r.path);

        if (resolved && isGitRepo(resolved)) {
          try {
            return await executeGitOperation(resolved, action, message);
          } catch (e: unknown) {
            return {
              success: false,
              result: `[${r.name}] ${(e as Error).message}`,
            };
          }
        }

        return {
          success: false,
          result: `[${r.name}] Not a valid git repository`,
        };
      }),
    );

    const successCount = results.filter((r) => r.success).length;

    return {
      success: successCount > 0,
      result: `Completed git ${action} for ${successCount}/${results.length} repositories in project "${project.name}"`,
    };
  } catch (e: unknown) {
    throw new Error((e as Error).message);
  }
});

ipcMain.handle("git:executeAll", async (_, { action, message }) => {
  if (!action) {
    throw new Error("action required");
  }

  const config = loadConfig();
  const results: { success: boolean; result: string }[] = [];

  try {
    for (const project of config) {
      const projectResults = await Promise.all(
        project.repos.map(async (r) => {
          const resolved = resolveRepoPath(r.path);

          if (resolved && isGitRepo(resolved)) {
            try {
              return await executeGitOperation(resolved, action, message);
            } catch (e: unknown) {
              return {
                success: false,
                result: `[${r.name}] ${(e as Error).message}`,
              };
            }
          }

          return {
            success: false,
            result: `[${r.name}] Not a valid git repository`,
          };
        }),
      );

      results.push(...projectResults);
    }

    const successCount = results.filter((r) => r.success).length;

    return {
      success: successCount > 0,
      result: `Completed git ${action} for ${successCount}/${results.length} repositories across all projects`,
    };
  } catch (e: unknown) {
    throw new Error((e as Error).message);
  }
});

ipcMain.handle("git:validate", async (_, repoPath) => {
  if (!repoPath) return false;
  const resolved = resolveRepoPath(repoPath);
  if (!resolved) return false;
  return isGitRepo(resolved);
});

ipcMain.handle("git:getStatus", async (_, repoPath) => {
  if (!repoPath) {
    throw new Error("path required");
  }

  const resolved = resolveRepoPath(repoPath);
  if (!resolved) {
    throw new Error("Invalid or non-existent path");
  }

  return getRepoStatus(resolved);
});

// ==========================================
// IPC HANDLERS - SYSTEM
// ==========================================

ipcMain.handle("system:selectDirectory", async (event) => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Git Repository Directory",
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});
