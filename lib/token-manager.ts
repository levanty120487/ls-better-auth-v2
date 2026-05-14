/**
 * Token Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Lấy WSO2 access_token từ Better Auth account table.
 * Tự động refresh nếu token hết hạn.
 *
 * Better Auth lưu OAuth tokens trong bảng `account`:
 *   - accessToken
 *   - refreshToken
 *   - accessTokenExpiresAt
 */

import { auth, db } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountRecord {
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  providerId: string;
}

// ─── Core Function ────────────────────────────────────────────────────────────

/**
 * Lấy valid WSO2 access_token cho người dùng hiện tại.
 * - Nếu token còn hạn → trả về trực tiếp
 * - Nếu hết hạn → dùng refresh_token để lấy token mới → cập nhật DB → trả về
 *
 * Chỉ dùng trong Server Components, Server Actions, Route Handlers.
 */
export async function getValidAccessToken(): Promise<string | null> {
  // 1. Lấy session hiện tại
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    console.warn("[TokenManager] Không tìm thấy session người dùng.");
    return null;
  }

  console.log("session", session);

  // 2. Truy vấn account record của WSO2 provider từ DB
  const account = await getWso2Account(session.user.id);

  if (!account || !account.accessToken) {
    console.error(
      "[TokenManager] Không tìm thấy accessToken trong DB cho user:",
      session.user.id,
    );
    return null;
  }

  console.log(`[TokenManager] Token info:
    - AccessToken (Preview): ${account.accessToken}
    - IdToken (Preview): ${account.idToken ? account.idToken.substring(0, 10) + "..." : "N/A"}
    - Using: ${account.idToken ? "IdToken" : "AccessToken"}
  `);

  // Trả về token (Ưu tiên IdToken nếu bạn muốn test JWT, hoặc giữ AccessToken nếu đã chỉnh WSO2)
  // Tạm thời tôi sẽ thử trả về idToken nếu có để xem API .NET có nhận không
  const finalToken = account.idToken || account.accessToken;

  // 3. Kiểm tra token có hết hạn chưa (thêm 30s buffer)
  const isExpired = isTokenExpired(account.accessTokenExpiresAt);

  if (!isExpired) {
    return finalToken;
  }

  // 4. Token hết hạn → thử refresh
  console.log("[TokenManager] Token hết hạn, đang tiến hành refresh...");
  if (!account.refreshToken) {
    console.warn(
      "[TokenManager] Access token hết hạn, không có refresh token.",
    );
    return null;
  }

  const newToken = await refreshAccessToken(
    account.refreshToken,
    session.user.id,
  );

  return newToken;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lấy account record của WSO2 từ Better Auth DB (qua internal API)
 */
async function getWso2Account(userId: string): Promise<AccountRecord | null> {
  try {
    if (!db) {
      console.error("[TokenManager] Kysely DB instance is not available.");
      return null;
    }

    const result = await db
      .selectFrom("account")
      .select([
        "accessToken",
        "idToken",
        "refreshToken",
        "accessTokenExpiresAt",
        "providerId",
      ])
      .where("userId", "=", userId)
      .where("providerId", "=", "wso2")
      .executeTakeFirst();

    if (!result) return null;

    return {
      accessToken: result.accessToken as string | null,
      refreshToken: result.refreshToken as string | null,
      accessTokenExpiresAt: result.accessTokenExpiresAt as Date | null,
      providerId: result.providerId as string,
      idToken: result.idToken as string | null,
    };
  } catch (error) {
    console.error("[TokenManager] Lỗi khi lấy account:", error);
    return null;
  }
}

/**
 * Kiểm tra access token có hết hạn không (với 30s buffer)
 */
function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  const bufferMs = 30 * 1000; // 30 giây buffer
  return Date.now() >= expiresAt.getTime() - bufferMs;
}

/**
 * Gọi WSO2 token endpoint để refresh access token.
 * Cập nhật token mới vào bảng account.
 */
async function refreshAccessToken(
  refreshToken: string,
  userId: string,
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.WSO2_CLIENT_ID!,
      client_secret: process.env.WSO2_CLIENT_SECRET!,
    });

    // Lấy token endpoint từ discovery
    const tokenEndpoint = await getWso2TokenEndpoint();

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[TokenManager] Refresh token thất bại:", err);
      return null;
    }

    const data = await response.json();
    const newAccessToken: string = data.access_token;
    const newRefreshToken: string = data.refresh_token ?? refreshToken;
    const expiresIn: number = data.expires_in ?? 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Cập nhật token mới vào DB
    await updateAccountTokens(
      userId,
      newAccessToken,
      newRefreshToken,
      expiresAt,
    );

    console.log("[TokenManager] Đã refresh access token thành công.");
    return newAccessToken;
  } catch (error) {
    console.error("[TokenManager] Lỗi khi refresh token:", error);
    return null;
  }
}

/**
 * Lấy WSO2 token endpoint từ OIDC discovery (có cache)
 */
let cachedTokenEndpoint: string | null = null;

async function getWso2TokenEndpoint(): Promise<string> {
  if (cachedTokenEndpoint) return cachedTokenEndpoint;

  const discoveryUrl = process.env.WSO2_DISCOVERY_URL!;
  const response = await fetch(discoveryUrl, {
    next: { revalidate: 3600 }, // cache 1 tiếng
  });
  const config = await response.json();
  cachedTokenEndpoint = config.token_endpoint as string;
  return cachedTokenEndpoint;
}

/**
 * Cập nhật token mới vào bảng account trong DB
 */
async function updateAccountTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
): Promise<void> {
  try {
    const db = (
      auth as unknown as {
        options: {
          database: {
            kysely: import("kysely").Kysely<
              Record<string, Record<string, unknown>>
            >;
          };
        };
      }
    ).options.database?.kysely;

    if (!db) return;

    await db
      .updateTable("account")
      .set({
        accessToken,
        refreshToken,
        accessTokenExpiresAt: expiresAt.toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where("userId", "=", userId)
      .where("providerId", "=", "wso2")
      .execute();
  } catch (error) {
    console.error("[TokenManager] Lỗi khi cập nhật token:", error);
  }
}
