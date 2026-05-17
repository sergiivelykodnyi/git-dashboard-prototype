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
    <div className="bg-mantle border border-surface0 rounded-xl py-4 px-5">
      <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-overlay1 font-mono mb-3.5 flex justify-between items-center">
        <span>Output Log</span>
        {logs.length > 0 && (
          <button className="btn !py-0.5 !px-2 !text-[10px]" onClick={clearLogs}>
            Clear
          </button>
        )}
      </div>
      <div className="bg-crust border border-surface0 rounded-lg py-3 px-3.5 font-mono text-xs text-subtext1 max-h-[160px] overflow-y-auto whitespace-pre-wrap leading-[1.6]" ref={ref}>
        {logs.length === 0
          ? <span className="text-overlay0">No output yet.</span>
          : logs.map((l) => (
            <div key={l.id} className="flex gap-2.5 items-start">
              <span className="text-overlay0 shrink-0">{l.time}</span>
              <span className={l.type === 'ok' ? 'text-green' : l.type === 'err' ? 'text-red' : 'text-blue'}>{l.msg}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
