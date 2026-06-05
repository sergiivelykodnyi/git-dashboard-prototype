import { useState, useEffect, useRef } from "react";
import { addRepo, validateDirectory } from "@ui/api";
import { useAppStore } from "@ui/store";
import { toast } from "@ui/utils/toast";
import { Icon } from "@ui/components/Icon";
import { Button } from "@ui/components/Button";

interface Props {
  onClose: () => void;
  onAdded: () => void;
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

export function AddRepoModal(props: Readonly<Props>) {
  const { onClose, onAdded } = props;
  const { projects } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || "",
  );
  const [folderPath, setFolderPath] = useState("");
  const [repoName, setRepoName] = useState("");

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);

  // Close project picker on click outside
  useEffect(() => {
    if (!pickerOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [pickerOpen]);

  // Handle path validation on input change or browse selection
  useEffect(() => {
    const cleanPath = folderPath.trim();

    const timer = setTimeout(async () => {
      if (!cleanPath) {
        setIsValid(false);
        setValidationError(null);
        return;
      }

      setIsValidating(true);
      try {
        const res = await validateDirectory(cleanPath);
        if (res.valid) {
          setIsValid(true);
          setValidationError(null);
          // Auto-fill repository name if not already customized
          setRepoName((currentName) => {
            if (!currentName || currentName === deriveName(folderPath)) {
              return res.name ?? deriveName(cleanPath);
            }
            return currentName;
          });
        } else {
          setIsValid(false);
          setValidationError(res.error ?? "Not a valid git repository");
        }
      } catch {
        setIsValid(false);
        setValidationError("Error validating path");
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [folderPath]);

  const handleAdd = async () => {
    if (!selectedProjectId) {
      toast("Please select a project", "err");
      return;
    }
    if (!isValid) {
      toast("Invalid git repository path", "err");
      return;
    }
    if (!repoName.trim()) {
      toast("Please provide a repository name", "err");
      return;
    }

    setLoading(true);
    try {
      const res = await addRepo(
        selectedProjectId,
        repoName.trim(),
        folderPath.trim(),
      );
      if (res.ok) {
        toast("Repository added", "ok");
        onAdded();
        onClose();
      } else {
        toast(res.error ?? "Failed to add repository", "err");
      }
    } catch {
      toast("Server error adding repository", "err");
    } finally {
      setLoading(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const formValid =
    selectedProjectId && isValid && repoName.trim().length > 0 && !loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal flex w-full max-w-lg flex-col gap-4 rounded-xl border border-surface1 bg-mantle p-6 shadow-2xl">
        {/* Modal Head */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mauve/15 text-mauve">
            <Icon name="add_2" size={19} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Add repository
            </h3>
            <p className="mt-0.5 text-xs text-subtext0">
              Choose a folder that is already on disk to track.
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
        <div className="flex flex-col gap-4 py-2">
          {/* Project Selection */}
          <div className="flex flex-col gap-1.5" ref={pickerRef}>
            <label className="text-xs font-medium text-subtext0">
              Add to project
            </label>
            <div className="relative">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-surface1 bg-crust px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface0"
                onClick={() => setPickerOpen(!pickerOpen)}
              >
                <div className="flex items-center gap-2">
                  <Icon name="folder" className="text-mauve" size={16} />
                  <span>
                    {currentProject ? currentProject.name : "Select a project"}
                  </span>
                </div>
                <Icon
                  name="chevron_right"
                  className="rotate-90 text-subtext0"
                  size={16}
                />
              </button>

              {pickerOpen && (
                <div className="absolute top-full left-0 z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-surface1 bg-mantle p-1 shadow-2xl">
                  {projects.length === 0 ? (
                    <div className="p-3 text-center text-xs text-subtext0">
                      No projects available. Please create one first.
                    </div>
                  ) : (
                    projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface0 ${
                          p.id === selectedProjectId
                            ? "bg-surface0/50 font-medium text-mauve"
                            : "text-subtext1"
                        }`}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setPickerOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon name="folder" size={15} />
                          <span>{p.name}</span>
                        </div>
                        <span className="rounded-full bg-surface0 px-2 py-0.5 text-xs text-subtext0">
                          {p.repos.length}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Folder Path Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext0">
              Folder path
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-subtext0">
                <Icon name="database" size={15} />
              </span>
              <input
                ref={valueRef}
                className={`w-full rounded-lg border bg-crust py-2 pr-3 pl-9 font-mono text-sm text-foreground placeholder-overlay0 ${
                  folderPath && !isValidating
                    ? isValid
                      ? "border-green/30"
                      : "border-red/30"
                    : "border-surface1"
                }`}
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="/Users/you/code/my-project"
                autoFocus
              />
              {isValidating && (
                <span className="absolute right-3 flex h-4 w-4 items-center justify-center">
                  <span className="spinner border-1.5 size-3.5 border-mauve border-t-transparent" />
                </span>
              )}
            </div>
          </div>

          {/* Repository Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subtext0">
              Name of repository
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-subtext0">
                <Icon name="label" size={15} />
              </span>
              <input
                className="w-full rounded-lg border border-surface1 bg-crust py-2 pr-3 pl-9 text-sm text-foreground placeholder-overlay0"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="Name of repository"
              />
            </div>
          </div>
        </div>

        {/* Modal Foot */}
        <div className="mt-1 flex items-center justify-between border-t border-surface0 pt-4">
          <div className="flex items-center gap-1.5 text-xs">
            {isValidating && (
              <span className="text-subtext0">Validating repository...</span>
            )}
            {!isValidating && folderPath && !isValid && (
              <span className="flex items-center gap-1 text-red">
                <Icon name="error" size={14} />
                {validationError ?? "Not a valid git repository"}
              </span>
            )}
            {!isValidating && isValid && (
              <span className="flex items-center gap-1 text-green">
                <Icon name="check" size={14} />
                Valid git repository
              </span>
            )}
            {!folderPath && (
              <span className="flex items-center gap-1 text-subtext0">
                <Icon name="info" size={14} />
                <span>Adds to project </span>
                <span className="font-mono text-foreground">
                  {currentProject?.name || "..."}
                </span>
              </span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={!formValid}>
              {loading ? (
                <span className="spinner border-1.5 mr-1 size-3.5 border-background border-t-transparent" />
              ) : null}
              Add repository
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
