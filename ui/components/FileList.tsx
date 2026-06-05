import { type ComponentProps } from "react";
import clsx from "clsx";
import type { GitFile } from "@ui/types";

interface Props extends ComponentProps<"div"> {
  files: GitFile[];
}

const statusClass: Record<string, string> = {
  M: "file-status-m",
  A: "file-status-a",
  D: "file-status-d",
  R: "file-status-r",
  "?": "file-status-unknown",
  " ": "file-status-unknown",
};

function fileStatus(f: GitFile) {
  const s = f.index !== " " && f.index !== "?" ? f.index : f.working_dir;
  return s || "?";
}

export function FileList(props: Readonly<Props>) {
  const { files, className, ...rest } = props;
  if (!files.length) return null;
  return (
    <div
      className={clsx(
        "rounded-xl border border-surface0 bg-mantle px-6 py-4",
        className,
      )}
      {...rest}
    >
      <div className="mb-4 text-xs font-semibold tracking-widest text-overlay1 uppercase">
        Changed Files ({files.length})
      </div>
      <div className="flex flex-col gap-1">
        {files.map((f) => {
          const s = fileStatus(f);
          return (
            <div
              key={f.path}
              className="bg-base flex items-center gap-2 rounded-md border border-surface0 px-2 py-2 font-mono text-xs"
            >
              <div
                className={clsx(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded text-xs font-bold",
                  statusClass[s] ?? "file-status-unknown",
                )}
              >
                {s}
              </div>
              <div className="flex-1 text-subtext1">{f.path}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
