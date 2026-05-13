import { betterAuth, string } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { MssqlDialect } from "kysely";
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
  TYPES: {
    ...Tedious.TYPES,
    DateTime: Tedious.TYPES.DateTime2,
  },
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
          scopes: ["openid", "email", "profile"],
          // Explicitly set redirectURI to ensure it matches WSO2 configuration
          redirectURI:
            process.env.BETTER_AUTH_URL! + "/api/auth/oauth2/callback/wso2",
          pkce: false,
          mapProfileToUser: (profile) => {
            console.log("profile: ", profile);
            return {
              name:
                (profile.username as string) ||
                (profile.preferred_username as string) ||
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
