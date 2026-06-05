import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import typedCssModulesPlugin from "vite-plugin-typed-css-modules";
import { fileURLToPath } from "node:url";
import stylelint from "vite-plugin-stylelint";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    typedCssModulesPlugin(),
    stylelint({ build: true, include: ['ui/**/*.css'] }),
  ],
  resolve: {
    alias: {
      "@ui": fileURLToPath(new URL("./ui", import.meta.url)),
    },
  },
  server: {
    port: 5801,
    host: "git-dashboard.localhost",
    watch: {
      ignored: ["**/*.css.d.ts", "**/.stylelintcache"],
    },
  },
});
