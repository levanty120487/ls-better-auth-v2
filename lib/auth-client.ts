/**
 * Better Auth - Client-side auth client
 * Dùng trong Client Components ("use client")
 */
import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  plugins: [
    // Plugin cho genericOAuth (WSO2 SSO flow)
    genericOAuthClient(),
  ],
});

// ─── Typed Exports ────────────────────────────────────────────────────────────
export type Session = typeof authClient.$Infer.Session;
