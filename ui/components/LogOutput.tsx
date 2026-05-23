import { useEffect, useRef, type ComponentProps } from "react";
import { useAppStore } from "../store";
import clsx from "clsx";

export function LogOutput(props: ComponentProps<"div">) {
  const { className, ...rest } = props;
  const logs = useAppStore((s) => s.logs);
  const clearLogs = useAppStore((s) => s.clearLogs);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div
      className={clsx(
        "rounded-xl border border-surface0 bg-mantle px-6 py-4",
        className,
      )}
      {...rest}
    >
      <div className="mb-4 flex items-center justify-between text-xs font-semibold tracking-widest text-overlay1 uppercase">
        <span>Output Log</span>
        {logs.length > 0 && (
          <button className="btn px-2 py-1 text-xs" onClick={clearLogs}>
            Clear
          </button>
        )}
      </div>
      <div
        className="max-h-40 overflow-y-auto rounded-lg border border-surface0 bg-crust px-4 py-4 font-mono text-xs whitespace-pre-wrap text-subtext1"
        ref={ref}
      >
        {logs.length === 0 ? (
          <span className="text-overlay0">No output yet.</span>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="flex items-start gap-2">
              <span className="shrink-0 text-overlay0">{l.time}</span>
              <span
                className={
                  l.type === "ok"
                    ? "text-green"
                    : l.type === "err"
                      ? "text-red"
                      : "text-blue"
                }
              >
                {l.msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
