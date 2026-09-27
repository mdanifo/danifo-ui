import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Library build: React stays a peer, so each app brings its own copy.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: "src/index.js", formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
    sourcemap: true,
  },
  test: { environment: "jsdom", setupFiles: ["src/test-setup.js"] },
});
