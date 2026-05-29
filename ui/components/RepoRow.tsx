import { type ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "./Icon";
import { useAppStore } from "../store";
import { removeRepo as apiRemoveRepo } from "../api";
import { useGitAction } from "../hooks/useGitAction";
import { toast } from "../utils/toast";
import type { Repo } from "../types";

interface Props extends ComponentProps<"div"> {
  repo: Repo;
}

export function RepoRow(props: Readonly<Props>) {
  const { repo, className, ...rest } = props;
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
    <div
      className={clsx(
        "flex flex-wrap items-center gap-4 border-b border-surface0 p-4 last:border-b-0 sm:flex-nowrap",
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-48 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mauve/15 text-mauve">
          <Icon name="folder_code" size={24} />
        </div>
        <div>
          <div className="text-base font-semibold text-foreground">
            {repo.name}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-mauve">
            <Icon name="fork_right" size={16} />
            {repo.branch || "?"}
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-2">
        {repo.error && <span className="badge badge-error">err</span>}
        {!repo.error && repo.isClean && !repo.ahead && !repo.behind && (
          <span className="badge badge-clean">
            <Icon name="check" size={16} />
          </span>
        )}
        {repo.changed > 0 && (
          <span className="badge badge-changed">{repo.changed} changed</span>
        )}
        {repo.staged > 0 && (
          <span className="badge badge-staged">{repo.staged} staged</span>
        )}
        {repo.ahead > 0 && (
          <span className="badge badge-ahead">
            <Icon name="arrow_upward" size={16} />
            {repo.ahead}
          </span>
        )}
        {repo.behind > 0 && (
          <span className="badge badge-behind">
            <Icon name="arrow_downward" size={16} />
            {repo.behind}
          </span>
        )}
        {repo.stash > 0 && (
          <span className="badge badge-stash">{repo.stash} stashed</span>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap">
        <button
          type="button"
          className="btn btn-blue"
          onClick={() => handleGit("fetch")}
          disabled={!!loading}
        >
          {loading === "fetch" ? (
            <span className="spinner" />
          ) : (
            <Icon name="cloud_download" size={16} />
          )}{" "}
          Fetch
        </button>
        <button
          type="button"
          className="btn btn-green"
          onClick={() => handleGit("pull")}
          disabled={!!loading}
        >
          {loading === "pull" ? (
            <span className="spinner" />
          ) : (
            <Icon name="download" size={16} />
          )}{" "}
          Pull
        </button>
        <button
          type="button"
          className="btn btn-peach"
          onClick={() => handleGit("push")}
          disabled={!!loading}
        >
          {loading === "push" ? (
            <span className="spinner" />
          ) : (
            <Icon name="upload" size={16} />
          )}{" "}
          Push
        </button>
        <button type="button" className="btn" onClick={handleRemove}>
          <Icon name="delete" size={16} /> Remove
        </button>
      </div>
    </div>
  );
}
