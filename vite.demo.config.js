import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

// The demo app in demo/: every layout and component on real Bootstrap CSS
// compiled from scss/_base.scss, the way an app would. `npm run demo` to look
// at it; Playwright builds and serves it for the e2e suite.
export default defineConfig({
  root: here("./demo"),
  plugins: [react()],
  resolve: {
    // The demo imports "@danifo/ui" like an app does; point that at the source
    // so it always exercises the current tree, not a stale dist/.
    alias: [
      { find: /^@danifo\/ui$/, replacement: here("./src/index.js") },
      { find: /^@danifo\/ui\/scss\/(.+)$/, replacement: here("./scss/_$1.scss") },
    ],
  },
  css: {
    preprocessorOptions: {
      // Bootstrap 5.3 is @import-based; its own deprecation notices are not ours
      // to fix, and the base theme keeps @import so apps can set variables first.
      scss: { quietDeps: true, silenceDeprecations: ["import"] },
    },
  },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
