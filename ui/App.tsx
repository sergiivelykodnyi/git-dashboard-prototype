import { useState } from "react";
import { Icon } from "@ui/components/Icon";
import { Header } from "@ui/components/Header";
import { RepoRow } from "@ui/components/RepoRow";
import { LogOutput } from "@ui/components/LogOutput";
import { AddRepoModal } from "@ui/components/AddRepoModal";
import { NewProjectModal } from "@ui/components/NewProjectModal";
import { ToastContainer } from "@ui/components/Toast";
import { useRepos } from "@ui/hooks/useRepos";
import { useAppStore } from "@ui/store";
import { fetchAllRepos, runProjectGitAction } from "@ui/api";
import { toast } from "@ui/utils/toast";

function App() {
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [projectActionsLoading, setProjectActionsLoading] = useState<
    Record<string, string | null>
  >({});

  const { refresh } = useRepos();
  const { projects, setProjects, addLog } = useAppStore();

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
      const updated = await fetchAllRepos();
      setProjects(updated);
      addLog("Fetched all repositories", "ok");
    } catch {
      addLog("Failed to fetch all repositories", "err");
    } finally {
      setFetching(false);
    }
  };

  const handleProjectGitAction = async (
    projectId: string,
    projectName: string,
    action: "fetch" | "pull" | "push",
  ) => {
    setProjectActionsLoading((prev) => ({ ...prev, [projectId]: action }));
    addLog(`[Project: ${projectName}] Running git ${action}…`, "info");
    try {
      const data = await runProjectGitAction(projectId, action);
      if (data.success) {
        addLog(`[Project: ${projectName}] ${data.result}`, "ok");
        toast(data.result, "ok");
        // Refresh the whole workspace status
        await refresh();
      } else {
        addLog(`[Project: ${projectName}] ${data.result}`, "err");
        toast(data.result, "err");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog(`[Project: ${projectName}] Error: ${msg}`, "err");
      toast(msg, "err");
    } finally {
      setProjectActionsLoading((prev) => ({ ...prev, [projectId]: null }));
    }
  };

  return (
    <div className="h-full">
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
              {projects.map((project) => {
                const loadingAction = projectActionsLoading[project.id];
                return (
                  <section
                    key={project.id}
                    className="flex flex-col gap-3 rounded-2xl border border-surface0/60 bg-mantle/30 p-5 backdrop-blur-md"
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
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="button button-secondary flex h-7 items-center gap-1 border border-surface1 bg-surface0 px-2.5 text-xs text-subtext0 hover:bg-surface1"
                            disabled={!!loadingAction}
                            onClick={() =>
                              handleProjectGitAction(
                                project.id,
                                project.name,
                                "fetch",
                              )
                            }
                          >
                            {loadingAction === "fetch" ? (
                              <span className="spinner border-1.5 size-3 border-subtext0 border-t-transparent" />
                            ) : (
                              <Icon name="cloud_download" size={14} />
                            )}
                            Fetch project
                          </button>
                          <button
                            type="button"
                            className="button button-secondary flex h-7 items-center gap-1 border border-surface1 bg-surface0 px-2.5 text-xs text-subtext0 hover:bg-surface1"
                            disabled={!!loadingAction}
                            onClick={() =>
                              handleProjectGitAction(
                                project.id,
                                project.name,
                                "pull",
                              )
                            }
                          >
                            {loadingAction === "pull" ? (
                              <span className="spinner border-1.5 size-3 border-subtext0 border-t-transparent" />
                            ) : (
                              <Icon name="download" size={14} />
                            )}
                            Pull project
                          </button>
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
                            onClick={() => {
                              // Auto-select this project in AddRepoModal if desired
                              setShowAddRepoModal(true);
                            }}
                          >
                            Add one now
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-surface0/40">
                          {project.repos.map((r) => (
                            <RepoRow
                              key={r.path}
                              repo={r}
                              projectId={project.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
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
