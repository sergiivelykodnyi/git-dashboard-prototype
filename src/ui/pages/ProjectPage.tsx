import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useServices } from "@ui/hooks/useServices";
import { Icon } from "@ui/components/Icon";
import { ProjectRepos } from "@ui/components/ProjectRepos";

export const ProjectPage = observer(function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { appService } = useServices();

  const project = appService.projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl pt-16 text-center text-overlay0">
        <Icon name="folder" size={56} className="text-mauve/40" />
        <h2 className="mt-2 text-2xl font-medium text-subtext0">
          Project not found
        </h2>
        <p className="mt-1">
          The project you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <ProjectRepos
        project={project}
        onAddRepoClick={() => appService.setAddRepoModalOpen(true)}
      />
    </div>
  );
});
