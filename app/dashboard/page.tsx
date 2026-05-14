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

interface ApiHealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}

interface Category {
  key: string;
  title: string;
}

export default async function DashboardPage() {
  // 1. Lấy session (Server Component)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Chưa đăng nhập → redirect
  if (!session?.user) {
    redirect("/login");
  }

  // 3. Lấy access token hiện tại (có thể đã được refresh)
  const accessToken = await getValidAccessToken();

  // 4. Gọi các API từ .NET Core
  // let apiStatus: ApiHealthResponse | null = null;
  let categories: Category[] = [];
  let apiError: string | null = null;

  console.log("--- DEBUG: Bắt đầu gọi API .NET Core ---");
  console.log("Path 1: /api/health");
  console.log("Path 2: /api/new/category/get-all");

  try {
    const [categoriesRes] = await Promise.all([
      // apiClient.get<ApiHealthResponse>("/api/health").catch((e) => {
      //   console.error("Lỗi API Health:", e.message);
      //   return null;
      // }),
      apiClient.get<Category[]>("/api/new/category/get-all").catch((e) => {
        // console.error("Lỗi API Categories:", e.message);
        return null;
      }),
    ]);

    console.log(
      "Kết quả API Categories:",
      categoriesRes ? `Số lượng: ${categoriesRes.length}` : "FAILED (null)",
    );
    if (categoriesRes)
      console.log(
        "Data Categories (5 bản ghi đầu):",
        JSON.stringify(categoriesRes.slice(0, 5), null, 2),
      );

    // apiStatus = statusRes;
    categories = categoriesRes || [];
  } catch (err) {
    const error = err as { status?: number; message?: string };
    console.error("Lỗi tổng hợp API:", error);
    apiError = error?.message ?? "Không thể kết nối API";
  }
  console.log("--- DEBUG: Kết thúc gọi API ---");

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
      // apiStatus={apiStatus}
      categories={categories}
      apiError={apiError}
    />
  );
}
