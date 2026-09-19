import { serverlessCategory } from "../../server/handlers.js";

export const GET = (req: Request) => serverlessCategory(req, "health", (p, c) => p.diagnose(c), false);
