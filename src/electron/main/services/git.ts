import fs from "fs";
import path from "path";
import { simpleGit } from "simple-git";
import { RepoStatus } from "../../../shared/types.js";

export function isGitRepo(dir: string): boolean {
  return fs.existsSync(path.join(dir, ".git"));
}

export async function getRepoStatus(repoPath: string): Promise<RepoStatus> {
  try {
    const git = simpleGit(repoPath);
    const [status, log, remotes, stashList] = await Promise.all([
      git.status(),
      git.log({ maxCount: 1 }).catch(() => ({ latest: null })),
      git.getRemotes(true).catch(() => []),
      git.stashList().catch(() => ({ all: [] })),
    ]);

    const hasRemote = remotes.length > 0;
    let ahead = 0,
      behind = 0;
    if (hasRemote && status.tracking) {
      ahead = status.ahead || 0;
      behind = status.behind || 0;
    }

    const lastCommit = log.latest
      ? {
          hash: log.latest.hash.substring(0, 7),
          message: log.latest.message,
          author: log.latest.author_name,
          date: log.latest.date,
        }
      : null;

    const staged = status.staged.length;
    const changed = status.files.filter(
      (f) => f.working_dir !== " " && f.working_dir !== "",
    ).length;
    const stash = stashList.all.length;

    return {
      name: path.basename(repoPath),
      path: repoPath,
      branch: status.current || undefined,
      tracking: status.tracking || undefined,
      hasRemote,
      ahead,
      behind,
      changed,
      staged,
      stash,
      isClean: changed === 0 && staged === 0,
      lastCommit,
      files: status.files.map((f) => ({
        path: f.path,
        index: f.index,
        working_dir: f.working_dir,
      })),
    };
  } catch (e) {
    return {
      name: path.basename(repoPath),
      path: repoPath,
      error: (e as Error).message,
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
}

export async function executeGitOperation(
  resolved: string,
  action: string,
  message?: string,
): Promise<{ success: boolean; result: string; status?: RepoStatus }> {
  const git = simpleGit(resolved);
  let result: string;

  if (action === "fetch") {
    await git.fetch(["--all", "--prune"]);
    result = "Fetched from all remotes";
  } else if (action === "pull") {
    const pullResult = await git.pull();
    result =
      pullResult.summary.changes > 0
        ? `Pulled: ${pullResult.summary.changes} change(s), ${pullResult.summary.insertions} insertion(s), ${pullResult.summary.deletions} deletion(s)`
        : "Already up to date";
  } else if (action === "push") {
    await git.push();
    result = "Pushed to origin";
  } else if (action === "commit") {
    if (!message) throw new Error("commit message required");
    await git.add(".");
    const commitResult = await git.commit(message);
    result = `Committed: ${commitResult.summary.changes} change(s) — ${commitResult.commit}`;
  } else {
    throw new Error("unknown action");
  }

  const status = await getRepoStatus(resolved);
  return { success: true, result, status };
}
