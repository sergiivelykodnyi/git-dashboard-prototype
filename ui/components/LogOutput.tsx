import { useEffect, useRef, type ComponentProps } from "react";
import { Icon } from "@ui/components/Icon";
import { useAppStore } from "@ui/store";
import clsx from "clsx";

const typeColorMap = {
  ok: "text-green",
  err: "text-red",
  info: "text-blue",
} as const;

export function LogOutput(props: Readonly<ComponentProps<"div">>) {
  const { className, ...rest } = props;
  const logs = useAppStore((s) => s.logs);
  const clearLogs = useAppStore((s) => s.clearLogs);
  const isLogOpen = useAppStore((s) => s.isLogOpen);
  const toggleLogOpen = useAppStore((s) => s.toggleLogOpen);
  const bodyRef = useRef<HTMLDivElement>(null);

  const lastLog = logs[logs.length - 1];

  useEffect(() => {
    if (isLogOpen && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [isLogOpen, logs.length]);

  return (
    <div
      className={clsx(
        "shrink-0 border-t border-surface0 bg-mantle transition-colors duration-150",
        className,
      )}
      {...rest}
    >
      {/* Drawer Handle */}
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 px-6 py-3 text-left transition-colors duration-150 hover:bg-surface0/50 focus:outline-none"
        onClick={toggleLogOpen}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-subtext1">
          <Icon name="terminal_2" size={16} />
          Output Log
        </span>

        {!isLogOpen && lastLog && (
          <span className="flex-1 truncate font-mono text-sm text-overlay1">
            <span className="text-overlay0">{lastLog.time}</span>
            {"  "}
            {lastLog.msg}
          </span>
        )}

        {(isLogOpen || !lastLog) && <span className="flex-1" />}

        <span
          className={clsx(
            "flex text-overlay1 transition-transform duration-150",
            isLogOpen && "rotate-180",
          )}
        >
          <Icon name="keyboard_arrow_up" size={16} />
        </span>
      </button>

      {/* Drawer Body */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isLogOpen ? "h-80" : "h-0",
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto px-6 font-mono text-sm"
          >
            {logs.length === 0 ? (
              <div className="text-overlay0">No activity yet.</div>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="flex gap-3">
                  <span className="shrink-0 text-overlay0 select-none">
                    {l.time}
                  </span>
                  <span
                    className={clsx(typeColorMap[l.type] ?? "text-subtext1")}
                  >
                    {l.msg}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end px-6 pt-1 pb-2">
            <button
              type="button"
              className="button button-secondary"
              onClick={clearLogs}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
