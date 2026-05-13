"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Kiểm tra nếu đã đăng nhập thì redirect
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        router.replace(from);
      } else {
        setIsCheckingSession(false);
      }
    });
  }, [router, from]);

  const handleSsoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL +
          "/api/auth/oauth2/callback/wso2",
      );
      await authClient.signIn.oauth2({
        providerId: "wso2",
        callbackURL: from || "/dashboard",
        errorCallbackURL: "/login?error=sso_failed",
      });
    } catch (err) {
      console.error("SSO Login error:", err);
      setError("Đăng nhập SSO thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  // Hiển thị lỗi từ URL params (redirect sau khi callback thất bại)
  const urlError = searchParams.get("error");

  if (isCheckingSession) {
    return (
      <div className="login-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Background gradient */}
      <div className="login-bg" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <main className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="brand-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#brand-grad)" />
              <path
                d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M20 28C17.79 28 16 26.21 16 24C16 21.79 17.79 20 20 20"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="2" fill="white" />
              <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-name">Enterprise Portal</h1>
            <p className="brand-sub">Single Sign-On</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="card-header">
            <h2 className="card-title">Chào mừng trở lại</h2>
            <p className="card-desc">
              Đăng nhập bằng tài khoản WSO2 của tổ chức bạn
            </p>
          </div>

          {/* Error Message */}
          {(error || urlError) && (
            <div className="error-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#f87171"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5v3.5M8 11h.01"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                {error ??
                  (urlError === "sso_failed"
                    ? "Đăng nhập SSO thất bại. Vui lòng thử lại."
                    : "Đã xảy ra lỗi. Vui lòng thử lại.")}
              </span>
            </div>
          )}

          {/* SSO Login Button */}
          <button
            id="sso-login-btn"
            className="sso-btn"
            onClick={handleSsoLogin}
            disabled={isLoading}
            aria-label="Đăng nhập bằng WSO2 SSO"
          >
            {isLoading ? (
              <>
                <div className="btn-spinner" aria-hidden="true" />
                <span>Đang chuyển hướng đến WSO2...</span>
              </>
            ) : (
              <>
                {/* WSO2 Icon */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="10"
                    stroke="#ff7300"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 11C7 8.79 8.79 7 11 7C13.21 7 15 8.79 15 11"
                    stroke="#ff7300"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="11" cy="11" r="2.5" fill="#ff7300" />
                  <path
                    d="M11 13.5V15"
                    stroke="#ff7300"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Đăng nhập bằng WSO2 SSO</span>
                <svg
                  className="btn-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>

          {/* Info */}
          <div className="login-info">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#94a3b8" strokeWidth="1.2" />
              <path
                d="M7 6.5V10M7 5h.01"
                stroke="#94a3b8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <p>
              Bạn sẽ được chuyển đến trang đăng nhập của tổ chức để xác thực.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="login-footer">
          Được bảo mật bởi <span className="footer-highlight">Better Auth</span>{" "}
          &amp; <span className="footer-highlight">WSO2 Identity Server</span>
        </p>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f1a;
        }

        .spinner, .btn-spinner {
          width: 24px; height: 24px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .btn-spinner { width: 18px; height: 18px; border-top-color: white; }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f1a;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }

        .bg-orb-1 {
          width: 500px; height: 500px;
          background: #6366f1;
          top: -200px; left: -100px;
          animation: float 8s ease-in-out infinite;
        }

        .bg-orb-2 {
          width: 400px; height: 400px;
          background: #8b5cf6;
          bottom: -150px; right: -80px;
          animation: float 10s ease-in-out infinite reverse;
        }

        .bg-orb-3 {
          width: 300px; height: 300px;
          background: #ff7300;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.06;
          animation: float 12s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }

        .bg-orb-3 {
          animation: float3 12s ease-in-out infinite;
        }

        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -55%) scale(1.05); }
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-icon {
          filter: drop-shadow(0 0 20px rgba(99,102,241,0.5));
        }

        .brand-text { display: flex; flex-direction: column; gap: 2px; }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.02em;
        }

        .brand-sub {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        .login-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 36px 32px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 20px 60px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-header { display: flex; flex-direction: column; gap: 8px; }

        .card-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.03em;
        }

        .card-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.5;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 0.875rem;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sso-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .sso-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .sso-btn:hover:not(:disabled)::before { opacity: 1; }

        .sso-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
        }

        .sso-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
        }

        .sso-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          margin-left: auto;
          transition: transform 0.2s;
        }

        .sso-btn:hover:not(:disabled) .btn-arrow {
          transform: translateX(3px);
        }

        .login-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #475569;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .login-info svg { flex-shrink: 0; margin-top: 1px; }

        .login-footer {
          color: #334155;
          font-size: 0.8rem;
          text-align: center;
        }

        .footer-highlight {
          color: #6366f1;
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .login-card { padding: 28px 20px; }
          .card-title { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
