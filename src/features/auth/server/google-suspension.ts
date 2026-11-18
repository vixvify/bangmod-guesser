import type { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { BANNED_USER_CODE } from "@/features/auth/auth.constants";

// Run before the admin plugin so timed suspensions can reach the OAuth callback.
export const googleSuspension = {
  id: "google-suspension",
  init: () => ({
    options: {
      databaseHooks: {
        session: {
          create: {
            async before(session, ctx) {
              if (ctx?.path !== "/callback/:id" || ctx.params?.id !== "google") return;

              const user = await ctx.context.internalAdapter.findUserById(session.userId);
              if (!user || !("banned" in user) || user.banned !== true) return;

              const banExpires = "banExpires" in user ? user.banExpires : null;
              if (banExpires instanceof Date && banExpires.getTime() > Date.now()) {
                throw APIError.from("FORBIDDEN", {
                  code: BANNED_USER_CODE,
                  message: banExpires.toISOString(),
                });
              }
            },
          },
        },
      },
    },
  }),
} satisfies BetterAuthPlugin;
