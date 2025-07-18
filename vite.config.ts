import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.PUBLIC_URL ? new URL(process.env.PUBLIC_URL).pathname : "/",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
    assetsDir: "assets",
    sourcemap: mode === "development",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    // Expose environment variables to the client
    "process.env.REACT_APP_WEAVIATE_ENDPOINT": JSON.stringify(
      process.env.REACT_APP_WEAVIATE_ENDPOINT ||
        "https://weaviate.cmsinfosec.com/v1",
    ),
    "process.env.PUBLIC_URL": JSON.stringify(
      process.env.PUBLIC_URL || "https://ui.weaviate.cmsinfosec.com",
    ),
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
