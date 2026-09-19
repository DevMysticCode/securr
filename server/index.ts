import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { createProvider } from "./providers/index.js";
import { insuranceRouter } from "./routes/insurance.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const provider = createProvider();

app.disable("x-powered-by");
app.get("/api/health", (_req, res) => res.json({ status: "ok", provider: provider.name }));
app.use("/api", insuranceRouter(provider, Number(process.env.CACHE_TTL_SECONDS ?? 3600) * 1000));
app.use("/api", (_req, res) => res.status(404).json({ error: { code: "INTERNAL", message: "Not found" } }));

// Production: serve the built SPA from the same origin.
const dist = path.resolve("dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(port, () => console.log(`API listening on http://localhost:${port} (provider: ${provider.name})`));
