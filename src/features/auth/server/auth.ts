import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { Resend } from "resend";
import { UserRole } from "@/features/users/user";
import {
  AdminBanUserBodySchema,
  AdminRoleSchema,
  AdminUserUpdateSchema,
} from "@/features/users/admin.schema";
import { adminAccessControl, authRoles } from "@/features/auth/auth-permissions";
import { config } from "@/shared/config/runtime";
import { prisma } from "@/shared/lib/prisma";
import { AdminPaths } from "@/features/users/admin.routes";
import { createPasswordResetEmail } from "@/features/auth/server/email-templates/password-reset-email";
import { createEmailVerification } from "@/features/auth/server/email-templates/email-verification";
import { getUserStatus } from "@/shared/lib/user-status";
import { googleSuspension } from "./google-suspension";

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
  trustedOrigins: config.trustedOrigins,
  advanced: {
    useSecureCookies: config.isProduction,
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: config.isProduction },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
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
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    expiresIn: 3_600,
    async sendVerificationEmail({ user, url }) {
      try {
        const { apiKey, fromEmail } = config.resend;
        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: user.email,
          ...createEmailVerification(url),
        });
        if (error) console.error("Failed to send verification email:", error.name);
      } catch (error) {
        console.error("Failed to send verification email:", error instanceof Error ? error.name : "Unknown error");
      }
    },
  },
  socialProviders: googleOAuth ? { google: googleOAuth } : {},
  plugins: [
    googleSuspension,
    admin({
      ac: adminAccessControl,
      roles: authRoles,
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    }),
  ],
  databaseHooks: {
    user: {
      update: {
        async before(data, ctx) {
          if (data.banned === false) return { data: { banStartedAt: null } };
          if (data.banned !== true || ctx?.path !== AdminPaths.banUser) return;

          const { userId } = AdminBanUserBodySchema.parse(ctx.body);
          const user = await ctx.context.internalAdapter.findUserById(userId);
          const now = new Date();
          if (user && getUserStatus({
            banned: "banned" in user && user.banned === true,
            banExpires: "banExpires" in user && user.banExpires instanceof Date
              ? user.banExpires
              : null,
          }, now) === "SUSPENDED") return;

          return { data: { banStartedAt: now } };
        },
      },
    },
  },
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
      banStartedAt: {
        type: "date",
        required: false,
        input: false,
        returned: false,
      },
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
