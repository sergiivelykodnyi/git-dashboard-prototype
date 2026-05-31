import { useState, type ComponentProps } from "react";
import clsx from "clsx";
import { ButtonIcon } from "@ui/components/Button";
import { Icon } from "@ui/components/Icon";
import { RepoRow } from "@ui/components/RepoRow";
import { useRepos } from "@ui/hooks/useRepos";
import { useAppStore } from "@ui/store";
import { runProjectGitAction } from "@ui/api";
import { toast } from "@ui/utils/toast";
import type { ProjectWithStatus } from "@ui/types";

interface Props extends ComponentProps<"section"> {
  project: ProjectWithStatus;
  onAddRepoClick: () => void;
}

export function ProjectSection(props: Readonly<Props>) {
  const { project, onAddRepoClick, className, ...rest } = props;
  const [loadingAction, setLoadingAction] = useState<
    "fetch" | "pull" | "push" | null
  >(null);

  const { refresh } = useRepos();
  const { addLog } = useAppStore();

  const handleProjectGitAction = async (action: "fetch" | "pull" | "push") => {
    setLoadingAction(action);
    addLog(`[Project: ${project.name}] Running git ${action}…`, "info");
    try {
      const data = await runProjectGitAction(project.id, action);
      if (data.success) {
        addLog(`[Project: ${project.name}] ${data.result}`, "ok");
        toast(data.result, "ok");
        // Refresh the whole workspace status
        await refresh();
      } else {
        addLog(`[Project: ${project.name}] ${data.result}`, "err");
        toast(data.result, "err");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog(`[Project: ${project.name}] Error: ${msg}`, "err");
      toast(msg, "err");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section
      className={clsx(
        "flex flex-col gap-3 rounded-2xl border border-surface0/60 bg-mantle/30 p-5 backdrop-blur-md",
        className,
      )}
      {...rest}
    >
      {/* Project Header */}
      <div className="flex items-center justify-between border-b border-surface0/80 pb-3">
        <div className="flex items-center gap-2.5">
          <Icon name="folder" size={20} className="text-mauve" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {project.name}
          </h2>
          <span className="rounded-full bg-surface0 px-2 py-0.5 font-mono text-xs font-semibold text-subtext0">
            {project.repos.length}{" "}
            {project.repos.length === 1 ? "repo" : "repos"}
          </span>
        </div>

        {/* Project Level Controls */}
        {project.repos.length > 0 && (
          <div className="flex items-center gap-2">
            <ButtonIcon
              icon="cloud_download"
              title="Fetch project"
              isLoading={loadingAction === "fetch"}
              disabled={!!loadingAction}
              onClick={() => handleProjectGitAction("fetch")}
            />
            <ButtonIcon
              icon="download"
              title="Pull project"
              isLoading={loadingAction === "pull"}
              disabled={!!loadingAction}
              onClick={() => handleProjectGitAction("pull")}
            />
          </div>
        )}
      </div>

      {/* Project Repositories */}
      <div className="flex flex-col gap-2">
        {project.repos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface0 bg-crust/20 py-6 text-center text-xs text-subtext0 italic">
            No repositories added to this project yet.
            <button
              type="button"
              className="ml-1.5 cursor-pointer font-medium text-mauve underline hover:text-mauve/80"
              onClick={onAddRepoClick}
            >
              Add one now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-surface0/40">
            {project.repos.map((r) => (
              <RepoRow key={r.path} repo={r} projectId={project.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
