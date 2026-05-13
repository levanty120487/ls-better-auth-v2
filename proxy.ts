/**
 * Next.js Proxy (thay thế middleware trong Next.js 16)
 * ─────────────────────────────────────────────────────────────────────────────
 * Bảo vệ các routes yêu cầu đăng nhập.
 * Redirect về /login nếu chưa có session.
 *
 * Tham khảo: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

// Routes chỉ cho phép khi đã đăng nhập
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/settings"];

interface SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Kiểm tra có phải protected route không
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // 2. Lấy session từ Better Auth
  try {
    const { data: session } = await betterFetch<SessionData>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      }
    );

    // 3. Nếu không có session → redirect về login
    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Có session → tiếp tục
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Chỉ áp dụng cho các routes cụ thể, bỏ qua static assets
    "/((?!_next/static|_next/image|favicon.ico|api/auth|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
