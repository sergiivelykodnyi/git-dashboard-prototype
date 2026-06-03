import { type ComponentProps } from "react";
import clsx from "clsx";
import { RepoRow } from "@ui/components/RepoRow";
import type { ProjectWithStatus } from "@ui/types";

interface Props extends ComponentProps<"div"> {
  project: ProjectWithStatus;
  onAddRepoClick: () => void;
}

export function ProjectRepos(props: Readonly<Props>) {
  const { project, onAddRepoClick, className, ...rest } = props;

  return (
    <div className={clsx("flex flex-col gap-2", className)} {...rest}>
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
  );
}
