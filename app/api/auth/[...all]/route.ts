/**
 * Next.js App Router - Better Auth Route Handler
 * Đăng ký tất cả /api/auth/* endpoints (signin, callback, session, signout...)
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
