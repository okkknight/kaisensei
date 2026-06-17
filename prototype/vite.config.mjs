import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_KAISENSEI_BASE_PATH || "/",
    optimizeDeps: {
      include: ["react", "react-dom/client"],
    },
    server: {
      proxy: {
        "/v1": "http://127.0.0.1:3001",
      },
      warmup: {
        clientFiles: ["./src/main.jsx"],
      },
    },
    plugins: [react()],
  };
});
