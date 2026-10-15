import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Library build: React stays a peer, so each app brings its own copy.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: "src/index.js", formats: ["es"], fileName: () => "index.js" },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-bootstrap",
        /^react-bootstrap\//,
      ],
    },
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    // One jsdom per worker rather than per file; isolation per file is kept.
    // `vitest run --pool=forks` if it misbehaves.
    pool: "vmThreads",
    setupFiles: ["src/test-setup.js"],
    // Only the unit and component tests; Playwright owns e2e/*.spec.js.
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}", "src/test-setup.js"],
      reporter: ["text", "html", "lcov"],
      // Small surface; keep it fully covered.
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
