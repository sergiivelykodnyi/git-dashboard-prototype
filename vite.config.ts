import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import typedCssModulesPlugin from "vite-plugin-typed-css-modules";
import { fileURLToPath } from "node:url";
import stylelint from "vite-plugin-stylelint";
import electron from "vite-plugin-electron";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Emit sourcemaps for the Electron main/preload bundles only during `vite`
  // (dev); never ship them in the packaged production build.
  const electronSourcemap = command === "serve";

  return {
    publicDir: "src/assets",
    plugins: [
      tailwindcss(),
      react(),
      typedCssModulesPlugin(),
      stylelint({ build: true, include: ["src/ui/**/*.css"] }),
      electron([
        {
          entry: "src/electron/main/index.ts",
          vite: {
            build: {
              lib: {
                entry: "src/electron/main/index.ts",
                formats: ["es"],
                fileName: () => "index.js",
              },
              outDir: "dist-electron/main",
              sourcemap: electronSourcemap,
              rollupOptions: {
                external: [
                  "electron",
                  "fs",
                  "path",
                  "os",
                  "url",
                  "child_process",
                  "simple-git",
                ],
              },
            },
          },
        },
        {
          entry: "src/electron/preload/index.ts",
          onstart(options) {
            options.reload();
          },
          vite: {
            build: {
              lib: {
                entry: "src/electron/preload/index.ts",
                formats: ["cjs"],
                fileName: () => "index.cjs",
              },
              outDir: "dist-electron/preload",
              sourcemap: electronSourcemap,
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
        "@ui": fileURLToPath(new URL("./src/ui", import.meta.url)),
        "@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
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
  };
});
