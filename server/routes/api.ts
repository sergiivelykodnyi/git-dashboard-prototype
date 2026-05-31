import { Router } from "express";
import path from "path";
import { loadConfig, saveConfig, resolveRepoPath } from "../services/config.js";
import {
  getRepoStatus,
  isGitRepo,
  executeGitOperation,
} from "../services/git.js";

export const apiRouter = Router();

/**
 * @route GET /projects
 * @description Retrieves the full list of projects configured in the system.
 * @query None
 * @returns {ProjectConfig[]} 200 - An array of ProjectConfig objects representing all configured projects.
 */
apiRouter.get("/projects", (req, res) => {
  res.json(loadConfig());
});

/**
 * @route POST /projects
 * @description Saves/overwrites the entire list of projects in the system configuration.
 * @body {ProjectConfig[]} config - An array of ProjectConfig objects representing the complete new configuration.
 * @returns {Object} 200 - Success status on successful save: `{ ok: true }`
 * @returns {Object} 400 - Error response if the body has an invalid format: `{ error: "Invalid config format" }`
 */
apiRouter.post("/projects", (req, res) => {
  const config = req.body;

  if (Array.isArray(config)) {
    saveConfig(config);
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: "Invalid config format" });
  }
});

/**
 * @route POST /projects/:projectId/git/execute
 * @description Executes a specific git operation (e.g., fetch, pull, push, commit) for all git repositories defined under a specific project.
 * @param {string} projectId - The ID of the project whose repositories should execute the action.
 * @body {Object} body
 * @body {string} body.action - The git action to perform (e.g., 'fetch', 'pull', 'push', 'commit').
 * @body {string} [body.message] - The commit message (required only if the action is 'commit').
 * @returns {Object} 200 - Result status indicating whether any repo succeeded and a summary message:
 *   - `{ success: boolean, result: string }` (where success is true if at least one repository action succeeded)
 * @returns {Object} 400 - Error response if action is missing: `{ error: "action required" }`
 * @returns {Object} 404 - Error response if the project ID does not exist: `{ error: "Project not found" }`
 * @returns {Object} 500 - Error response if a generic execution error occurs: `{ success: false, result: string }`
 */
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

/**
 * @route DELETE /projects/:projectId/repos
 * @description Removes a repository from a specific project's repository list by its path.
 * @param {string} projectId - The ID of the project from which to remove the repository.
 * @body {Object} body
 * @body {string} body.path - The path of the repository to be removed.
 * @returns {Object} 200 - Success status indicating that the deletion was processed: `{ ok: true }`
 * @returns {Object} 400 - Error response if the repository path is missing: `{ error: "path required" }`
 */
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

/**
 * @route POST /projects/:projectId/repos
 * @description Adds a new repository to a specific project. Validates that the repository path exists and contains a valid git repository before adding.
 * @param {string} projectId - The ID of the project to add the repository to.
 * @body {Object} body
 * @body {string} body.name - The user-defined display name for the repository.
 * @body {string} body.path - The filesystem path (absolute or relative) of the git repository.
 * @returns {Object} 200 - Success status on successful validation and addition: `{ ok: true }`
 * @returns {Object} 400 - Error response if parameters are missing, path is invalid, or it's not a git repository:
 *   - `{ error: "projectId, name, and path required" }`
 *   - `{ error: "Invalid or non-existent path" }`
 *   - `{ error: "Not a git repository" }`
 * @returns {Object} 404 - Error response if the project ID does not exist: `{ error: "Project not found" }`
 */
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

/**
 * @route GET /projects/status
 * @description Fetches and aggregates the detailed git status of all repositories across all projects.
 * @query None
 * @returns {Object[]} 200 - An array of project objects, each containing:
 *   - `id` (string): The project ID.
 *   - `name` (string): The project name.
 *   - `repos` (Object[]): An array of status objects for each repository inside the project. If a repository has a path error,
 *     its status object will contain an error message and placeholder properties.
 */
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

/**
 * @route POST /repos/git/execute
 * @description Executes a specific git operation (e.g., fetch, pull, push, commit) for a single specific repository directory.
 * @body {Object} body
 * @body {string} body.path - The filesystem path of the git repository.
 * @body {string} body.action - The git action to perform (e.g., 'fetch', 'pull', 'push', 'commit').
 * @body {string} [body.message] - The commit message (required only if the action is 'commit').
 * @returns {Object} 200 - The response of the executed git operation (typically `{ success: boolean, result: string }`).
 * @returns {Object} 400 - Error response if path/action is missing, path is invalid, or it is not a valid git repository:
 *   - `{ error: "path required" }`
 *   - `{ error: "action required" }`
 *   - `{ error: "Invalid or non-existent path" }`
 *   - `{ error: "Not a git repository" }`
 * @returns {Object} 500 - Error response if a generic execution error occurs: `{ success: false, result: string }`
 */
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

/**
 * @route POST /repos/git/execute-all
 * @description Executes a specific git operation (e.g., fetch, pull, push, commit) across all repositories across all configured projects.
 * @body {Object} body
 * @body {string} body.action - The git action to perform (e.g., 'fetch', 'pull', 'push', 'commit').
 * @body {string} [body.message] - The commit message (required only if the action is 'commit').
 * @returns {Object} 200 - Result status indicating whether any repository succeeded and a summary message:
 *   - `{ success: boolean, result: string }` (where success is true if at least one repository action succeeded)
 * @returns {Object} 400 - Error response if action is missing: `{ error: "action required" }`
 * @returns {Object} 500 - Error response if a generic execution error occurs: `{ success: false, result: string }`
 */
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

/**
 * @route GET /repos/status
 * @description Retrieves the detailed git status of a single repository by its path.
 * @query {string} path - The filesystem path of the git repository.
 * @returns {Object} 200 - Detailed git status object including branch name, isClean, change counts, ahead/behind tracking, and files list.
 * @returns {Object} 400 - Error response if path is missing, invalid, or does not exist:
 *   - `{ error: "path required" }`
 *   - `{ error: "Invalid or non-existent path" }`
 */
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

/**
 * @route GET /repos/validate
 * @description Validates whether a given directory path contains a valid git repository (i.e. has a `.git` directory).
 * @query {string} path - The filesystem path to validate.
 * @returns {boolean} 200 - `true` if the path contains a valid git repository, `false` otherwise (including if path parameter is missing, invalid or does not exist).
 */
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
