import { type ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "@ui/components/Icon";
import { ButtonIcon } from "@ui/components/ButtonIcon";
import { useAppStore } from "@ui/store";
import { removeRepo as apiRemoveRepo } from "@ui/api";
import { useGitAction } from "@ui/hooks/useGitAction";
import { toast } from "@ui/utils/toast";
import type { Repo } from "@ui/types";
import { RepoDropdowActions } from "@ui/components/RepoDropdowActions";

interface Props extends ComponentProps<"div"> {
  repo: Repo;
  projectId?: string;
}

export function RepoRow(props: Readonly<Props>) {
  const { repo, projectId, className, ...rest } = props;
  const { removeRepo } = useAppStore();
  const { execute, loading } = useGitAction();

  const handleGit = async (action: "fetch" | "pull" | "push") => {
    const result = await execute(repo.path, action);
    if (result?.success) toast(result.result, "ok");
    else if (result) toast(result.result, "err");
  };

  const handleRemove = async () => {
    await apiRemoveRepo(repo.path, projectId);
    removeRepo(repo.path, projectId);
    toast("Repository removed");
  };

  return (
    <div className={clsx("flex items-center gap-4 p-4", className)} {...rest}>
      <div className="flex min-w-48 flex-1 items-center gap-4">
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

      <div className="flex gap-2">
        {repo.error && (
          <span className="badge badge-error">
            <Icon name="error" size={16} />
          </span>
        )}
        {!repo.error && repo.isClean && !repo.ahead && !repo.behind && (
          <span className="badge badge-clean">
            <Icon name="check" size={16} />
          </span>
        )}
        {repo.changed > 0 && (
          <span className="badge badge-changed">
            <Icon name="edit" size={16} />
            {repo.changed}
          </span>
        )}
        {repo.staged > 0 && (
          <span className="badge badge-staged">
            <Icon name="check_box" size={16} />
            {repo.staged}
          </span>
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
          <span className="badge badge-stash">
            <Icon name="save" size={16} />
            {repo.stash}
          </span>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap">
        <ButtonIcon
          icon="cloud_download"
          isLoading={loading === "fetch"}
          title="fetch"
          onClick={() => handleGit("fetch")}
          disabled={!!loading}
        />
        <ButtonIcon
          icon="download"
          isLoading={loading === "pull"}
          title="pull"
          onClick={() => handleGit("pull")}
          disabled={!!loading}
        />
        <ButtonIcon
          icon="upload"
          isLoading={loading === "push"}
          title="push"
          onClick={() => handleGit("push")}
          disabled={!!loading}
        />
        <RepoDropdowActions onRemove={handleRemove} />
      </div>
    </div>
  );
}
