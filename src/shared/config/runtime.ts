import { z } from "zod";

import { IMAGE_MESSAGES } from "@/features/images/image.constants";
import { AppError } from "@/shared/errors/app.error";

const NodeEnvironmentSchema = z.enum(["development", "test", "production"]);

const ApiEnvironmentSchema = z.object({
  url: z
    .string()
    .trim()
    .url()
    .transform((value) => value.replace(/\/+$/, "")),
});

const PasswordResetTrustedOriginSchema = z
  .string()
  .trim()
  .url()
  .transform((value) => new URL(value).origin);

const R2EnvironmentSchema = z.object({
  accountId: z.string().trim().min(1),
  accessKeyId: z.string().trim().min(1),
  secretAccessKey: z.string().trim().min(1),
  bucketName: z.string().trim().min(1),
  publicUrl: z.string().trim().url(),
});

const GoogleOAuthEnvironmentSchema = z.object({
  clientId: z.string().trim().min(1),
  clientSecret: z.string().trim().min(1),
});

const ResendEnvironmentSchema = z.object({
  apiKey: z.string().trim().min(1),
  fromEmail: z.string().trim().email(),
});

const InitialAdminEmailSchema = z.string().trim().toLowerCase().email();

export type R2Config = z.infer<typeof R2EnvironmentSchema>;
export type ResendConfig = z.infer<typeof ResendEnvironmentSchema>;

function getR2Config(): R2Config {
  const result = R2EnvironmentSchema.safeParse({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  });

  if (!result.success) {
    throw new AppError(IMAGE_MESSAGES.storageNotConfigured, 500);
  }

  return result.data;
}

function getApiUrl() {
  const result = ApiEnvironmentSchema.safeParse({
    url: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!result.success) {
    throw new AppError("API URL is not configured", 500);
  }

  return result.data.url;
}

function getAuthSecret() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters in production");
  }
  return secret || "development-fallback-secret-key-min-32-chars";
}

function getAuthUrl() {
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

function getPasswordResetTrustedOrigin() {
  const result = PasswordResetTrustedOriginSchema.safeParse(
    process.env.PASSWORD_RESET_TRUSTED_ORIGIN,
  );

  if (!result.success) {
    throw new AppError("Password reset trusted origin is not configured or invalid", 500);
  }

  return result.data;
}

function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId && !clientSecret) {
    return null;
  }

  const result = GoogleOAuthEnvironmentSchema.safeParse({ clientId, clientSecret });

  if (!result.success) {
    throw new AppError("Google OAuth configuration is incomplete", 500);
  }

  return result.data;
}

function getResendConfig(): ResendConfig {
  const result = ResendEnvironmentSchema.safeParse({
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  });

  if (!result.success) {
    throw new AppError("Resend configuration is incomplete or invalid", 500);
  }

  return result.data;
}

export const config = {
  get trustedOrigins(): string[] {
    const values = [getAuthUrl(), ...(process.env.AUTH_TRUSTED_ORIGINS?.split(",") ?? [])];
    return [...new Set(values.filter(Boolean).map((value) => {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" && !(url.protocol === "http:" && !config.isProduction)) {
        throw new Error("Trusted origins must use HTTPS in production");
      }
      return url.origin;
    }))];
  },

  get rateLimitRedis(): { url: string; token: string } | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url && !token) return null;
    if (!url || !token) throw new Error("Upstash Redis configuration is incomplete");
    if (new URL(url).protocol !== "https:") throw new Error("Upstash Redis URL must use HTTPS");
    return { url, token };
  },

  get isVercel(): boolean {
    return process.env.VERCEL === "1";
  },
  get apiUrl() {
    return getApiUrl();
  },

  get authSecret() {
    return getAuthSecret();
  },

  get authUrl() {
    return getAuthUrl();
  },

  get passwordResetTrustedOrigin() {
    return getPasswordResetTrustedOrigin();
  },

  get googleOAuth() {
    return getGoogleOAuthConfig();
  },

  get resend() {
    return getResendConfig();
  },

  get initialAdminEmail() {
    const result = InitialAdminEmailSchema.safeParse(process.env.INITIAL_ADMIN_EMAIL);

    if (!result.success) {
      throw new Error("INITIAL_ADMIN_EMAIL must be a valid email address");
    }

    return result.data;
  },

  get environment() {
    return NodeEnvironmentSchema.parse(process.env.NODE_ENV ?? "development");
  },

  get isProduction() {
    return config.environment === "production";
  },

  get r2() {
    return getR2Config();
  },
};
