const { useState, useEffect, useRef } = React;

/* ---------- helpers ---------- */
function deriveName(src) {
  if (!src) return '';
  const s = src.trim().replace(/\.git$/i, '').replace(/[\/\\]+$/, '');
  const parts = s.split(/[\/\\:]/).filter(Boolean);
  return (parts[parts.length - 1] || '').trim();
}
function normalizeRemote(url) {
  return url.trim().
  replace(/^https?:\/\//i, '').
  replace(/^git@/i, '').
  replace(/:(?=[^\/])/, '/').
  replace(/\.git$/i, '').
  replace(/[\/]+$/, '');
}
function buildRepo({ source, value, name, branch }) {
  return {
    name: name.trim(),
    remote: source === 'remote' ? normalizeRemote(value) : value.trim(),
    branch: (branch || 'main').trim() || 'main',
    ahead: 0, behind: 0, dirty: 0, fetched: 'just now'
  };
}
const SAMPLE_PATHS = ['~/code/payments-api', '~/code/web-client', '~/dev/data-pipeline', '~/work/auth-service'];

/* ---------- generic modal shell ---------- */
function Modal({ icon, title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-scrim" onMouseDown={(e) => {if (e.target === e.currentTarget) onClose();}}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-icon"><Icon name={icon} size={19} /></div>
          <div className="modal-head-titles">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="x" size={17} /></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>);

}

/* ---------- project picker (existing or create new) ---------- */
function ProjectPicker({ projects, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const current = projects.find((p) => p.id === value);
  const label = current ? current.name : 'Select a project';

  return (
    <div className="psel-wrap" ref={ref}>
      <button type="button" className={"psel" + (open ? ' open' : '')} onClick={() => setOpen((o) => !o)}>
        <span className="psel-ico"><Icon name="folder" size={16} /></span>
        <span className="psel-name">{label}</span>
        <span className="psel-chev"><Icon name="chevronDown" size={16} /></span>
      </button>
      {open &&
      <div className="psel-menu">
          {projects.map((p) =>
        <button key={p.id} type="button" className={"psel-item" + (p.id === value ? ' sel' : '')} onClick={() => {onChange(p.id);setOpen(false);}}>
              <span className="pi-ico"><Icon name="folder" size={15} /></span>
              <span className="psel-name">{p.name}</span>
              <span className="pi-count">{p.repos.length}</span>
            </button>
        )}
        </div>
      }
    </div>);

}

/* ---------- Add repository ---------- */
function AddRepoModal({ projects, presetProjectId, onClose, onSubmit }) {
  const [value, setValue] = useState('');
  const [target, setTarget] = useState(presetProjectId || projects[0] && projects[0].id);
  const valueRef = useRef(null);

  useEffect(() => {valueRef.current && valueRef.current.focus();}, []);

  const derived = deriveName(value);
  const valueValid = value.trim().length > 0;
  const nameValid = derived.length > 0;
  const valid = valueValid && nameValid;

  const dest = (projects.find((p) => p.id === target) || {}).name;

  const submit = () => {
    if (!valid) return;
    onSubmit({ targetId: target, repo: buildRepo({ source: 'local', value, name: derived, branch: 'main' }) });
  };
  const onEnter = (e) => {if (e.key === 'Enter') {e.preventDefault();submit();}};

  const browse = () => {
    if (!value.trim()) {
      const pick = SAMPLE_PATHS[Math.floor(Math.random() * SAMPLE_PATHS.length)];
      setValue(pick);
    }
    valueRef.current && valueRef.current.focus();
  };

  return (
    <Modal
      icon="plus"
      title="Add repository"
      subtitle="Choose a folder already on disk to track."
      onClose={onClose}
      footer={
      <React.Fragment>
          <span className="foot-note grow">
            <Icon name="folder" size={14} />
            <span>Adds to</span> <span className="mono">{dest}</span>
          </span>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>Add repository</button>
        </React.Fragment>
      }>
      
      <div className="field">
        <label className="field-label">Add to project</label>
        <ProjectPicker projects={projects} value={target} onChange={setTarget} />
      </div>

      <div className="field">
        <label className="field-label">Folder path</label>
        <div className="field-row">
          <div className={"input mono" + (value && !valueValid ? ' invalid' : '')} style={{ flex: 1 }}>
            <span className="lead"><Icon name="hardDrive" size={15} /></span>
            <input ref={valueRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onEnter} placeholder="~/code/service" />
          </div>
          <button type="button" className="btn-add-inline" onClick={browse}><Icon name="folder" size={15} /> Browse</button>
        </div>
      </div>
    </Modal>);

}

/* ---------- New project (name + repo rows) ---------- */
function NewProjectModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [paths, setPaths] = useState(['']);

  const setPath = (i, v) => setPaths((ps) => ps.map((p, idx) => idx === i ? v : p));
  const addRow = () => setPaths((ps) => [...ps, '']);
  const removeRow = (i) => setPaths((ps) => ps.length <= 1 ? [''] : ps.filter((_, idx) => idx !== i));
  const browseRow = (i) => {
    if (!paths[i].trim()) {
      const pick = SAMPLE_PATHS[Math.floor(Math.random() * SAMPLE_PATHS.length)];
      setPath(i, pick);
    }
  };

  const cleanPaths = paths.map((p) => p.trim()).filter(Boolean);
  const valid = name.trim().length > 0;

  const buildRepos = () => {
    const out = [];
    const seen = new Set();
    cleanPaths.forEach((p) => {
      const repo = buildRepo({ source: 'local', value: p, name: deriveName(p), branch: 'main' });
      let nm = repo.name || 'repo',base = nm,n = 2;
      while (seen.has(nm)) {nm = base + '-' + n++;}
      repo.name = nm;seen.add(nm);
      out.push(repo);
    });
    return out;
  };
  const submit = () => {if (valid) onSubmit({ name: name.trim(), repos: buildRepos() });};
  const onNameKey = (e) => {if (e.key === 'Enter') {e.preventDefault();submit();}};

  return (
    <Modal
      icon="folderPlus"
      title="New project"
      subtitle="Group related repositories. Add some now or later."
      onClose={onClose}
      footer={
      <React.Fragment>
          <span className="foot-note grow">
            <Icon name="branch" size={14} />
            <span>{cleanPaths.length === 0 ? 'No repositories yet' : cleanPaths.length + ' repositor' + (cleanPaths.length === 1 ? 'y' : 'ies')}</span>
          </span>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>Create project</button>
        </React.Fragment>
      }>
      
      <div className="field">
        <label className="field-label">Project name</label>
        <div className="input">
          <span className="lead"><Icon name="folderPlus" size={15} /></span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onNameKey} placeholder="e.g. Payments Platform" />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Repositories <span className="opt">— optional</span></label>
        <div className="repo-rows">
          {paths.map((p, i) =>
          <div className="field-row" key={i}>
              <div className="input mono" style={{ flex: 1 }}>
                <span className="lead"><Icon name="hardDrive" size={15} /></span>
                <input value={p} onChange={(e) => setPath(i, e.target.value)} placeholder="~/code/service" />
              </div>
              <button type="button" className="btn-add-inline" onClick={() => browseRow(i)}><Icon name="folder" size={15} /> Browse</button>
              {paths.length > 1 &&
            <button type="button" className="sr-del" style={{ alignSelf: 'center' }} onClick={() => removeRow(i)} aria-label="Remove repository"><Icon name="x" size={14} /></button>}
            </div>
          )}
        </div>
        <button type="button" className="add-another" onClick={addRow}><span className="aa-ico"><Icon name="plus" size={15} /></span> Add another repository</button>
      </div>
    </Modal>);

}

Object.assign(window, { Modal, AddRepoModal, NewProjectModal, deriveName, normalizeRemote, buildRepo });