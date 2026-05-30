const { useState, useEffect, useMemo, useCallback } = React;

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
}
function nowShort() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('gd-theme') || 'mocha');
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [selected, setSelected] = useState('all');
  const [query, setQuery] = useState('');
  const [log, setLog] = useState([
    { time: '11:07:44 PM', kind: 'info', msg: 'Running fetch all…' },
    { time: '11:07:47 PM', kind: 'ok', msg: 'Fetched 11 repositories' },
    { time: '11:07:50 PM', kind: 'info', msg: 'Running refresh all…' },
    { time: '11:07:50 PM', kind: 'ok', msg: 'Refreshed all repositories' },
  ]);
  const [busy, setBusy] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updated, setUpdated] = useState(nowShort());
  const [modal, setModal] = useState(null); // null | { type:'addRepo', preset } | { type:'newProject' }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gd-theme', theme);
  }, [theme]);

  const addLog = useCallback((kind, msg) => {
    setLog((l) => [...l, { time: nowTime(), kind, msg }].slice(-80));
  }, []);

  // keyboard "/" focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.querySelector('.search input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setRepo = (name, patch) => {
    setProjects((ps) => ps.map((p) => ({
      ...p,
      repos: p.repos.map((r) => (r.name === name ? { ...r, ...patch } : r)),
    })));
  };

  const runAction = useCallback((repo, action) => {
    if (action === 'remove') {
      setProjects((ps) => ps.map((p) => ({ ...p, repos: p.repos.filter((r) => r.name !== repo.name) })));
      addLog('warn', `Removed ${repo.name}`);
      return;
    }
    const verb = { fetch: 'Fetching', pull: 'Pulling', push: 'Pushing' }[action];
    addLog('info', `${verb} ${repo.name}…`);
    setBusy((b) => ({ ...b, [repo.name]: action }));
    setTimeout(() => {
      setBusy((b) => { const n = { ...b }; delete n[repo.name]; return n; });
      if (action === 'fetch') {
        setRepo(repo.name, { fetched: 'just now' });
        addLog('ok', `Fetched ${repo.name} — ${repo.behind ? repo.behind + ' new commit' + (repo.behind > 1 ? 's' : '') : 'up to date'}`);
      } else if (action === 'pull') {
        setRepo(repo.name, { behind: 0, fetched: 'just now' });
        addLog('ok', `Pulled ${repo.name}${repo.behind ? ' — ' + repo.behind + ' commit' + (repo.behind > 1 ? 's' : '') : ' — already current'}`);
      } else if (action === 'push') {
        setRepo(repo.name, { ahead: 0 });
        addLog('ok', `Pushed ${repo.name}${repo.ahead ? ' — ' + repo.ahead + ' commit' + (repo.ahead > 1 ? 's' : '') : ' — nothing to push'}`);
      }
    }, 1100);
  }, [addLog]);

  const fetchAll = useCallback(() => {
    addLog('info', 'Running fetch all…');
    const all = projects.flatMap((p) => p.repos.map((r) => r.name));
    setBusy((b) => { const n = { ...b }; all.forEach((nm) => { n[nm] = 'fetch'; }); return n; });
    setDrawerOpen(true);
    setTimeout(() => {
      setBusy({});
      setProjects((ps) => ps.map((p) => ({ ...p, repos: p.repos.map((r) => ({ ...r, fetched: 'just now' })) })));
      setUpdated(nowShort());
      addLog('ok', `Fetched ${all.length} repositories`);
    }, 1500);
  }, [projects, addLog]);

  // ---- add / create ----
  const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
  const uniqueId = (base) => {
    let id = base, n = 2;
    const taken = new Set(projects.map((p) => p.id));
    while (taken.has(id)) { id = base + '-' + n++; }
    return id;
  };

  const handleAddRepo = useCallback(({ targetId, newProjectName, repo }) => {
    setModal(null);
    if (targetId === '__new__') {
      const id = uniqueId(slugify(newProjectName));
      setProjects((ps) => [...ps, { id, name: newProjectName, repos: [repo] }]);
      setSelected(id);
      addLog('ok', `Created project ${newProjectName} \u00b7 added ${repo.name}`);
    } else {
      setProjects((ps) => ps.map((p) => (p.id === targetId ? { ...p, repos: [...p.repos, repo] } : p)));
      const proj = projects.find((p) => p.id === targetId);
      addLog('ok', `Added ${repo.name}${proj ? ' to ' + proj.name : ''}`);
    }
  }, [projects, addLog]);

  const handleNewProject = useCallback(({ name, repos }) => {
    setModal(null);
    const id = uniqueId(slugify(name));
    setProjects((ps) => [...ps, { id, name, repos }]);
    setSelected(id);
    addLog('ok', `Created project ${name}${repos.length ? ' \u00b7 ' + repos.length + ' repositor' + (repos.length === 1 ? 'y' : 'ies') : ''}`);
  }, [projects, addLog]);

  const openAddRepo = useCallback((preset) => setModal({ type: 'addRepo', preset: preset || null }), []);
  const openNewProject = useCallback(() => setModal({ type: 'newProject' }), []);

  // ---- derive current view ----
  const q = query.trim().toLowerCase();
  const match = (r) => !q || r.name.toLowerCase().includes(q) || r.remote.toLowerCase().includes(q);

  const groups = useMemo(() => {
    const src = selected === 'all' ? projects : projects.filter((p) => p.id === selected);
    return src
      .map((p) => ({ ...p, repos: p.repos.filter(match) }))
      .filter((p) => p.repos.length > 0);
  }, [projects, selected, q]);

  const viewRepos = groups.flatMap((g) => g.repos);
  const attention = viewRepos.filter((r) => repoStatus(r) !== 'clean').length;
  const currentProject = selected === 'all' ? null : projects.find((p) => p.id === selected);
  const showGroupHeads = selected === 'all';

  const title = currentProject ? currentProject.name : 'All repositories';
  const totalInView = currentProject ? currentProject.repos.length : projects.flatMap((p) => p.repos).length;

  return (
    <div className="app">
      <Sidebar
        projects={projects}
        selected={selected}
        onSelect={setSelected}
        query={query}
        setQuery={setQuery}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'mocha' ? 'latte' : 'mocha'))}
        onAdd={() => openAddRepo(selected !== 'all' ? selected : null)}
        onNewProject={openNewProject}
        onFetchAll={fetchAll}
      />

      <div className="main">
        <header className="topbar">
          <div className="topbar-titles">
            <h1>{title}</h1>
            <div className="topbar-sub">
              <span>{totalInView} repositories</span>
              {selected === 'all' && (<React.Fragment><span className="sep" /><span>{projects.length} projects</span></React.Fragment>)}
            </div>
          </div>

          <div className="summary">
            {attention > 0
              ? <span className="chip chip-attn"><Icon name="dot" size={9} /> {attention} need attention</span>
              : <span className="chip chip-clean"><Icon name="check" size={13} strokeWidth={2.6} /> All up to date</span>}
          </div>
          <span className="updated"><Icon name="clock" size={13} /> Updated {updated}</span>
        </header>

        <div className="repo-scroll">
          {groups.length === 0 && <div className="empty">No repositories match “{query}”.</div>}
          {groups.map((g) => (
            <div key={g.id}>
              {showGroupHeads && (
                <div className="group-head">
                  <h2>{g.name}</h2>
                  <span className="ni-count">{g.repos.length}</span>
                  <span className="group-line" />
                </div>
              )}
              {g.repos.map((r) => (
                <RepoRow key={r.name} repo={r} busy={busy[r.name]} onAction={runAction} />
              ))}
            </div>
          ))}
        </div>

        <LogDrawer open={drawerOpen} setOpen={setDrawerOpen} log={log} onClear={() => setLog([])} />
      </div>

      {modal && modal.type === 'addRepo' && (
        <AddRepoModal
          projects={projects}
          presetProjectId={modal.preset}
          onClose={() => setModal(null)}
          onSubmit={handleAddRepo}
        />
      )}
      {modal && modal.type === 'newProject' && (
        <NewProjectModal
          onClose={() => setModal(null)}
          onSubmit={handleNewProject}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
