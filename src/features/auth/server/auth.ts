import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { UserRole } from "@/features/users/user";
import {
  AdminRoleSchema,
  AdminUserUpdateSchema,
} from "@/features/users/admin.schema";
import { adminAccessControl, authRoles } from "@/features/auth/auth-permissions";
import { config } from "@/shared/config/runtime";
import { prisma } from "@/shared/lib/prisma";
import { AdminPaths } from "@/features/users/admin.routes";

const googleOAuth = config.googleOAuth;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: config.authSecret,
  baseURL: config.authUrl,
  trustedOrigins: config.trustedOrigins,
  advanced: {
    useSecureCookies: config.isProduction,
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: config.isProduction },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  socialProviders: googleOAuth ? { google: googleOAuth } : {},
  plugins: [
    admin({
      ac: adminAccessControl,
      roles: authRoles,
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === AdminPaths.updateUser) {
        const result = AdminUserUpdateSchema.safeParse(ctx.body?.data);

        if (!result.success) {
          throw new APIError("BAD_REQUEST", {
            message: "Only a valid username can be updated",
          });
        }
      }

      if (
        ctx.path === AdminPaths.setRole &&
        !AdminRoleSchema.safeParse(ctx.body?.role).success
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Role must be USER or ADMIN",
        });
      }
    }),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: UserRole.USER,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
