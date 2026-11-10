import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { Resend } from "resend";
import { UserRole } from "@/features/users/user";
import {
  AdminRoleSchema,
  AdminUserUpdateSchema,
} from "@/features/users/admin.schema";
import { adminAccessControl, authRoles } from "@/features/auth/auth-permissions";
import { config } from "@/shared/config/runtime";
import { prisma } from "@/shared/lib/prisma";
import { AdminPaths } from "@/features/users/admin.routes";
import { createPasswordResetEmail } from "@/features/auth/server/email-templates/password-reset-email";

const googleOAuth = config.googleOAuth;

type SendResetPasswordData = Parameters<
  NonNullable<
    NonNullable<BetterAuthOptions["emailAndPassword"]>["sendResetPassword"]
  >
>[0];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: config.authSecret,
  baseURL: config.authUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 900,
    sendResetPassword: async ({ user, url }: SendResetPasswordData) => {
      const resendConfig = config.resend;
      const resend = new Resend(resendConfig.apiKey);
      const email = createPasswordResetEmail(url);

      return resend.emails
        .send({
          from: resendConfig.fromEmail,
          to: user.email,
          ...email,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Failed to send password reset email:", error);
          }
        })
        .catch((error: unknown) => {
          console.error("Failed to send password reset email:", error);
        });
    },
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
