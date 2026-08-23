import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { getDb, hasDatabase, schema } from "@/db";
import { sendResetEmail, sendWelcomeEmail } from "@/lib/email";

function baseUrl(): string {
  const vercel = process.env.VERCEL_URL?.trim();
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    (vercel ? `https://${vercel.replace(/^https?:\/\//, "")}` : "") ||
    "http://localhost:5173"
  );
}

let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (!hasDatabase()) {
    throw new Error("Cloud auth requires DATABASE_URL.");
  }
  if (!_auth) {
    _auth = betterAuth({
      secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-change-me",
      baseURL: baseUrl(),
      trustedOrigins: [
        baseUrl(),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://aftercut-sandy.vercel.app",
      ],
      database: drizzleAdapter(getDb(), {
        provider: "pg",
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        sendResetPassword: async ({ user, url }) => {
          await sendResetEmail(user.email, url);
        },
      },
      socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ? {
              google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                scope: [
                  "openid",
                  "email",
                  "profile",
                  "https://www.googleapis.com/auth/calendar.events",
                ],
              },
            }
          : {}),
      },
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              void sendWelcomeEmail(user.email, user.name);
            },
          },
        },
      },
    });
  }
  return _auth;
}

export function cloudAuthEnabled(): boolean {
  return hasDatabase() && Boolean(process.env.BETTER_AUTH_SECRET?.trim());
}
