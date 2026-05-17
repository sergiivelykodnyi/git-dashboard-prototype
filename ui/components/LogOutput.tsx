import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';

export function LogOutput() {
  const logs = useAppStore((s) => s.logs);
  const clearLogs = useAppStore((s) => s.clearLogs);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div className="bg-mantle border border-surface0 rounded-xl py-4 px-6">
      <div className="text-xs font-semibold tracking-widest uppercase text-overlay1 font-mono mb-4 flex justify-between items-center">
        <span>Output Log</span>
        {logs.length > 0 && (
          <button className="btn py-1 px-2 text-xs" onClick={clearLogs}>
            Clear
          </button>
        )}
      </div>
      <div className="bg-crust border border-surface0 rounded-lg py-4 px-4 font-mono text-xs text-subtext1 max-h-40 overflow-y-auto whitespace-pre-wrap" ref={ref}>
        {logs.length === 0
          ? <span className="text-overlay0">No output yet.</span>
          : logs.map((l) => (
            <div key={l.id} className="flex gap-2 items-start">
              <span className="text-overlay0 shrink-0">{l.time}</span>
              <span className={l.type === 'ok' ? 'text-green' : l.type === 'err' ? 'text-red' : 'text-blue'}>{l.msg}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
