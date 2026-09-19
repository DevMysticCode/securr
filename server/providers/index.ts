import type { InsuranceProvider } from "./InsuranceProvider.js";
import { WorldBestInsurerProvider } from "./WorldBestInsurerProvider.js";

/** Swap providers here (e.g. env INSURANCE_PROVIDER) once DeployitProvider / DirectInsurerProvider exist. */
export function createProvider(): InsuranceProvider {
  const key = process.env.WORLD_BEST_INSURER_API_KEY;
  if (!key) throw new Error("WORLD_BEST_INSURER_API_KEY is not set (see .env.example)");
  return new WorldBestInsurerProvider(key, process.env.WORLD_BEST_INSURER_BASE_URL);
}
