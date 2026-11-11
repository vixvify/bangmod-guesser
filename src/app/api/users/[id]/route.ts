import { headers } from "next/headers";

import { UserFormSchema, UserIdSchema } from "@/features/users/user.schema";
import { userService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const PATCH = secureRoute<RouteContext>(
  { access: "admin", rateLimit: "admin" },
  async (request, context) => {
    const { id } = await context.params;

    const userId = parseSchema(UserIdSchema, id);

    const body = await readJson(request);

    const data = parseSchema(UserFormSchema, body);

    const requestHeaders = await headers();

    const updatedUser = await userService.updateUser(
      requestHeaders,
      userId,
      data,
    );

    return successResponse(updatedUser);
  },
);

export const DELETE = secureRoute<RouteContext>(
  { access: "admin", rateLimit: "admin" },
  async (request, context) => {
    const { id } = await context.params;

    const userId = parseSchema(UserIdSchema, id);

    const requestHeaders = await headers();

    await userService.deleteUser(requestHeaders, userId);

    return successResponse({
      success: true,
      userId,
    });
  },
);
