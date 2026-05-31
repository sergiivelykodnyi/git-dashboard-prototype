import { useState } from "react";
import { Icon } from "@ui/components/Icon";
import { Header } from "@ui/components/Header";
import { Sidebar } from "@ui/components/Sidebar";
import { ProjectSection } from "@ui/components/ProjectSection";
import { LogOutput } from "@ui/components/LogOutput";
import { AddRepoModal } from "@ui/components/AddRepoModal";
import { NewProjectModal } from "@ui/components/NewProjectModal";
import { ToastContainer } from "@ui/components/Toast";
import { useRepos } from "@ui/hooks/useRepos";
import { useAppStore } from "@ui/store";
import { runAllGitAction } from "@ui/api";
import { toast } from "@ui/utils/toast";

function App() {
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);

  const { refresh } = useRepos();
  const { projects, addLog } = useAppStore();

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
          onAddRepo={() => setShowAddRepoModal(true)}
          onCreateProject={() => setShowNewProjectModal(true)}
        />

        <div className="min-h-0 flex-1 overflow-y-scroll p-6">
          {projects.length === 0 ? (
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
                  onClick={() => setShowNewProjectModal(true)}
                >
                  <Icon name="create_new_folder" size={16} /> Create project
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl space-y-8 pb-12">
              {projects.map((project) => (
                <ProjectSection
                  key={project.id}
                  project={project}
                  onAddRepoClick={() => setShowAddRepoModal(true)}
                />
              ))}
            </div>
          )}
        </div>

        <LogOutput />
      </main>

      {/* Add Repository Modal */}
      {showAddRepoModal && (
        <AddRepoModal
          onClose={() => setShowAddRepoModal(false)}
          onAdded={handleRefresh}
        />
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreated={handleRefresh}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default App;
