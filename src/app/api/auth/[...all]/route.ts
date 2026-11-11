import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/features/auth/server/auth";
import { secureRoute } from "@/shared/lib/security/route";

const authHandlers = toNextJsHandler(auth);
export const GET = secureRoute({ access: "public", rateLimit: "authRead", origin: "better-auth" }, async (request) => authHandlers.GET(request));
export const POST = secureRoute({ access: "public", rateLimit: "auth", origin: "better-auth" }, async (request) => authHandlers.POST(request));
