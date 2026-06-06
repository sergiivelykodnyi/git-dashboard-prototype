import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "@ui/components/Header";
import { Sidebar } from "@ui/components/Sidebar";
import { LogOutput } from "@ui/components/LogOutput";
import { AddRepoModal } from "@ui/components/AddRepoModal";
import { NewProjectModal } from "@ui/components/NewProjectModal";
import { ToastContainer } from "@ui/components/Toast";
import { useRepos } from "@ui/hooks/useRepos";
import { useServices } from "@ui/hooks/useServices";
import { ProjectsPage } from "@ui/pages/ProjectsPage";
import { ProjectPage } from "@ui/pages/ProjectPage";
import { observer } from "mobx-react-lite";

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
            <Route path="/" element={<ProjectsPage />} />
            <Route
              path="/projects/:projectId"
              element={<ProjectPage />}
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
