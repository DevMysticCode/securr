import { insurersPayload, serverlessJson } from "../../server/handlers.js";

export const GET = () => serverlessJson(insurersPayload, true);
