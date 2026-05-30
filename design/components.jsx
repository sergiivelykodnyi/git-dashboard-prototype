const { useState, useRef, useEffect } = React;

/* ---------- small helpers ---------- */
function statusDots(repos) {
  return repos.map((r) => STATUS_COLOR[repoStatus(r)]);
}

/* ---------- Sidebar ---------- */
function Sidebar({ projects, selected, onSelect, query, setQuery, theme, toggleTheme, onAdd, onNewProject, onFetchAll }) {
  const allRepos = projects.flatMap((p) => p.repos);
  const allCounts = projectCounts(allRepos);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon name="branch" size={17} /></div>
        <div className="brand-name">Git <span>Dashboard</span></div>
      </div>

      <div className="search">
        <Icon name="search" size={15} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repositories…"
          aria-label="Search repositories"
        />
        {query
          ? <button className="act" style={{ width: 20, height: 20 }} onClick={() => setQuery('')} aria-label="Clear"><Icon name="x" size={13} /></button>
          : <kbd>/</kbd>}
      </div>

      <nav className="nav">
        <button
          className={"nav-item" + (selected === 'all' ? ' active' : '')}
          onClick={() => onSelect('all')}
        >
          <span className="ni-icon"><Icon name="layers" size={16} /></span>
          <span className="ni-name">All repositories</span>
          <span className="ni-count">{allCounts.total}</span>
        </button>

        <div className="nav-projects-head">
          <div className="nav-label">Projects</div>
          <button className="np-add" onClick={onNewProject} title="New project" aria-label="New project"><Icon name="plus" size={15} /></button>
        </div>
        {projects.map((p) => {
          const c = projectCounts(p.repos);
          const dots = statusDots(p.repos);
          return (
            <button
              key={p.id}
              className={"nav-item" + (selected === p.id ? ' active' : '')}
              onClick={() => onSelect(p.id)}
            >
              <span className="ni-icon"><Icon name="folder" size={16} /></span>
              <span className="ni-name">{p.name}</span>
              {c.attention > 0
                ? <span className="dots">{dots.map((d, i) => <span key={i} className={"dot " + d} />)}</span>
                : <span className="ni-count">{c.total}</span>}
            </button>
          );
        })}
      </nav>

      <div className="side-foot">
        <div className="side-actions">
          <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={15} /> Add repo</button>
          <button className="btn btn-icon" onClick={onFetchAll} title="Fetch all"><Icon name="fetch" size={16} /></button>
          <button className="btn btn-icon" onClick={toggleTheme} title="Toggle theme">
            <Icon name={theme === 'mocha' ? 'sun' : 'moon'} size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Status pill ---------- */
function StatusPill({ repo }) {
  const st = repoStatus(repo);
  if (st === 'clean') {
    return (
      <span className="status-pill sp-clean" title="Up to date">
        <span className="ico"><Icon name="check" size={12} strokeWidth={2.6} /></span>
      </span>
    );
  }
  if (st === 'dirty') {
    return <span className="status-pill sp-dirty" title="Uncommitted changes"><Icon name="pencil" size={11} /> {repo.dirty}</span>;
  }
  if (st === 'diverged') {
    return (
      <span className="status-pill sp-diverged" title="Diverged">
        <Icon name="arrowUp" size={11} />{repo.ahead}<Icon name="arrowDown" size={11} />{repo.behind}
      </span>
    );
  }
  if (st === 'behind') {
    return <span className="status-pill sp-behind" title="Behind remote"><Icon name="arrowDown" size={11} /> {repo.behind}</span>;
  }
  return <span className="status-pill sp-ahead" title="Ahead of remote"><Icon name="arrowUp" size={11} /> {repo.ahead}</span>;
}

/* ---------- Repo row ---------- */
function RepoRow({ repo, busy, onAction }) {
  const [menu, setMenu] = useState(false);
  const st = repoStatus(repo);
  const attn = st !== 'clean' ? ' attn-' + STATUS_COLOR[st] : '';

  const act = (a) => { setMenu(false); onAction(repo, a); };

  return (
    <div className={"repo" + attn}>
      <div className="repo-icon"><Icon name="folder" size={18} /></div>

      <div className="repo-main">
        <div className="repo-name-row">
          <span className="repo-name">{repo.name}</span>
          <span className="repo-remote mono">{repo.remote}</span>
        </div>
        <div className="repo-meta">
          <span className="branch"><Icon name="branch" size={13} /><span className="mono">{repo.branch}</span></span>
          <span className="m"><Icon name="clock" size={12} /> fetched {repo.fetched}</span>
        </div>
      </div>

      <div className="status"><StatusPill repo={repo} /></div>

      <div className="actions">
        <div className="act-tray">
          <button className={"act" + (busy === 'fetch' ? ' spin' : '')} title="Fetch" onClick={() => act('fetch')}>
            <Icon name="fetch" size={16} className={busy === 'fetch' ? 'spinner' : ''} />
          </button>
          <button className="act" title="Pull" onClick={() => act('pull')}><Icon name="pull" size={16} /></button>
          <button className="act" title="Push" onClick={() => act('push')}><Icon name="push" size={16} /></button>
        </div>
        <div className="menu-wrap">
          <button className="act" title="More" onClick={() => setMenu((m) => !m)}><Icon name="kebab" size={16} /></button>
          {menu && (
            <React.Fragment>
              <div className="scrim" onClick={() => setMenu(false)} />
              <div className="menu" onClick={(e) => e.stopPropagation()}>
                <button className="menu-item" onClick={() => act('fetch')}><span className="mi-ico"><Icon name="fetch" size={15} /></span> Fetch</button>
                <button className="menu-item" onClick={() => act('pull')}><span className="mi-ico"><Icon name="pull" size={15} /></span> Pull</button>
                <button className="menu-item" onClick={() => act('push')}><span className="mi-ico"><Icon name="push" size={15} /></span> Push</button>
                <div className="menu-sep" />
                <button className="menu-item danger" onClick={() => act('remove')}><span className="mi-ico"><Icon name="trash" size={15} /></span> Remove</button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Log drawer ---------- */
function LogDrawer({ open, setOpen, log, onClear }) {
  const bodyRef = useRef(null);
  const last = log[log.length - 1];
  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [open, log.length]);

  return (
    <div className={"drawer" + (open ? ' open' : '')}>
      <button className="drawer-handle" onClick={() => setOpen((o) => !o)}>
        <span className="dh-title"><Icon name="terminal" size={14} /> Output Log</span>
        {!open && last && (
          <span className="dh-ticker"><span className="t">{last.time}</span>&nbsp;&nbsp;{last.msg}</span>
        )}
        <span className="dh-chev"><Icon name="chevronUp" size={16} /></span>
      </button>
      <div className="drawer-body">
        <div className="drawer-inner">
          <div className="log" ref={bodyRef}>
            {log.length === 0 && <div style={{ color: 'var(--overlay0)' }}>No activity yet.</div>}
            {log.map((l, i) => (
              <div className="log-row" key={i}>
                <span className="log-time">{l.time}</span>
                <span className={"log-msg " + l.kind}>{l.msg}</span>
              </div>
            ))}
          </div>
          <div className="log-foot"><button className="btn-clear" onClick={onClear}>Clear</button></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, StatusPill, RepoRow, LogDrawer, statusDots });
