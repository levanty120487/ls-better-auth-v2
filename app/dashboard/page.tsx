/**
 * Dashboard Page - Protected Route (Server Component)
 * ─────────────────────────────────────────────────────────────────────────────
 * - Hiển thị thông tin user từ session
 * - Demo gọi .NET Core API với WSO2 token
 * - Logout button
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getValidAccessToken } from "@/lib/token-manager";
import DashboardClient from "./dashboard-client";

// Ví dụ type từ .NET API
interface ApiHealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}

export default async function DashboardPage() {
  // 1. Lấy session (Server Component)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Chưa đăng nhập → redirect (middleware đã handle nhưng để an toàn)
  if (!session?.user) {
    redirect("/login");
  }

  // 3. Lấy access token hiện tại (có thể đã được refresh)
  const accessToken = await getValidAccessToken();

  // 4. Demo: gọi .NET Core API (health check)
  let apiStatus: ApiHealthResponse | null = null;
  let apiError: string | null = null;

  try {
    // Thay "/api/health" bằng endpoint thực tế của bạn
    apiStatus = await apiClient.get<ApiHealthResponse>("/api/health");
  } catch (err) {
    const error = err as { status?: number; message?: string };
    apiError = error?.message ?? "Không thể kết nối API";
  }

  const user = session.user;
  const tokenPreview = accessToken
    ? `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}`
    : null;

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name ?? "Người dùng",
        email: user.email ?? "",
        image: user.image ?? null,
      }}
      tokenPreview={tokenPreview}
      apiStatus={apiStatus}
      apiError={apiError}
    />
  );
}
