import { plansPayload, serverlessJson } from "../../server/handlers.js";

export const GET = () => serverlessJson(plansPayload, true);
