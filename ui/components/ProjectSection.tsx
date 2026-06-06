import { useState, type ComponentProps } from "react";
import clsx from "clsx";
import { ButtonIcon } from "@ui/components/ButtonIcon";
import { Icon } from "@ui/components/Icon";
import { ProjectRepos } from "@ui/components/ProjectRepos";
import { useServices } from "@ui/context/ServicesContext";
import { observer } from "mobx-react-lite";
import { toast } from "@ui/utils/toast";
import type { ProjectWithStatus } from "@ui/types";

interface Props extends ComponentProps<"section"> {
  project: ProjectWithStatus;
  onAddRepoClick: () => void;
}

export const ProjectSection = observer(function ProjectSection(props: Readonly<Props>) {
  const { project, onAddRepoClick, className, ...rest } = props;
  const [loadingAction, setLoadingAction] = useState<
    "fetch" | "pull" | "push" | null
  >(null);

  const { appService } = useServices();

  const handleProjectGitAction = async (action: "fetch" | "pull" | "push") => {
    setLoadingAction(action);
    try {
      const data = await appService.runProjectGitAction(project.id, action);
      if (data.success) {
        toast(data.result, "ok");
      } else {
        toast(data.result, "err");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast(msg, "err");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section
      className={clsx(
        "flex flex-col rounded-2xl border border-surface0/60 bg-mantle/30 p-4 backdrop-blur-md",
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
      <ProjectRepos project={project} onAddRepoClick={onAddRepoClick} />
    </section>
  );
});
