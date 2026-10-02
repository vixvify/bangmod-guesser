import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { UserRole } from "@/core/domain/user";
import {
  AdminRoleSchema,
  AdminUserUpdateSchema,
} from "@/core/schema/admin.schema";
import { authRoles } from "@/lib/auth-permissions";
import { config } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { BetterAuthAdminPaths } from "@/routes/api/admin.routes";

const googleOAuth = config.googleOAuth;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: config.authSecret,
  baseURL: config.authUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  socialProviders: googleOAuth ? { google: googleOAuth } : {},
  plugins: [
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
      roles: authRoles,
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === BetterAuthAdminPaths.setRole &&
        !AdminRoleSchema.safeParse(ctx.body?.role).success
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Role must be USER or ADMIN",
        });
      }

      if (
        ctx.path === BetterAuthAdminPaths.updateUser &&
        !AdminUserUpdateSchema.safeParse(ctx.body?.data).success
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Only username can be updated",
        });
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
