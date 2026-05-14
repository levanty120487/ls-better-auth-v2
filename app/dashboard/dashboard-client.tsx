"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface ApiHealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}

interface Category {
  key: string;
  title: string;
}

interface Props {
  user: User;
  tokenPreview: string | null;
  // apiStatus: ApiHealthResponse | null;
  categories: Category[];
  apiError: string | null;
}

export default function DashboardClient({
  user,
  tokenPreview,
  // apiStatus,
  categories,
  apiError,
}: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-dot" aria-hidden="true" />
          <span>Enterprise Portal</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation chính">
          <a
            href="/dashboard"
            className="nav-item nav-item-active"
            aria-current="page"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="11"
                y="1"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="1"
                y="11"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="11"
                y="11"
                width="6"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Dashboard
          </a>
          <a href="#" className="nav-item">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="6"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M2 16c0-3.31 3.13-6 7-6s7 2.69 7 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Hồ sơ
          </a>
          <a href="#" className="nav-item">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="9"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.41 1.41M13.36 13.36l1.42 1.42M3.22 14.78l1.41-1.41M13.36 4.64l1.42-1.42"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Cài đặt
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar" aria-hidden="true">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="user-text">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>

          <button
            id="logout-btn"
            className="logout-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Đăng xuất"
          >
            {isLoggingOut ? (
              <div className="btn-spinner" aria-hidden="true" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3M6.5 11.5 10 8l-3.5-3.5M10 8H2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span>{isLoggingOut ? "Đang xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">
              Xin chào, <strong>{user.name}</strong> 👋
            </p>
          </div>
          <div className="header-badge">
            <div className="badge-dot" aria-hidden="true" />
            <span>WSO2 SSO</span>
          </div>
        </header>

        {/* Categories Section */}
        <section className="section-card" aria-labelledby="categories-title">
          <div className="section-header">
            <h2 id="categories-title" className="section-title">
              Danh mục tin tức
            </h2>
            <span className="badge badge-blue">
              {categories.length} Danh mục
            </span>
          </div>

          {categories.length > 0 ? (
            <div className="categories-grid">
              {categories.map((cat) => (
                <div key={cat.key} className="category-item">
                  <div className="cat-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="cat-info">
                    <p className="cat-name">{cat.title}</p>
                    <p className="cat-slug">/{cat.title || "no-slug"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Chưa có danh mục nào được tải hoặc lỗi API.</p>
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* User Info Card */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Người dùng</p>
              <p className="stat-value">{user.name}</p>
              <p className="stat-detail">{user.email}</p>
            </div>
          </div>

          {/* Token Card */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-green" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16 8H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 8V6a3 3 0 0 1 6 0v2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">WSO2 Token</p>
              <p className="stat-value token-status">
                {tokenPreview ? (
                  <span className="status-ok">✓ Có hiệu lực</span>
                ) : (
                  <span className="status-err">✗ Không tìm thấy</span>
                )}
              </p>
              {tokenPreview && (
                <p
                  className="stat-detail token-preview"
                  title="Access Token (rút gọn)"
                >
                  {tokenPreview}
                </p>
              )}
            </div>
          </div>

          {/* API Status Card */}
          <div className="stat-card">
            <div className={`stat-icon stat-icon-blue`} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 10h14M3 6h14M3 14h7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">.NET Core API</p>
              <p className="stat-value">
                {/* {apiStatus ? (
                  <span className="status-ok">✓ {apiStatus.status}</span>
                ) : (
                  <span className="status-err">✗ Không kết nối được</span>
                )} */}
              </p>
              {/* {apiStatus?.version && (
                <p className="stat-detail">v{apiStatus.version}</p>
              )}
              {apiError && <p className="stat-detail stat-error">{apiError}</p>} */}
            </div>
          </div>
        </div>

        {/* Token Details Section */}
        <section className="section-card" aria-labelledby="token-section-title">
          <h2 id="token-section-title" className="section-title">
            Chi tiết Token & Xác thực
          </h2>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">User ID</span>
              <code className="info-value">{user.id}</code>
            </div>
            <div className="info-row">
              <span className="info-label">SSO Provider</span>
              <span className="info-value">
                <span className="badge badge-orange">WSO2 Identity Server</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Auth Framework</span>
              <span className="info-value">
                <span className="badge badge-purple">Better Auth v1.x</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Database</span>
              <span className="info-value">
                <span className="badge badge-blue">
                  MSSQL Server (authBetter)
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">API Endpoint</span>
              <code className="info-value">https://localhost:7522</code>
            </div>
            <div className="info-row">
              <span className="info-label">Token Refresh</span>
              <span className="info-value">
                <span className="badge badge-green">Auto (30s buffer)</span>
              </span>
            </div>
          </div>
        </section>

        {/* API Usage Example */}
        <section className="section-card" aria-labelledby="api-section-title">
          <h2 id="api-section-title" className="section-title">
            Cách gọi .NET API từ Server Component
          </h2>
          <pre className="code-block">{`// Trong bất kỳ Server Component / Route Handler nào:
import { apiClient } from "@/lib/api-client";

// GET request (token tự động inject)
const data = await apiClient.get("/api/users");

// POST request
const result = await apiClient.post("/api/items", {
  name: "Tên item",
  quantity: 5
});

// Token sẽ tự động refresh nếu hết hạn!`}</pre>
        </section>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #0a0a14;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #e2e8f0;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px 28px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.01em;
        }

        .brand-dot {
          width: 8px; height: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99,102,241,0.6);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .nav-item:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }

        .nav-item-active {
          background: rgba(99,102,241,0.12);
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,0.2);
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px;
        }

        .avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }

        .avatar img { width: 100%; height: 100%; object-fit: cover; }

        .user-text { min-width: 0; }

        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.72rem;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 8px;
          color: #f87171;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
        }

        .logout-btn:hover:not(:disabled) {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.25);
        }

        .logout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-spinner {
          width: 14px; height: 14px;
          border: 1.5px solid rgba(248,113,113,0.3);
          border-top-color: #f87171;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Main Content ── */
        .main-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.03em;
        }

        .page-sub {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 4px;
        }

        .page-sub strong { color: #94a3b8; }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255,115,0,0.1);
          border: 1px solid rgba(255,115,0,0.2);
          border-radius: 999px;
          color: #fb923c;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .badge-dot {
          width: 6px; height: 6px;
          background: #fb923c;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(251,146,60,0.6);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── Stats Grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: border-color 0.2s;
        }

        .stat-card:hover { border-color: rgba(255,255,255,0.12); }

        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-purple { background: rgba(99,102,241,0.15); color: #a5b4fc; }
        .stat-icon-green  { background: rgba(34,197,94,0.12);  color: #86efac; }
        .stat-icon-blue   { background: rgba(59,130,246,0.12); color: #93c5fd; }
        .stat-icon-red    { background: rgba(239,68,68,0.12);  color: #fca5a5; }

        .stat-content { min-width: 0; flex: 1; }

        .stat-label {
          font-size: 0.75rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-detail {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .token-preview {
          font-family: 'Fira Code', monospace;
          font-size: 0.7rem !important;
          color: #64748b !important;
          cursor: help;
        }

        .stat-error { color: #f87171 !important; }

        .status-ok  { color: #86efac; }
        .status-err { color: #fca5a5; }

        /* ── Section Card ── */
        .section-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .info-row:last-child { border-bottom: none; }

        .info-label {
          font-size: 0.8rem;
          color: #475569;
          font-weight: 500;
          min-width: 140px;
          flex-shrink: 0;
        }

        .info-value {
          font-size: 0.85rem;
          color: #94a3b8;
          font-family: 'Fira Code', monospace;
        }

        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          font-family: inherit;
        }

        .badge-orange { background: rgba(255,115,0,0.1);  color: #fb923c; border: 1px solid rgba(255,115,0,0.2); }
        .badge-purple { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); }
        .badge-blue   { background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
        .badge-green  { background: rgba(34,197,94,0.1);  color: #86efac; border: 1px solid rgba(34,197,94,0.2); }

        /* Categories */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .category-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .category-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-2px);
        }

        .cat-icon {
          width: 32px; height: 32px;
          background: rgba(99,102,241,0.1);
          color: #818cf8;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cat-info { min-width: 0; }
        .cat-name { font-size: 0.85rem; font-weight: 600; color: #f1f5f9; margin-bottom: 2px; }
        .cat-slug { font-size: 0.7rem; color: #64748b; font-family: monospace; }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: #475569;
          font-style: italic;
          font-size: 0.9rem;
        }

        /* Code block */
        .code-block {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 20px;
          font-family: 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.7;
          overflow-x: auto;
          white-space: pre;
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { padding: 20px 16px; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
