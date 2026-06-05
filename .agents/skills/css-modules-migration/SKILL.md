---
name: css-modules-migration
description: |
  Migrates Tailwind CSS or global CSS styles of a React/TypeScript component to scoped CSS modules.

  Trigger when:
  - Migrating components from global utility-first CSS (Tailwind) to CSS modules.
  - Organizing components into self-contained directory structures.
  - Extracting inline classes or shared classes to local module styles.
---

# CSS Modules Migration

This skill guides you through refactoring React components to use CSS modules instead of utility-first (Tailwind) or global CSS, while reorganizing them into dedicated component directories.

## When to Use

Use this skill when you need to:

- Standardize a component's folder structure.
- Extract styling details out of the markup/TSX into scoped stylesheets.
- Ensure type-safe CSS module imports in TypeScript.

## Folder Structure

A standardized component folder should look like:

```
ui/components/ComponentName/
├── ComponentName.tsx
├── component-name.module.css
└── index.ts
```

## Step-by-Step Migration Guide

### Step 1. Reorganize Files

1. Create a directory named after the component (PascalCase) under the target components folder (e.g., `ui/components/Icon/`).
2. Move the component file (`Icon.tsx`) into the new folder (`ui/components/Icon/Icon.tsx`).
3. Create a module stylesheet inside the new folder. Use lowercase, kebab-case for the stylesheet filename (e.g., `icon.module.css`).
4. Create an `index.ts` entrypoint inside the component directory to export the component:
   ```typescript
   export { ComponentName } from "./ComponentName";
   ```

### Step 2. Extract CSS Styles

Extract styling properties from Tailwind utility classes or global CSS to standard CSS properties in the `.module.css` file:

- **Kebab-Case in CSS**: Write CSS selectors in kebab-case format.
- **Conversion Examples**:
  - `inline-flex` -> `display: inline-flex;`
  - `shrink-0` -> `flex-shrink: 0;`
  - `items-center` -> `align-items: center;`
  - `justify-center` -> `justify-content: center;`
  - `select-none` -> `user-select: none;`
  - `h-4 w-4` -> `height: 1rem; width: 1rem;` (or pixel values based on the design tokens).

Example `icon.module.css`:

```css
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}
```

### Step 3. Update the TSX Markup

1. Import the stylesheet at the top of the component file as `css`:
   ```typescript
   import css from "./component-name.module.css";
   ```
2. **CamelCase in TSX**: Access CSS classes using camelCase property naming.
   - For a CSS class `.icon`, access it via `css.icon`.
   - For a CSS class `.icon-container`, access it via `css.iconContainer`.
3. Combine classes using a utility like `clsx` or `classnames` if conditional classes are needed:
   ```tsx
   className={clsx(css.icon, className)}
   ```

### Step 4. Clean Up and Verify

1. Remove old/migrated global styles from global stylesheets (e.g., `common.css`) to prevent duplicates.
2. Verify TypeScript types:
   - Ensure the module styles typed declaration (e.g., `*.module.css.d.ts`) is generated or recognized by the bundler.
3. Validate that the application compiles without errors:
   ```bash
   npm run build
   ```
