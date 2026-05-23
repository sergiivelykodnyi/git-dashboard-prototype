import { useState } from "react";
import { Icon } from "./components/Icon";
import { Header } from "./components/Header";
import { RepoRow } from "./components/RepoRow";
import { LogOutput } from "./components/LogOutput";
import { AddRepoModal } from "./components/AddRepoModal";
import { ToastContainer } from "./components/Toast";
import { useRepos } from "./hooks/useRepos";
import { useAppStore } from "./store";
import { fetchAllRepos } from "./api";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { refresh } = useRepos();
  const { repos, setRepos, addLog } = useAppStore();

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
      setRepos(updated);
      addLog("Fetched all repositories", "ok");
    } finally {
      setFetching(false);
    }
  };

  return (
    <>
      <Header
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onFetchAll={handleFetchAll}
        fetching={fetching}
        onAddRepo={() => setShowModal(true)}
      />
      <main className="h-[calc(100vh-56px)] flex-1 overflow-y-auto p-6">
        {repos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-overlay0">
            <Icon name="bookmarks" size={56} style={{ opacity: 0.25 }} />
            <h3 className="font-medium text-subtext0">No repositories yet</h3>
            <p className="max-w-xs text-sm">Add a repository to get started.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Add repository
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            {repos.map((r) => (
              <RepoRow key={r.path} repo={r} />
            ))}
            <LogOutput />
          </div>
        )}
      </main>

      {showModal && (
        <AddRepoModal
          onClose={() => setShowModal(false)}
          onAdded={handleRefresh}
        />
      )}

      <ToastContainer />
    </>
  );
}

export default App;
