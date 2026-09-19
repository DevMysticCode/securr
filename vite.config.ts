import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiPort = process.env.PORT ?? 8787;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The browser only ever talks to our backend; the backend talks to the insurance provider.
    proxy: { "/api": `http://localhost:${apiPort}` },
  },
});
