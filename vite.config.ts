import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import typedCssModulesPlugin from "vite-plugin-typed-css-modules";
import { fileURLToPath } from "node:url";
import stylelint from "vite-plugin-stylelint";
import electron from "vite-plugin-electron";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    typedCssModulesPlugin(),
    stylelint({ build: true, include: ['ui/**/*.css'] }),
    electron([
      {
        entry: "electron/main/index.ts",
        vite: {
          build: {
            lib: {
              entry: "electron/main/index.ts",
              formats: ["es"],
              fileName: () => "index.js",
            },
            outDir: "dist-electron/main",
            sourcemap: true,
            rollupOptions: {
              external: ["electron", "fs", "path", "os", "url", "child_process", "simple-git"],
            },
          },
        },
      },
      {
        entry: "electron/preload/index.ts",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            lib: {
              entry: "electron/preload/index.ts",
              formats: ["cjs"],
              fileName: () => "index.cjs",
            },
            outDir: "dist-electron/preload",
            sourcemap: true,
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      "@ui": fileURLToPath(new URL("./ui", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
  build: {
    outDir: "dist-ui",
  },
  server: {
    port: 5801,
    host: "git-dashboard.localhost",
    watch: {
      ignored: ["**/*.css.d.ts", "**/.stylelintcache"],
    },
  },
});
