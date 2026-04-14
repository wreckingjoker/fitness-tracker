import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:4000",
      "/meals": "http://localhost:4000",
      "/nutrition": "http://localhost:4000",
      "/dailylog": "http://localhost:4000",
      "/progress": "http://localhost:4000",
      "/dietplan": "http://localhost:4000",
      "/workouts": "http://localhost:4000",
    },
  },
});
