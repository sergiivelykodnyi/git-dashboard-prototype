---
name: design-system
description: Rules and guidelines for implementing UIs, styling with Tailwind, using the defined design system, and working with design templates.
triggers:
  - When implementing new UI components, pages, or features.
  - When redesigning based on templates, mockups, or examples in the `design/` folder.
  - When applying Tailwind CSS utility classes in TSX/JSX/HTML files.
  - When working with UI styles, layouts, or spacing in the codebase.
---

# Design System & Implementation Rules

Follow these strict rules and guidelines when implementing new UI components, features, or redesigns. These rules ensure that all developments remain consistent with our current technology stack and design system.

## 1. Use the Design Folder ONLY as a Reference
- The [design](file:///Users/sv/Projects/git-dashboard/web/design) folder contains reference examples (`app.jsx`, `components.jsx`, `data.jsx`, `icons.jsx`, `index.html`, `modals.jsx`).
- **DO NOT copy files or copy-paste code directly from the `design/` folder.**
- Every new feature, modal, or component must be implemented **from scratch** using our actual project stack (React, TypeScript, Zustand, and Tailwind CSS).

## 2. Strict Tailwind Size and Spacing System
- **DO NOT create custom/arbitrary Tailwind classes** for font size, padding, margin, width, height, or gaps (e.g., do not use `text-[15px]`, `p-[15px]`, `w-[320px]`, `gap-[11px]`). Always stick to standard Tailwind size and spacing steps.
- **DO NOT use float values in utility classes** for spacing and sizing (e.g., avoid `p-1.5`, `m-2.5`, `gap-3.5`, `h-0.5`). Stick to integer-based Tailwind spacing units (e.g., `p-1`, `p-2`, `p-3`, `p-4`, `p-6`).

## 3. Strict Theme Color Usage
- **DO NOT use custom hex colors or arbitrary default Tailwind colors** (like `bg-gray-800` or `text-blue-500`) directly in your code.
- Always use the semantic theme colors configured in [tailwind.css](file:///Users/sv/Projects/git-dashboard/web/ui/styles/tailwind.css) inside `@theme`:
  - **Backgrounds/Panels**: `bg-background` (base), `bg-mantle`, `bg-crust`
  - **Surfaces/Borders**: `bg-surface0`, `bg-surface1`, `bg-surface2`
  - **Text**: `text-foreground` (text), `text-subtext0`, `text-subtext1`, `text-overlay0`, `text-overlay1`, `text-overlay2`
  - **Semantic Accents**: `lavender`, `blue`, `sapphire`, `sky`, `teal`, `green`, `yellow`, `peach`, `maroon`, `red`, `mauve`, `pink`, `flamingo`, `rosewater` (e.g., `bg-mauve`, `text-green`, `border-surface1`, etc.)

## 4. Reusing Components CSS Layer
- Before writing a complex set of ad-hoc utility classes, check if a predefined component class exists in `@layer components` inside [tailwind.css](file:///Users/sv/Projects/git-dashboard/web/ui/styles/tailwind.css).
- Predefined utility classes include:
  - **Buttons**: `.btn`, `.btn-primary`, `.btn-green`, `.btn-blue`, `.btn-peach`, `.btn-icon`
  - **Badges**: `.badge`, `.badge-clean`, `.badge-staged`, `.badge-changed`, `.badge-ahead`, `.badge-behind`, `.badge-stash`, `.badge-error`
  - **Forms**: `.form-label`, `.form-input`, `.commit-input`
  - **Modals**: `.modal`
  - **Toasts**: `.toast`, `.toast-ok`, `.toast-err`
  - **Spinners**: `.spinner`, `.spin`
