import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    env: {
      DATABASE_URL: "postgresql://postgres:postgres_password@localhost:5432/rove_db?schema=public",
      LLM_PROVIDER: "anthropic",
    },
  },
});
