import { config } from "@/shared/config/runtime";

const RESET_PASSWORD_PATH = "/reset-password";
const RESET_PASSWORD_API_PATH = "/api/auth/reset-password/";

function isAllowedProtocol(url: URL): boolean {
  if (url.protocol === "https:") {
    return true;
  }

  const isLocalhost =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";

  return (
    url.protocol === "http:" &&
    isLocalhost &&
    (config.environment === "development" || config.environment === "test")
  );
}

export function validateResetUrl(value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid password reset URL");
  }

  const trustedOrigin = config.passwordResetTrustedOrigin;

  if (!isAllowedProtocol(url) || url.origin !== trustedOrigin) {
    throw new Error("Untrusted password reset URL");
  }
  if (!url.pathname.startsWith(RESET_PASSWORD_API_PATH)) {
    throw new Error("Invalid password reset path");
  }

  const token = url.pathname.slice(RESET_PASSWORD_API_PATH.length);

  if (!token || token.includes("/")) {
    throw new Error("Password reset token is missing or invalid");
  }

  let decodedToken: string;

  try {
    decodedToken = decodeURIComponent(token);
  } catch {
    throw new Error("Password reset token is invalid");
  }

  if (!decodedToken || decodedToken.includes("/") || decodedToken.includes("\\")) {
    throw new Error("Password reset token is invalid");
  }

  const callbackURL = url.searchParams.get("callbackURL");

  if (!callbackURL) {
    throw new Error("Password reset callback URL is missing");
  }

  let callback: URL;

  try {
    callback = new URL(callbackURL);
  } catch {
    throw new Error("Invalid password reset callback URL");
  }

  if (
    !isAllowedProtocol(callback) ||
    callback.origin !== trustedOrigin ||
    callback.pathname !== RESET_PASSWORD_PATH ||
    callback.search ||
    callback.hash
  ) {
    throw new Error("Untrusted password reset callback URL");
  }

  return url;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}
