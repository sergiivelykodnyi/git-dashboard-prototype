import { Router } from "express";
import path from "path";
import { loadConfig, saveConfig, resolveRepoPath } from "../services/config.js";
import {
  getRepoStatus,
  isGitRepo,
  executeGitOperation,
} from "../services/git.js";

export const apiRouter = Router();

// GET projects (returns ProjectConfig[])
apiRouter.get("/projects", (req, res) => {
  res.json(loadConfig());
});

// POST projects (saves ProjectConfig[])
apiRouter.post("/projects", (req, res) => {
  const config = req.body;

  if (Array.isArray(config)) {
    saveConfig(config);
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: "Invalid config format" });
  }
});

// POST git operation (fetch/pull/push/commit) for specific project
apiRouter.post("/projects/:projectId/git/execute", async (req, res) => {
  const { projectId } = req.params;
  const { action, message } = req.body;

  if (!action) {
    res.status(400).json({ error: "action required" });
    return;
  }

  const config = loadConfig();
  const project = config.find((p) => p.id === projectId);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
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

// DELETE repo from projects
apiRouter.delete("/projects/:projectId/repos", (req, res) => {
  const { projectId } = req.params;
  const { path: repoPath } = req.body;

  if (!repoPath) {
    res.status(400).json({ error: "path required" });
    return;
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

  res.json({ ok: true });
});

// POST add single repo to a project
apiRouter.post("/projects/:projectId/repos", (req, res) => {
  const { projectId } = req.params;
  const { name, path: repoPath } = req.body;

  if (!projectId || !repoPath || !name) {
    res.status(400).json({ error: "projectId, name, and path required" });
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

  const config = loadConfig();
  const project = config.find((p) => p.id === projectId);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!project.repos.some((r) => r.path === resolved)) {
    project.repos.push({ name, path: resolved });
    saveConfig(config);
  }
  res.json({ ok: true });
});

// GET all repos status, grouped by project
apiRouter.get("/projects/status", async (req, res) => {
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

  res.json(projectsWithStatus);
});

// POST git operation (fetch/pull/push/commit) for specific directory
apiRouter.post("/repos/git/execute", async (req, res) => {
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

// POST git operation (fetch/pull/push/commit) across ALL repositories
apiRouter.post("/repos/git/execute-all", async (req, res) => {
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

    res.json({
      success: successCount > 0,
      result: `Completed git ${action} for ${successCount}/${results.length} repositories across all projects`,
    });
  } catch (e: unknown) {
    res.status(500).json({ success: false, result: (e as Error).message });
  }
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

// GET validate if a directory has a git repository
apiRouter.get("/repos/validate", async (req, res) => {
  const pathQuery = req.query.path as string;

  if (!pathQuery) {
    res.json(false);
    return;
  }

  const resolved = resolveRepoPath(pathQuery);

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
