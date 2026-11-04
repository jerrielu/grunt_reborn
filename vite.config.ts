import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { host: "0.0.0.0", port: 5173 },
  build: { target: "es2020" },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
});