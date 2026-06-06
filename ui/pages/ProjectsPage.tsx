import { observer } from "mobx-react-lite";
import { Button } from "@ui/components/Button";
import { Icon } from "@ui/components/Icon";
import { ProjectSection } from "@ui/components/ProjectSection";
import { useServices } from "@ui/hooks/useServices";

const NoProjectsYetView = observer(function NoProjectsYetView() {
  const { appService } = useServices();
  return (
    <div className="mx-auto max-w-7xl pt-16 text-center text-overlay0">
      <Icon name="folder" size={56} className="text-mauve/40" />
      <h2 className="mt-2 text-2xl font-medium text-subtext0">
        No projects yet
      </h2>
      <p className="mt-1">
        Create a project and add repositories to get started.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Button
          variant="primary"
          onClick={() => appService.setNewProjectModalOpen(true)}
        >
          <Icon name="create_new_folder" size={16} /> Create project
        </Button>
      </div>
    </div>
  );
});

export const ProjectsPage = observer(function ProjectsPage() {
  const { appService } = useServices();

  if (appService.projects.length === 0) {
    return <NoProjectsYetView />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {appService.projects.map((project) => (
        <ProjectSection
          key={project.id}
          project={project}
          onAddRepoClick={() => appService.setAddRepoModalOpen(true)}
        />
      ))}
    </div>
  );
});
