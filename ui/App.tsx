import { useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { Button } from "@ui/components/Button";
import { Icon } from "@ui/components/Icon";
import { Header } from "@ui/components/Header";
import { Sidebar } from "@ui/components/Sidebar";
import { ProjectSection } from "@ui/components/ProjectSection";
import { ProjectRepos } from "@ui/components/ProjectRepos";
import { LogOutput } from "@ui/components/LogOutput";
import { AddRepoModal } from "@ui/components/AddRepoModal";
import { NewProjectModal } from "@ui/components/NewProjectModal";
import { ToastContainer } from "@ui/components/Toast";
import { useRepos } from "@ui/hooks/useRepos";
import { useServices } from "@ui/hooks/useServices";
import { observer } from "mobx-react-lite";

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

const AllProjectsView = observer(function AllProjectsView() {
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

const SingleProjectView = observer(function SingleProjectView() {
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

const App = observer(function App() {
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { appService } = useServices();

  const { refresh } = useRepos();

  const handleRefresh = async () => {
    setRefreshing(true);
    appService.addLog("Running refresh all…", "info");
    await refresh();
    appService.addLog("Refreshed all repositories", "ok");
    setRefreshing(false);
  };

  const handleFetchAll = async () => {
    setFetching(true);
    try {
      const data = await appService.runAllGitAction("fetch");
      if (data.success) {
        appService.showToast(data.result, "ok");
      } else {
        appService.showToast(data.result, "err");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      appService.showToast(msg, "err");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="grid h-full grid-cols-[288px_1fr]">
      <Sidebar />

      <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onFetchAll={handleFetchAll}
          fetching={fetching}
        />

        <div className="min-h-0 flex-1 overflow-y-scroll p-6">
          <Routes>
            <Route path="/" element={<AllProjectsView />} />
            <Route
              path="/projects/:projectId"
              element={<SingleProjectView />}
            />
          </Routes>
        </div>

        <LogOutput />
      </main>

      {/* Add Repository Modal */}
      {appService.showAddRepoModal && (
        <AddRepoModal
          onClose={() => appService.setAddRepoModalOpen(false)}
          onAdded={handleRefresh}
        />
      )}

      {/* New Project Modal */}
      {appService.showNewProjectModal && (
        <NewProjectModal
          onClose={() => appService.setNewProjectModalOpen(false)}
          onCreated={handleRefresh}
        />
      )}

      <ToastContainer />
    </div>
  );
});

export default App;
