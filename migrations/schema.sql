-- ============================================================
-- Better Auth - MSSQL Schema (Database: authBetter)
-- Chạy script này trên SQL Server Management Studio (SSMS)
-- hoặc dùng sqlcmd để tạo các bảng cần thiết.
-- ============================================================

USE [authBetter];
GO

-- ─── Bảng user ───────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user' AND xtype='U')
BEGIN
    CREATE TABLE [user] (
        [id]            NVARCHAR(255)   NOT NULL PRIMARY KEY,
        [name]          NVARCHAR(255)   NOT NULL,
        [email]         NVARCHAR(255)   NOT NULL UNIQUE,
        [emailVerified] BIT             NOT NULL DEFAULT 0,
        [image]         NVARCHAR(MAX)   NULL,
        [createdAt]     DATETIME2       NOT NULL DEFAULT GETDATE(),
        [updatedAt]     DATETIME2       NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Created table: [user]';
END
GO

-- ─── Bảng session ────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='session' AND xtype='U')
BEGIN
    CREATE TABLE [session] (
        [id]                    NVARCHAR(255)   NOT NULL PRIMARY KEY,
        [expiresAt]             DATETIME2       NOT NULL,
        [token]                 NVARCHAR(255)   NOT NULL UNIQUE,
        [createdAt]             DATETIME2       NOT NULL DEFAULT GETDATE(),
        [updatedAt]             DATETIME2       NOT NULL DEFAULT GETDATE(),
        [ipAddress]             NVARCHAR(255)   NULL,
        [userAgent]             NVARCHAR(MAX)   NULL,
        [userId]                NVARCHAR(255)   NOT NULL,
        FOREIGN KEY ([userId]) REFERENCES [user]([id]) ON DELETE CASCADE
    );
    PRINT 'Created table: [session]';
END
GO

-- ─── Bảng account (lưu OAuth tokens từ WSO2) ─────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='account' AND xtype='U')
BEGIN
    CREATE TABLE [account] (
        [id]                        NVARCHAR(255)   NOT NULL PRIMARY KEY,
        [accountId]                 NVARCHAR(255)   NOT NULL,
        [providerId]                NVARCHAR(255)   NOT NULL,
        [userId]                    NVARCHAR(255)   NOT NULL,
        [accessToken]               NVARCHAR(MAX)   NULL,
        [refreshToken]              NVARCHAR(MAX)   NULL,
        [idToken]                   NVARCHAR(MAX)   NULL,
        [accessTokenExpiresAt]      DATETIME2       NULL,
        [refreshTokenExpiresAt]     DATETIME2       NULL,
        [scope]                     NVARCHAR(MAX)   NULL,
        [password]                  NVARCHAR(MAX)   NULL,
        [createdAt]                 DATETIME2       NOT NULL DEFAULT GETDATE(),
        [updatedAt]                 DATETIME2       NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY ([userId]) REFERENCES [user]([id]) ON DELETE CASCADE
    );
    PRINT 'Created table: [account]';
END
GO

-- ─── Bảng verification ───────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='verification' AND xtype='U')
BEGIN
    CREATE TABLE [verification] (
        [id]            NVARCHAR(255)   NOT NULL PRIMARY KEY,
        [identifier]    NVARCHAR(255)   NOT NULL,
        [value]         NVARCHAR(MAX)   NOT NULL,
        [expiresAt]     DATETIME2       NOT NULL,
        [createdAt]     DATETIME2       NULL DEFAULT GETDATE(),
        [updatedAt]     DATETIME2       NULL DEFAULT GETDATE()
    );
    PRINT 'Created table: [verification]';
END
GO

PRINT '=== Better Auth schema migration completed successfully! ===';
GO
