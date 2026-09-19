import { plansPayload, serverlessCategory } from "../../server/handlers.js";

// Original health-only alias, kept for backwards compatibility.
export const GET = (req: Request) => serverlessCategory(req, "health", plansPayload, true);
