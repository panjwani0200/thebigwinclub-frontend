import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_BASE_URL || "http://localhost:3000";

  return {
    plugins: [react()],
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
      target: "es2018",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,
    },
    server: {
      port: 3001,
      strictPort: true,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
