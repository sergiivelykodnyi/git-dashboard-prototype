// Seed data + status helpers for the Git Dashboard.

const SEED_PROJECTS = [
  {
    id: 'acme',
    name: 'Acme Platform',
    repos: [
      { name: 'backend',   remote: 'github.com/acme/backend',   branch: 'main', ahead: 0, behind: 0,  dirty: 0, fetched: '2m ago' },
      { name: 'frontend',  remote: 'github.com/acme/frontend',  branch: 'main', ahead: 0, behind: 36, dirty: 0, fetched: '2m ago' },
      { name: 'libraries', remote: 'github.com/acme/libraries', branch: 'main', ahead: 0, behind: 0,  dirty: 0, fetched: '2m ago' },
      { name: 'config',    remote: 'github.com/acme/config',    branch: 'main', ahead: 0, behind: 0,  dirty: 2, fetched: '5m ago' },
    ],
  },
  {
    id: 'ml',
    name: 'ML Services',
    repos: [
      { name: 'models',    remote: 'github.com/acme/ml-models', branch: 'main',    ahead: 0, behind: 0, dirty: 0, fetched: '2m ago' },
      { name: 'scheduler', remote: 'github.com/acme/scheduler', branch: 'develop', ahead: 0, behind: 2, dirty: 0, fetched: '2m ago' },
      { name: 'x-tended',  remote: 'github.com/acme/x-tended',  branch: 'main',    ahead: 3, behind: 0, dirty: 0, fetched: '11m ago' },
    ],
  },
  {
    id: 'web',
    name: 'Marketing Site',
    repos: [
      { name: 'website', remote: 'github.com/acme/website', branch: 'main', ahead: 1, behind: 0, dirty: 4, fetched: '1h ago' },
      { name: 'docs',    remote: 'github.com/acme/docs',    branch: 'main', ahead: 0, behind: 0, dirty: 0, fetched: '1h ago' },
    ],
  },
  {
    id: 'infra',
    name: 'Infrastructure',
    repos: [
      { name: 'terraform',  remote: 'github.com/acme/terraform', branch: 'main', ahead: 0, behind: 0, dirty: 0, fetched: '34m ago' },
      { name: 'k8s-config', remote: 'github.com/acme/k8s',       branch: 'main', ahead: 0, behind: 5, dirty: 0, fetched: '34m ago' },
    ],
  },
];

// Derive a single status keyword for a repo.
function repoStatus(r) {
  if (r.dirty > 0) return 'dirty';
  if (r.ahead > 0 && r.behind > 0) return 'diverged';
  if (r.behind > 0) return 'behind';
  if (r.ahead > 0) return 'ahead';
  return 'clean';
}

// Color token name per status (maps to CSS vars --st-*).
const STATUS_COLOR = {
  clean: 'green',
  behind: 'peach',
  ahead: 'blue',
  diverged: 'mauve',
  dirty: 'yellow',
};

const STATUS_LABEL = {
  clean: 'Up to date',
  behind: 'Behind',
  ahead: 'Ahead',
  diverged: 'Diverged',
  dirty: 'Uncommitted',
};

function projectCounts(repos) {
  let attention = 0;
  repos.forEach((r) => { if (repoStatus(r) !== 'clean') attention += 1; });
  return { total: repos.length, attention };
}

Object.assign(window, {
  SEED_PROJECTS, repoStatus, STATUS_COLOR, STATUS_LABEL, projectCounts,
});
