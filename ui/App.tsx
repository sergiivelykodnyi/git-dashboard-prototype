import { useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
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
import { useAppStore } from "@ui/store";
import { runAllGitAction } from "@ui/api";
import { toast } from "@ui/utils/toast";

function NoProjectsYetView() {
  const { setNewProjectModalOpen } = useAppStore();
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
        <button
          type="button"
          className="button button-primary"
          onClick={() => setNewProjectModalOpen(true)}
        >
          <Icon name="create_new_folder" size={16} /> Create project
        </button>
      </div>
    </div>
  );
}

function AllProjectsView() {
  const { projects, setAddRepoModalOpen } = useAppStore();

  if (projects.length === 0) {
    return <NoProjectsYetView />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {projects.map((project) => (
        <ProjectSection
          key={project.id}
          project={project}
          onAddRepoClick={() => setAddRepoModalOpen(true)}
        />
      ))}
    </div>
  );
}

function SingleProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, setAddRepoModalOpen } = useAppStore();

  const project = projects.find((p) => p.id === projectId);

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
        onAddRepoClick={() => setAddRepoModalOpen(true)}
      />
    </div>
  );
}

function App() {
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { refresh } = useRepos();
  const {
    addLog,
    showAddRepoModal,
    showNewProjectModal,
    setAddRepoModalOpen,
    setNewProjectModalOpen,
  } = useAppStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    addLog("Running refresh all…", "info");
    await refresh();
    addLog("Refreshed all repositories", "ok");
    setRefreshing(false);
  };

  const handleFetchAll = async () => {
    setFetching(true);
    addLog("Running fetch all…", "info");
    try {
      const data = await runAllGitAction("fetch");
      if (data.success) {
        addLog(data.result, "ok");
        toast(data.result, "ok");
        await refresh();
      } else {
        addLog(data.result, "err");
        toast(data.result, "err");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog(`Failed to fetch all repositories: ${msg}`, "err");
      toast(msg, "err");
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
      {showAddRepoModal && (
        <AddRepoModal
          onClose={() => setAddRepoModalOpen(false)}
          onAdded={handleRefresh}
        />
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setNewProjectModalOpen(false)}
          onCreated={handleRefresh}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default App;
