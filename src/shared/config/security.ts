export const RATE_LIMITS = {
  auth: { requests: 10, window: "1 m", failure: "closed" },
  authRead: { requests: 120, window: "1 m", failure: "closed" },
  mutation: { requests: 60, window: "1 m", failure: "closed" },
  admin: { requests: 60, window: "1 m", failure: "closed" },
  read: { requests: 120, window: "1 m", failure: "open" },
} as const;

export type RateLimitGroup = keyof typeof RATE_LIMITS;
