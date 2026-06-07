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
└── src/                     # Application source directory
    ├── assets/              # App static assets and icons
    ├── electron/            # Electron main and preload process code
    │   ├── main/            # Electron main process source
    │   └── preload/         # Electron preload scripts
    ├── shared/              # Shared types and code
    └── ui/                  # React UI frontend source code
        ├── App.tsx          # Main App React component
        ├── main.tsx         # React mount entry point
        ├── components/      # Reusable UI components
        ├── hooks/           # Custom React hooks
        ├── services/        # Service layer (AppService, ApiService, etc.)
        ├── styles/          # Tailwind CSS style configuration
        ├── types/           # UI-specific TypeScript types
        └── utilities/       # Utility helper functions
```

## Custom Port

```bash
PORT=8080 npm run server
```

Projects and repository configurations are saved in `config.json` in the root directory.
