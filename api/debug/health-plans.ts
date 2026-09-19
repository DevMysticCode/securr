import { serverlessJson } from "../../server/handlers.js";

export const GET = () => serverlessJson((p) => p.diagnose(), false);
