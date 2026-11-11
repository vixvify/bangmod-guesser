import { SearchUserQuerySchema } from "@/features/users/user.schema";
import { userService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const GET = secureRoute(
  { access: "admin", rateLimit: "admin" },
  async (request) => {
    const query = parseSchema(
      SearchUserQuerySchema,
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const result = await userService.getUsers(query);

    return successResponse(result);
  },
);
