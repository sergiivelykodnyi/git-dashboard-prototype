import { type ComponentProps } from "react";
import clsx from "clsx";
import { Icon } from "./Icon";
import { useAppStore } from "../store";

interface Props extends ComponentProps<"header"> {
  onRefresh: () => void;
  refreshing: boolean;
  onFetchAll: () => void;
  fetching: boolean;
  onAddRepo: () => void;
}

export function Header(props: Readonly<Props>) {
  const {
    onRefresh,
    refreshing,
    onFetchAll,
    fetching,
    onAddRepo,
    className,
    ...rest
  } = props;
  const { lastRefresh } = useAppStore();

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 h-16 border-b border-surface0 bg-mantle px-6",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-mauve uppercase">
            <Icon name="fork_right" size={24} />
            git dashboard
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="px-2 py-1 text-xs text-overlay0">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button className="btn" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? (
              <span className="spinner" />
            ) : (
              <Icon
                name="sync"
                size={16}
                className={refreshing ? "spin" : ""}
              />
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
              <Icon name="cloud_download" size={16} />
            )}{" "}
            Fetch all
          </button>
          <button className="btn btn-primary" onClick={onAddRepo}>
            <Icon name="add" size={16} /> Add repo
          </button>
        </div>
      </div>
    </header>
  );
}
