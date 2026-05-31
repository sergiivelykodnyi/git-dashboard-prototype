import { Router } from "express";
import { simpleGit } from "simple-git";
import path from "path";
import { loadConfig, saveConfig, resolveRepoPath } from "../services/config.js";
import {
  getRepoStatus,
  isGitRepo,
  executeGitOperation,
} from "../services/git.js";

export const apiRouter = Router();

// GET all repos status, grouped by project
apiRouter.get("/repos", async (req, res) => {
  const config = loadConfig();

  const projectsWithStatus = await Promise.all(
    config.map(async (project) => {
      const reposStatus = await Promise.all(
        project.repos.map(async (r) => {
          const resolved = resolveRepoPath(r.dir);
          if (resolved) {
            const status = await getRepoStatus(resolved);
            if (r.name) {
              status.name = r.name;
            }
            return status;
          } else {
            return {
              name: r.name || path.basename(r.dir),
              path: r.dir,
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

  res.json(projectsWithStatus);
});

// GET validate if a directory has a git repository
apiRouter.get("/repos/git/validate", async (req, res) => {
  const dir = req.query.dir as string;
  if (!dir) {
    res.json(false);
    return;
  }
  const resolved = resolveRepoPath(dir);
  if (!resolved) {
    res.json(false);
    return;
  }
  if (!isGitRepo(resolved)) {
    res.json(false);
    return;
  }
  res.json(true);
});

// GET single repo status
apiRouter.get("/repos/status", async (req, res) => {
  const repoPath = req.query.path as string;
  if (!repoPath) {
    res.status(400).json({ error: "path required" });
    return;
  }
  const resolved = resolveRepoPath(repoPath);
  if (!resolved) {
    res.status(400).json({ error: "Invalid or non-existent path" });
    return;
  }
  const status = await getRepoStatus(resolved);
  res.json(status);
});

// POST git operation (fetch/pull/push/commit) for specific directory
apiRouter.post("/repos/git/dir", async (req, res) => {
  const { path: repoPath, action, message } = req.body;

  if (!repoPath) {
    res.status(400).json({ error: "path required" });
    return;
  }
  if (!action) {
    res.status(400).json({ error: "action required" });
    return;
  }
  const resolved = resolveRepoPath(repoPath);
  if (!resolved) {
    res.status(400).json({ error: "Invalid or non-existent path" });
    return;
  }
  if (!isGitRepo(resolved)) {
    res.status(400).json({ error: "Not a git repository" });
    return;
  }

  try {
    const response = await executeGitOperation(resolved, action, message);
    res.json(response);
  } catch (e: unknown) {
    res.status(500).json({ success: false, result: (e as Error).message });
  }
});

// POST git operation (fetch/pull/push/commit) for specific project
apiRouter.post("/repos/project/:id/git", async (req, res) => {
  const { id } = req.params;
  const { action, message } = req.body;

  if (!action) {
    res.status(400).json({ error: "action required" });
    return;
  }

  const config = loadConfig();
  const project = config.find((p) => p.id === id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  try {
    const results = await Promise.all(
      project.repos.map(async (r) => {
        const resolved = resolveRepoPath(r.dir);
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

    // Merge results summary
    const successCount = results.filter((r) => r.success).length;
    res.json({
      success: successCount > 0,
      result: `Completed git ${action} for ${successCount}/${results.length} repositories in project "${project.name}"`,
    });
  } catch (e: unknown) {
    res.status(500).json({ success: false, result: (e as Error).message });
  }
});

// POST git operation (fetch/pull/push/commit) across ALL repositories
apiRouter.post("/repos/git", async (req, res) => {
  const { action, message } = req.body;

  if (!action) {
    res.status(400).json({ error: "action required" });
    return;
  }

  const config = loadConfig();
  const results: { success: boolean; result: string }[] = [];

  try {
    // Call git commands project by project sequentially
    for (const project of config) {
      // For a specific project, call them in parallel
      const projectResults = await Promise.all(
        project.repos.map(async (r) => {
          const resolved = resolveRepoPath(r.dir);
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
    res.json({
      success: successCount > 0,
      result: `Completed git ${action} for ${successCount}/${results.length} repositories across all projects`,
    });
  } catch (e: unknown) {
    res.status(500).json({ success: false, result: (e as Error).message });
  }
});

// GET config (returns ProjectConfig[])
apiRouter.get("/config", (req, res) => {
  res.json(loadConfig());
});

// POST config (saves ProjectConfig[])
apiRouter.post("/config", (req, res) => {
  const config = req.body;
  if (Array.isArray(config)) {
    saveConfig(config);
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: "Invalid config format" });
  }
});

// POST add single repo to a project
apiRouter.post("/repos/add", (req, res) => {
  const { projectId, name, dir } = req.body;
  if (!projectId || !dir || !name) {
    res.status(400).json({ error: "projectId, name, and dir required" });
    return;
  }
  const resolved = resolveRepoPath(dir);
  if (!resolved) {
    res.status(400).json({ error: "Invalid or non-existent path" });
    return;
  }
  if (!isGitRepo(resolved)) {
    res.status(400).json({ error: "Not a git repository" });
    return;
  }

  const config = loadConfig();
  const project = config.find((p) => p.id === projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!project.repos.some((r) => r.dir === resolved)) {
    project.repos.push({ name, dir: resolved });
    saveConfig(config);
  }
  res.json({ ok: true });
});

// POST fetch all repos
apiRouter.post("/repos/fetch-all", async (req, res) => {
  const config = loadConfig();

  await Promise.all(
    config
      .flatMap((p) => p.repos)
      .map(async (r) => {
        const resolved = resolveRepoPath(r.dir);
        if (resolved && isGitRepo(resolved)) {
          try {
            const git = simpleGit(resolved);
            const remotes = await git.getRemotes(true).catch(() => []);
            if (remotes.length > 0) {
              await git.fetch(["--all", "--prune"]);
            }
          } catch {
            // ignore fetch errors
          }
        }
      }),
  );

  // Return the newly updated statuses grouped by project
  const projectsWithStatus = await Promise.all(
    config.map(async (project) => {
      const reposStatus = await Promise.all(
        project.repos.map(async (r) => {
          const resolved = resolveRepoPath(r.dir);
          if (resolved) {
            const status = await getRepoStatus(resolved);
            if (r.name) {
              status.name = r.name;
            }
            return status;
          } else {
            return {
              name: r.name || path.basename(r.dir),
              path: r.dir,
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

  res.json(projectsWithStatus);
});

// DELETE repo from projects
apiRouter.delete("/repos", (req, res) => {
  const { path: repoPath, projectId } = req.body;
  if (!repoPath) {
    res.status(400).json({ error: "path required" });
    return;
  }
  const config = loadConfig();
  let changed = false;

  config.forEach((proj) => {
    if (!projectId || proj.id === projectId) {
      const originalLen = proj.repos.length;
      proj.repos = proj.repos.filter((r) => r.dir !== repoPath);
      if (proj.repos.length !== originalLen) {
        changed = true;
      }
    }
  });

  if (changed) {
    saveConfig(config);
  }
  res.json({ ok: true });
});
