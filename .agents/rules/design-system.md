---
name: design-system
description: Rules and guidelines for implementing UIs, styling with Tailwind, using the defined design system, and working with design templates.
triggers:
  - When implementing new UI components, pages, or features.
  - When redesigning based on templates, mockups, or examples in the `design/` folder.
  - When applying Tailwind CSS utility classes in TSX/JSX/HTML files.
  - When styling components using CSS Modules.
  - When working with UI styles, layouts, or spacing in the codebase.
---

# Design System & Implementation Rules

Follow these strict rules and guidelines when implementing new UI components, features, or redesigns. These rules ensure that all developments remain consistent with our current technology stack and design system.

## 1. Use the Design Folder ONLY as a Reference

- The [design](file:///Users/sv/Projects/git-dashboard/prototype/design) folder contains reference examples (`app.jsx`, `components.jsx`, `data.jsx`, `icons.jsx`, `index.html`, `modals.jsx`).
- **DO NOT copy files or copy-paste code directly from the `design/` folder.**
- Every new feature, modal, or component must be implemented **from scratch** using our actual project stack (React, TypeScript, Zustand, Tailwind CSS, and CSS Modules).

## 2. Strict Tailwind Size and Spacing System

- **DO NOT create custom/arbitrary Tailwind classes** for font size, padding, margin, width, height, or gaps (e.g., do not use `text-[15px]`, `p-[15px]`, `w-[320px]`, `gap-[11px]`). Always stick to standard Tailwind size and spacing steps.
- **DO NOT use float values in utility classes** for spacing and sizing (e.g., avoid `p-1.5`, `m-2.5`, `gap-3.5`, `h-0.5`). Stick to integer-based Tailwind spacing units (e.g., `p-1`, `p-2`, `p-3`, `p-4`, `p-6`).

## 3. Strict Theme Color Usage

- **DO NOT use custom hex colors or arbitrary default Tailwind colors** (like `bg-gray-800` or `text-blue-500`) directly in your code.
- Always use the semantic theme colors configured in [tailwind.css](file:///Users/sv/Projects/git-dashboard/prototype/ui/styles/tailwind.css) inside `@theme`:
  - **Backgrounds/Panels**: `bg-background` (base), `bg-mantle`, `bg-crust`
  - **Surfaces/Borders**: `bg-surface0`, `bg-surface1`, `bg-surface2`
  - **Text**: `text-foreground` (text), `text-subtext0`, `text-subtext1`, `text-overlay0`, `text-overlay1`, `text-overlay2`
  - **Semantic Accents**: `lavender`, `blue`, `sapphire`, `sky`, `teal`, `green`, `yellow`, `peach`, `maroon`, `red`, `mauve`, `pink`, `flamingo`, `rosewater` (e.g., `bg-mauve`, `text-green`, `border-surface1`, etc.)

## 4. CSS Modules for Shared Components

- **Use CSS Modules** for shared components (e.g., buttons, inputs, selects, icons) that do not have complex logic and simply render small pieces of software.
  - Component files and their corresponding CSS Module files should live in a self-contained directory (e.g., `ui/components/Button/Button.tsx` and `ui/components/Button/button.module.css`).
  - Class names inside `.module.css` files should be written in **kebab-case**, and imported/used as **camelCase** in the `.tsx` files.
- **Tailwind for Layout**: Tailwind CSS should be used primarily for layout styling (e.g., flex, grid, alignment, positioning, and page-level spacing).
- **Style Overrides Exception**: An exception is allowed when you need to override certain styles of a shared component. In this case, you can pass custom styling classes (e.g., Tailwind utility classes or custom classes) to the component to override or extend its default CSS module styles.

## 5. Reusing Legacy Components CSS Layer

- Before writing custom styles, check if a predefined component class exists in `@layer components` inside [tailwind.css](file:///Users/sv/Projects/git-dashboard/prototype/ui/styles/tailwind.css).
- Note: For any new shared components (or when refactoring existing ones), prefer **CSS Modules** (see rule 4).
- Predefined legacy utility classes include:
  - **Buttons**: `.btn`, `.btn-primary`, `.btn-green`, `.btn-blue`, `.btn-peach`, `.btn-icon`
  - **Badges**: `.badge`, `.badge-clean`, `.badge-staged`, `.badge-changed`, `.badge-ahead`, `.badge-behind`, `.badge-stash`, `.badge-error`
  - **Forms**: `.form-label`, `.form-input`, `.commit-input`
  - **Modals**: `.modal`
  - **Toasts**: `.toast`, `.toast-ok`, `.toast-err`
  - **Spinners**: `.spinner`, `.spin`
