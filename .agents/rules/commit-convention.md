---
name: commit-convention
description: Rules and guidelines for generating git commit messages.
triggers:
  - When analyzing git diffs, file changes, or staged changes to propose a commit message.
  - When preparing a git commit command on behalf of the user.
  - Whenever the user requests a commit message, asks to "analyze changes", or "generate a commit".
---

# Commit Message Convention

Always use the Conventional Commits convention when generating, writing, or proposing commit messages for this repository.

## Format
```text
<type>(<optional-scope>): <description>

[optional body]
```

## Allowed Types
- `feat`: A new feature for the user (e.g., `feat(ui): add search input for repositories`)
- `fix`: A bug fix (e.g., `fix(modal): resolve backdrop click close issue`)
- `style`: Formatting, visual tweaks, CSS, and layout changes that don't affect logic (e.g., `style: unify button paddings and colors`)
- `refactor`: Restructuring code without changing its behavior or fixing bugs (e.g., `refactor(log): use CSS grid for log list alignment`)
- `perf`: Code changes that improve performance (e.g., `perf: optimize render loops in repo list`)
- `chore`: Build tasks, package updates, or configuration (e.g., `chore: update tailwind dependency`)
- `test`: Adding missing tests or correcting existing tests (e.g., `test: add unit test for RepoRow`)
- `docs`: Documentation only changes (e.g., `docs: update README.md with setup instructions`)
