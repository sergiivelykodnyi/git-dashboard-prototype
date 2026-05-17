import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  GitBranch,
  BookMarked,
  CloudDownload,
} from "lucide-react";
import { useAppStore } from "../store";
import { removeRepo as apiRemoveRepo } from "../api";
import { useGitAction } from "../hooks/useGitAction";
import { toast } from "../utils/toast";
import type { Repo } from "../types";

interface Props {
  repo: Repo;
}

export function RepoRow({ repo }: Props) {
  const { removeRepo } = useAppStore();
  const { execute, loading } = useGitAction();

  const handleGit = async (action: "fetch" | "pull" | "push") => {
    const result = await execute(repo.path, action);
    if (result?.success) toast(result.result, "ok");
    else if (result) toast(result.result, "err");
  };

  const handleRemove = async () => {
    await apiRemoveRepo(repo.path);
    removeRepo(repo.path);
    toast("Repository removed");
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-mantle border border-surface0 rounded-xl py-4 px-4">
      <div className="flex items-center gap-4 min-w-48">
        <div className="w-12 h-12 bg-mauve/15 rounded-xl flex items-center justify-center text-mauve shrink-0">
          <BookMarked size={18} />
        </div>
        <div>
          <div className="text-base font-semibold text-text font-mono">{repo.name}</div>
          <div className="text-xs text-mauve font-mono flex items-center gap-1 mt-1">
            <GitBranch size={10} />
            {repo.branch || "?"}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-1">
        {repo.error && <span className="badge badge-error">err</span>}
        {!repo.error && repo.isClean && !repo.ahead && !repo.behind && (
          <span className="badge badge-clean">✓</span>
        )}
        {repo.changed > 0 && (
          <span className="badge badge-changed">{repo.changed} changed</span>
        )}
        {repo.staged > 0 && (
          <span className="badge badge-staged">{repo.staged} staged</span>
        )}
        {repo.ahead > 0 && (
          <span className="badge badge-ahead">↑{repo.ahead}</span>
        )}
        {repo.behind > 0 && (
          <span className="badge badge-behind">↓{repo.behind}</span>
        )}
        {repo.stash > 0 && (
          <span className="badge badge-stash">{repo.stash} stashed</span>
        )}
      </div>

      <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        <button
          className="btn btn-blue"
          onClick={() => handleGit("fetch")}
          disabled={!!loading}
        >
          {loading === "fetch" ? (
            <span className="spinner" />
          ) : (
            <CloudDownload size={12} />
          )}{" "}
          Fetch
        </button>
        <button
          className="btn btn-green"
          onClick={() => handleGit("pull")}
          disabled={!!loading}
        >
          {loading === "pull" ? (
            <span className="spinner" />
          ) : (
            <ArrowDownToLine size={12} />
          )}{" "}
          Pull
        </button>
        <button
          className="btn btn-peach"
          onClick={() => handleGit("push")}
          disabled={!!loading}
        >
          {loading === "push" ? (
            <span className="spinner" />
          ) : (
            <ArrowUpFromLine size={12} />
          )}{" "}
          Push
        </button>
        <button className="btn" onClick={handleRemove}>
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  );
}
