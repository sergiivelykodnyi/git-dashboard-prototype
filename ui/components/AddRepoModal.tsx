import { useState } from 'react';
import { addRepo, getConfig, saveConfig } from '../api';
import { toast } from '../utils/toast';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export function AddRepoModal({ onClose, onAdded }: Props) {
  const [repoPath, setRepoPath] = useState('');
  const [scanDir, setScanDir] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!repoPath.trim() && !scanDir.trim()) { toast('Enter a path', 'err'); return; }
    setLoading(true);
    try {
      if (repoPath.trim()) {
        const res = await addRepo(repoPath.trim());
        if (!res.ok) { toast(res.error ?? 'Failed to add repo', 'err'); setLoading(false); return; }
      }
      if (scanDir.trim()) {
        const cfg = await getConfig();
        await saveConfig(cfg.repoPaths, scanDir.trim());
      }
      toast('Repository added', 'ok');
      onAdded();
      onClose();
    } catch {
      toast('Server error', 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="text-base font-semibold text-text">Add Repository</h3>
        <div>
          <label className="form-label">Repository path (absolute)</label>
          <input
            className="form-input"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="/Users/you/projects/my-repo"
            autoFocus
          />
        </div>
        <div className="h-px bg-surface0" />
        <div>
          <label className="form-label">Or scan a directory for git repos</label>
          <input
            className="form-input"
            value={scanDir}
            onChange={(e) => setScanDir(e.target.value)}
            placeholder="/Users/you/projects"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? <span className="spinner" /> : null} Add
          </button>
        </div>
      </div>
    </div>
  );
}
