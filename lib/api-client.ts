/**
 * .NET Core API Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper để gọi .NET Core API với WSO2 Bearer token.
 * Chỉ dùng trong Server Components, Server Actions, Route Handlers.
 *
 * Features:
 * - Tự động inject Authorization: Bearer {access_token}
 * - Auto-refresh token nếu hết hạn
 * - Retry 1 lần nếu nhận 401 (token bị revoke)
 * - Bỏ qua SSL certificate errors cho localhost dev
 */

import { getValidAccessToken } from "@/lib/token-manager";

// ─── Base Configuration ───────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.DOTNET_API_BASE_URL ?? "https://localhost:7522";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** Không dùng authentication (public endpoints) */
  skipAuth?: boolean;
}

interface ApiError {
  status: number;
  message: string;
  detail?: unknown;
}

// ─── Core Fetch Function ──────────────────────────────────────────────────────

/**
 * Gọi .NET Core API với token tự động.
 *
 * @example
 * // GET
 * const users = await apiFetch<User[]>("/api/users");
 *
 * // POST
 * const result = await apiFetch<CreateResponse>("/api/items", {
 *   method: "POST",
 *   body: JSON.stringify({ name: "Test" }),
 * });
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  // 1. Lấy access token (có auto-refresh)
  const authHeaders: Record<string, string> = {};
  if (!skipAuth) {
    const token = await getValidAccessToken();
    if (token) {
      authHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // 2. Build full URL
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // 3. Merge headers
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...authHeaders,
    ...headers,
  };

  // 4. Gọi API
  const response = await fetchWithTls(url, {
    ...restOptions,
    headers: finalHeaders,
  });

  // 5. Xử lý response
  if (!response.ok) {
    let errorDetail: unknown;
    try {
      errorDetail = await response.json();
    } catch {
      errorDetail = await response.text();
    }

    const apiError: ApiError = {
      status: response.status,
      message: `API Error ${response.status}: ${response.statusText}`,
      detail: errorDetail,
    };

    console.error(`[ApiClient] ${apiError.message}`, errorDetail);
    throw apiError;
  }

  // 6. Parse JSON response
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as T;
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

export const apiClient = {
  /** GET request */
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { method: "GET", ...options }),

  /** POST request với JSON body */
  post: <T>(path: string, body: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  /** PUT request với JSON body */
  put: <T>(path: string, body: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  /** PATCH request với JSON body */
  patch: <T>(path: string, body: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  /** DELETE request */
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...options }),
};

// ─── TLS Helper (cho dev với self-signed cert) ────────────────────────────────

/**
 * Wrapper cho fetch hỗ trợ self-signed certificate ở localhost.
 * Production: nên dùng CA-signed certificate và bỏ option này.
 */
async function fetchWithTls(
  url: string,
  options: RequestInit
): Promise<Response> {
  const isDev = process.env.NODE_ENV === "development";
  const isLocalhost = url.includes("localhost") || url.includes("127.0.0.1");

  if (isDev && isLocalhost) {
    // Node.js 18+: dùng undici với rejectUnauthorized: false cho localhost
    const { Agent, fetch: undiciFetch } = await import("undici");
    const dispatcher = new Agent({
      connect: { rejectUnauthorized: false },
    });
    return undiciFetch(url, {
      ...options,
      // @ts-expect-error - undici dispatcher option
      dispatcher,
    }) as unknown as Response;
  }

  return fetch(url, options);
}
