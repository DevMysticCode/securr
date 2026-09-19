import { plansPayload, serverlessCategory } from "../../server/handlers.js";

export const GET = (req: Request) => serverlessCategory(req, undefined, plansPayload, true);
