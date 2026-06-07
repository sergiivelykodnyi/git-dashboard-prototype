import { useState, useEffect, useRef } from "react";
import { useServices } from "@ui/hooks/useServices";
import { observer } from "mobx-react-lite";
import { Icon } from "@ui/components/Icon";
import type { ProjectConfig } from "@ui/types";
import { Button } from "@ui/components/Button";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface RepoRowItem {
  id: string;
  path: string;
  name: string;
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
}

function deriveName(src: string): string {
  if (!src) return "";
  const s = src
    .trim()
    .replace(/\.git$/i, "")
    .replace(/[/\\\\]+$/, "");
  const parts = s.split(/[/\\:]/).filter(Boolean);
  return (parts[parts.length - 1] || "").trim();
}

export const NewProjectModal = observer(function NewProjectModal(props: Readonly<Props>) {
  const { onClose, onCreated } = props;
  const { appService } = useServices();

  const [projectName, setProjectName] = useState("");
  const [rows, setRows] = useState<RepoRowItem[]>([
    {
      id: "row-0",
      path: "",
      name: "",
      isValidating: false,
      isValid: false,
      error: null,
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Add another repository row
  const addRow = () => {
    const nextId = `row-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        path: "",
        name: "",
        isValidating: false,
        isValid: false,
        error: null,
      },
    ]);
  };

  // Remove a repository row
  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.id !== id),
    );
  };

  // Update a specific row field
  const updateRow = (id: string, updates: Partial<RepoRowItem>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

  const pathsSerialized = rows.map((r) => r.path).join(",");
  const rowsRef = useRef(rows);

  useEffect(() => {
    rowsRef.current = rows;
  });

  // Debounced path validation for each row
  useEffect(() => {
    const timeouts = rowsRef.current.map((row) => {
      const cleanPath = row.path.trim();
      const timer = setTimeout(async () => {
        if (!cleanPath) {
          // Empty path is considered reset
          updateRow(row.id, {
            isValid: false,
            error: null,
            isValidating: false,
          });
          return;
        }

        updateRow(row.id, { isValidating: true });
        try {
          const res = await appService.validateDirectory(cleanPath);
          if (res.valid) {
            updateRow(row.id, {
              isValid: true,
              error: null,
              isValidating: false,
              name: row.name || res.name || deriveName(cleanPath),
            });
          } else {
            updateRow(row.id, {
              isValid: false,
              error: res.error ?? "Not a valid git repository",
              isValidating: false,
            });
          }
        } catch {
          updateRow(row.id, {
            isValid: false,
            error: "Error validating path",
            isValidating: false,
          });
        }
      }, 500);

      return { id: row.id, timer };
    });

    return () => {
      timeouts.forEach((item) => {
        if (item?.timer) clearTimeout(item.timer);
      });
    };
  }, [pathsSerialized, appService]);

  // Submit and save config
  const handleCreate = async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) {
      appService.showToast("Project name required", "err");
      return;
    }

    // Prepare repos list
    const repos = rows
      .filter((r) => r.path.trim().length > 0)
      .map((r) => ({
        name: r.name.trim() || deriveName(r.path),
        path: r.path.trim(),
      }));

    // Ensure all active paths are valid
    const hasInvalid = rows.some(
      (r) => r.path.trim().length > 0 && (!r.isValid || r.isValidating),
    );
    if (hasInvalid) {
      appService.showToast("Please correct invalid repository paths", "err");
      return;
    }

    setLoading(true);
    try {
      const currentConfig = await appService.getConfig();

      // Kebab-case project ID with collision validation
      let kebabId = trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (!kebabId) kebabId = "project";

      let finalId = kebabId;
      let counter = 2;
      while (currentConfig.some((p) => p.id === finalId)) {
        finalId = `${kebabId}-${counter++}`;
      }

      const newProject: ProjectConfig = {
        id: finalId,
        name: trimmedName,
        repos,
      };

      const nextConfig = [...currentConfig, newProject];
      const res = await appService.saveConfig(nextConfig);

      if (res.ok) {
        appService.showToast(`Project "${trimmedName}" created`, "ok");
        onCreated();
        onClose();
      } else {
        appService.showToast("Failed to save project", "err");
      }
    } catch {
      appService.showToast("Server error creating project", "err");
    } finally {
      setLoading(false);
    }
  };

  // Check form validity
  const activeRows = rows.filter((r) => r.path.trim().length > 0);
  const allActiveValid = activeRows.every((r) => r.isValid && !r.isValidating);
  const isNameProvided = projectName.trim().length > 0;
  const formValid = isNameProvided && allActiveValid && !loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal flex w-full max-w-xl flex-col gap-4 rounded-xl border border-surface1 bg-mantle p-6 shadow-2xl">
        {/* Modal Head */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mauve/15 text-mauve">
            <Icon name="create_new_folder" size={19} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              New project
            </h3>
            <p className="mt-0.5 text-xs text-subtext0">
              Group related repositories. Add some now or later.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer text-subtext0 hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto py-2 pr-1">
          {/* Project Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext0">
              Project name
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-subtext0">
                <Icon name="folder" size={15} />
              </span>
              <input
                className="w-full rounded-lg border border-surface1 bg-crust py-2 pr-3 pl-9 text-sm text-foreground placeholder-overlay0"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Payments Platform"
                autoFocus
              />
            </div>
          </div>

          {/* Repository Group */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between text-xs font-medium text-subtext0">
              <span>Repositories</span>
              <span className="text-[10px] text-overlay1 uppercase italic">
                optional
              </span>
            </label>

            <div className="flex flex-col gap-4">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="relative flex flex-col gap-2 rounded-xl border border-surface0/60 bg-crust/40 p-3"
                >
                  {/* Remove row button */}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-md text-subtext0 transition-colors hover:bg-surface0 hover:text-red"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove repository"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}

                  <div className="text-[10px] font-semibold tracking-wide text-overlay1 uppercase">
                    Repository #{idx + 1}
                  </div>

                  {/* Folder path row */}
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-subtext0">
                      <Icon name="database" size={14} />
                    </span>
                    <input
                      className={`w-full rounded-lg border bg-crust/80 py-1.5 pr-3 pl-9 font-mono text-xs text-foreground placeholder-overlay0 ${
                        row.path && !row.isValidating
                          ? row.isValid
                            ? "border-green/30"
                            : "border-red/30"
                          : "border-surface1"
                      }`}
                      value={row.path}
                      onChange={(e) =>
                        updateRow(row.id, { path: e.target.value })
                      }
                      placeholder="/Users/you/code/my-repo"
                    />
                    {row.isValidating && (
                      <span className="absolute right-3 flex h-4 w-4 items-center justify-center">
                        <span className="spinner border-1.5 size-3 border-mauve border-t-transparent" />
                      </span>
                    )}
                  </div>

                  {/* Repository name row */}
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-subtext0">
                      <Icon name="label" size={14} />
                    </span>
                    <input
                      className="w-full rounded-lg border border-surface1 bg-crust/80 py-1.5 pr-3 pl-9 text-xs text-foreground placeholder-overlay0"
                      value={row.name}
                      onChange={(e) =>
                        updateRow(row.id, { name: e.target.value })
                      }
                      placeholder="Repository display name"
                    />
                  </div>

                  {/* Individual Validation Message */}
                  {row.path && !row.isValidating && !row.isValid && (
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-red">
                      <Icon name="error" size={12} />
                      {row.error ?? "Not a valid git repository"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="group flex cursor-pointer items-center gap-1.5 self-start py-1.5 text-xs font-medium text-mauve hover:text-mauve/80"
              onClick={addRow}
            >
              <span className="flex size-5 items-center justify-center rounded-md border border-mauve/30 bg-mauve/5 transition-colors group-hover:border-mauve">
                <Icon name="add" size={12} />
              </span>
              <span>Add another repository</span>
            </button>
          </div>
        </div>

        {/* Modal Foot */}
        <div className="mt-1 flex items-center justify-between border-t border-surface0 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-subtext0">
            <Icon name="fork_right" size={14} />
            <span>
              {activeRows.length === 0
                ? "No repositories yet"
                : `${activeRows.length} repositor${activeRows.length === 1 ? "y" : "ies"}`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!formValid}
            >
              {loading ? (
                <span className="spinner border-1.5 mr-1 size-3.5 border-background border-t-transparent" />
              ) : null}
              Create project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
