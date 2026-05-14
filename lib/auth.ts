import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { MssqlDialect, Kysely } from "kysely";
import * as Tedious from "tedious";
import * as Tarn from "tarn";

// ─── MSSQL Dialect ───────────────────────────────────────────────────────────
const dialect = new MssqlDialect({
  tarn: {
    ...Tarn,
    options: {
      min: 0,
      max: 10,
    },
  },
  tedious: {
    ...Tedious,
    connectionFactory: () => {
      const server = process.env.MSSQL_SERVER;
      const database = process.env.MSSQL_DATABASE;
      const userName = process.env.MSSQL_USER;
      const password = process.env.MSSQL_PASSWORD;
      const port = Number(process.env.MSSQL_PORT ?? "1433");

      if (!server || !database || !userName) {
        throw new Error(
          `[Better Auth] MSSQL env vars không đầy đủ. ` +
            `MSSQL_SERVER=${server}, MSSQL_DATABASE=${database}, MSSQL_USER=${userName}`,
        );
      }

      // Tedious Connection config: server nằm ở cấp cao nhất, không phải trong options
      return new Tedious.Connection({
        server, // ĐÚNG: server ở đây
        authentication: {
          options: {
            userName,
            password: password ?? "",
          },
          type: "default",
        },
        options: {
          port,
          database,
          trustServerCertificate: true,
          encrypt: false,
        },
      });
    },
  },
});

interface Database {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
  };
  account: {
    id: string;
    userId: string;
    providerId: string;
    accountId: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
    scope?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  verification: {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

/**
 * Shared Kysely instance để truy vấn database thủ công
 * (Dùng cho token-manager hoặc các logic custom khác)
 */
export const db = new Kysely<Database>({
  dialect,
});

// ─── Better Auth Configuration ───────────────────────────────────────────────
export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ?? "fallback-secret-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  database: {
    dialect,
    type: "mssql",
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "wso2",
          clientId: process.env.WSO2_CLIENT_ID!,
          clientSecret: process.env.WSO2_CLIENT_SECRET!,
          discoveryUrl: process.env.WSO2_DISCOVERY_URL!,
          issuer: process.env.WSO2_ISSUER,
          scopes: (process.env.WSO2_SCOPES || "openid email profile").split(
            " ",
          ),
          // Explicitly set redirectURI to ensure it matches WSO2 configuration
          redirectURI:
            process.env.BETTER_AUTH_URL! + "/api/auth/oauth2/callback/wso2",
          pkce: true,
          mapProfileToUser: (profile) => {
            console.log("--- DEBUG WSO2 PROFILE ---");
            console.log(JSON.stringify(profile, null, 2));
            console.log("--------------------------");
            return {
              name:
                (profile.username as string) ||
                (profile.preferred_username as string) ||
                (profile.name as string) ||
                (profile.sub as string),
              email: (profile.email as string) ?? "",
              image: (profile.picture as string) ?? null,
              emailVerified: Boolean(profile.email_verified),
            };
          },
          overrideUserInfo: true,
        },
      ],
    }),
  ],
});

export type Auth = typeof auth;
