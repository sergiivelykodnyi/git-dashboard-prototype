# 🗂️ Git Dashboard — React Edition

A local web app to monitor and manage all your Git repositories from one page.  
Built with **Vite + React + TypeScript**. Styled with **Tailwind CSS v4** + **Catppuccin** Mocha (dark) and Latte (light) themes.

## Features

- 📋 Full-width list of all repos — each row shows name, branch, and live status badges
- 🌿 Current branch + ahead / behind remote indicators per row
- ⚡ **Fetch all** repos at once from the header, or **Fetch**, **Pull**, **Push** per repo with one click
- 🔄 Auto-refresh every 30 seconds
- 🌙 Mocha (dark) / ☀️ Latte (light) theme toggle, persisted in localStorage

## Tech Stack

| Layer    | Tech                                         |
| -------- | -------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| State    | Zustand 5                                    |
| HTTP     | Axios                                        |
| Icons    | Lucide React                                 |
| Backend  | Node.js, Express 5, simple-git, tsx          |
| Theme    | Catppuccin (Mocha + Latte)                   |

## Requirements

- [Node.js](https://nodejs.org/) v18+

## Setup

```bash
# Install all dependencies
npm install

# Option A — run frontend and backend together (recommended)
npm run dev:all

# Option B — run separately in two terminals
npm run server   # backend  → http://localhost:5800
npm run dev      # frontend → http://git-dashboard.localhost:5801
```

Then open **http://git-dashboard.localhost:5801** in your browser.

## Adding Repositories

Click the add icon dropdown in the header and choose:

- **Create project** to create a new named project container.
- **Add repository** to add a git repository under a specific project by specifying its absolute path (e.g., `/Users/you/projects/my-app`) and display name.

## Project Structure

```
├── config.json              # Saved project and repository configuration
├── package.json             # NPM package scripts and dependencies
├── tsconfig.json            # TypeScript configuration base
├── server/                  # Node.js + Express + TS Backend
│   ├── index.ts             # Express server entry point (default port 5800)
│   ├── routes/
│   │   └── api.ts           # Git operation API endpoints
│   └── services/
│   │   ├── config.ts        # Loads/saves settings to config.json
│   │   └── git.ts           # Simple-git operations logic
├── shared/                  # Code shared between frontend and backend
│   └── types.ts             # Shared TypeScript types and interfaces
└── ui/                      # React Frontend UI
    ├── App.tsx              # Main App layout component
    ├── main.tsx             # React mount entry point
    ├── api/
    │   └── index.ts         # Axios API requests to backend
    ├── components/          # Reusable UI components
    │   ├── AddRepoModal.tsx # Dialog to add a repo to a project
    │   ├── FileList.tsx     # Modified files list component
    │   ├── Header.tsx       # Header with global controls
    │   ├── LogOutput.tsx    # Live terminal log console
    │   ├── RepoRow.tsx      # Repository information and actions row
    │   └── Toast.tsx        # Toast notification system
    ├── hooks/               # Custom React hooks
    │   ├── useGitAction.ts  # Runs pull/push/fetch operations
    │   └── useRepos.ts      # Automated background repository polling
    ├── store/
    │   └── index.ts         # Zustand global state management
    ├── styles/
    │   └── tailwind.css     # Tailwind CSS 4 + Catppuccin theme configuration
    ├── types/
    │   └── index.ts         # Frontend-specific types
    └── utils/
    │   └── toast.ts         # Simple notification helper
```

## Custom Port

```bash
PORT=8080 npm run server
```

Projects and repository configurations are saved in `config.json` in the root directory.
