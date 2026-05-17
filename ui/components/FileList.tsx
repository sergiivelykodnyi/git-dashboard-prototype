import type { GitFile } from '../types';

interface Props { files: GitFile[] }

const statusClass: Record<string, string> = {
  M: 'fs-M', A: 'fs-A', D: 'fs-D', R: 'fs-R',
  '?': 'fs-unknown', ' ': 'fs-unknown',
};

function fileStatus(f: GitFile) {
  const s = (f.index !== ' ' && f.index !== '?') ? f.index : f.working_dir;
  return s || '?';
}

export function FileList({ files }: Props) {
  if (!files.length) return null;
  return (
    <div className="bg-mantle border border-surface0 rounded-xl py-4 px-5">
      <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-overlay1 font-mono mb-3.5">Changed Files ({files.length})</div>
      <div className="flex flex-col gap-1">
        {files.map((f) => {
          const s = fileStatus(f);
          return (
            <div key={f.path} className="flex items-center gap-2.5 py-[7px] px-2.5 rounded-md bg-base border border-surface0 font-mono text-xs">
              <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[10px] font-bold shrink-0 ${statusClass[s] ?? 'fs-unknown'}`}>{s}</div>
              <div className="flex-1 text-subtext1">{f.path}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
