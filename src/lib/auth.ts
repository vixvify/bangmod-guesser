import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { config } from "@/config";
import { prisma } from "@/lib/prisma";

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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
