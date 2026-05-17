import { RefreshCw, Plus, GitBranch, CloudDownload } from "lucide-react";
import { useAppStore } from "../store";

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
  onFetchAll: () => void;
  fetching: boolean;
  onAddRepo: () => void;
}

export function Header({
  onRefresh,
  refreshing,
  onFetchAll,
  fetching,
  onAddRepo,
}: Props) {
  const { lastRefresh } = useAppStore();

  return (
    <header className="bg-mantle border-b border-surface0 px-6 h-14 flex items-center justify-between sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-mono font-semibold text-base text-mauve tracking-tight">
          <GitBranch size={18} />
          git dashboard
        </div>
      </div>
      <div className="flex items-center gap-2">
        {lastRefresh && (
          <span className="text-xs font-mono text-overlay0 px-2 py-1">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        )}
        <button className="btn" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <span className="spinner" />
          ) : (
            <RefreshCw size={12} className={refreshing ? "spin" : ""} />
          )}{" "}
          Refresh all
        </button>
        <button
          className="btn btn-blue"
          onClick={onFetchAll}
          disabled={fetching}
        >
          {fetching ? (
            <span className="spinner" />
          ) : (
            <CloudDownload size={12} />
          )}{" "}
          Fetch all
        </button>
        <button className="btn btn-primary" onClick={onAddRepo}>
          <Plus size={12} /> Add repo
        </button>
      </div>
    </header>
  );
}
