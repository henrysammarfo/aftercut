import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Better Auth — user */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Better Auth — session */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

/** Better Auth — OAuth / credential account */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Better Auth — email verify / password reset tokens */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/** Multi-brand workspace — one row per brand */
export const brand = pgTable(
  "brand",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    /** Full tenant ledger JSON (drafts, kit, timeline, etc.) */
    data: jsonb("data").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("brand_user_idx").on(t.userId),
    uniqueIndex("brand_user_slug_idx").on(t.userId, t.slug),
  ],
);

/** OAuth tokens for social publish + Google Calendar (real provider APIs) */
export const connectedAccount = pgTable(
  "connected_account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brand.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // x | linkedin | google | telegram
    providerAccountId: text("provider_account_id"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    scope: text("scope"),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("connected_user_idx").on(t.userId),
    uniqueIndex("connected_user_provider_idx").on(t.userId, t.provider, t.brandId),
  ],
);

/** Agency / studio seat invites (email) */
export const studioInvite = pgTable(
  "studio_invite",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull().default("editor"),
    status: text("status").notNull().default("pending"), // pending | accepted | revoked
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("invite_owner_idx").on(t.ownerUserId),
    uniqueIndex("invite_owner_email_idx").on(t.ownerUserId, t.email),
  ],
);

/** Publish analytics — what actually went live */
export const publishEvent = pgTable(
  "publish_event",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    brandId: text("brand_id").references(() => brand.id, { onDelete: "set null" }),
    draftId: text("draft_id"),
    platform: text("platform").notNull(),
    hook: text("hook"),
    externalId: text("external_id"),
    scheduledAt: timestamp("scheduled_at"),
    publishedAt: timestamp("published_at").notNull().defaultNow(),
    meta: jsonb("meta").default({}),
  },
  (t) => [index("publish_user_idx").on(t.userId)],
);
