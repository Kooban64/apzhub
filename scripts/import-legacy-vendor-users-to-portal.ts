/**
 * Merge distinct humans from Plane / Zammad / Kimai / Kiwi / Paperless / n8n (TCP to their DBs on the same Docker network as APZHUB `web`)
 * into APZHUB `users` + optional `user_credentials`, set `access_subject_flags.bundlesFromDb`, and
 * per-vendor `access_subject_service_overrides` for the admin matrix.
 *
 * Requirements:
 * - APZHUB_DATABASE_URL or DATABASE_URL (portal DB).
 * - APZHUB_IMPORT_DEFAULT_PASSWORD — min length per hub policy; for **new** users only unless APZHUB_IMPORT_RESET_PASSWORDS=1.
 * - Vendor DBs reachable (defaults target `apzhub_internal` service hostnames from vendor compose).
 *
 * Connection defaults (override with full URLs if needed):
 * - APZHUB_IMPORT_PLANE_DATABASE_URL — postgresql://plane:plane@apz-plane-db:5432/plane
 * - APZHUB_IMPORT_ZAMMAD_DATABASE_URL — postgresql://zammad:zammad@apz-zammad-pg:5432/zammad_production
 * - APZHUB_IMPORT_KIMAI_DATABASE_URL — mysql://kimai:kimai@apz-kimai-db:3306/kimai
 * - APZHUB_IMPORT_KIWI_DATABASE_URL — mysql://kiwi:kiwi@apz-kiwi-db:3306/kiwi
 * - APZHUB_IMPORT_PAPERLESS_DATABASE_URL — postgresql://paperless:paperless@apz-paperless-db:5432/paperless
 * - APZHUB_IMPORT_N8N_DATABASE_URL — default postgresql://n8n:n8n@apzpg:5432/n8n; must match `N8N_DB_POSTGRESDB_*` + created DB in `.env.vendor`. Skipped with a warning if connect/query fails (e.g. SQLite-only n8n).
 *
 * Optional:
 * - APZHUB_IMPORT_EMAIL_FALLBACK_DOMAIN (default apzor.com) — synthetic email when Plane / Paperless email is blank.
 */
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { createConnection, type RowDataPacket } from "mysql2/promise";
import pg from "pg";

import { replaceBundleAssignmentsForSubject, upsertServiceOverride } from "@/lib/access/repository/access-repository";
import { getDb } from "@/db/client";
import { userCredentials, users } from "@/db/schema";
import { MIN_PASSWORD_LENGTH } from "@/lib/identity/password-policy";

type PlatformRole = "user" | "admin" | "superadmin";

type VendorKey = "plane" | "zammad" | "kimai" | "kiwi" | "paperless" | "n8n";

type Agg = {
  emailNorm: string;
  emailDisplay: string;
  displayName: string;
  platformRole: PlatformRole;
  plane?: { token: string; pr: PlatformRole };
  zammad?: { token: string; pr: PlatformRole };
  kimai?: { token: string; pr: PlatformRole };
  kiwi?: { token: string; pr: PlatformRole };
  paperless?: { token: string; pr: PlatformRole };
  n8n?: { token: string; pr: PlatformRole };
};

const FALLBACK_DOMAIN = (process.env.APZHUB_IMPORT_EMAIL_FALLBACK_DOMAIN ?? "apzor.com").replace(/^@/, "").trim();

const DEFAULT_PLANE_URL = "postgresql://plane:plane@apz-plane-db:5432/plane";
const DEFAULT_ZAMMAD_URL = "postgresql://zammad:zammad@apz-zammad-pg:5432/zammad_production";
const DEFAULT_KIMAI_URL = "mysql://kimai:kimai@apz-kimai-db:3306/kimai";
const DEFAULT_KIWI_URL = "mysql://kiwi:kiwi@apz-kiwi-db:3306/kiwi";
const DEFAULT_PAPERLESS_URL = "postgresql://paperless:paperless@apz-paperless-db:5432/paperless";
const DEFAULT_N8N_URL = "postgresql://n8n:n8n@apzpg:5432/n8n";

function rank(r: PlatformRole): number {
  return r === "superadmin" ? 2 : r === "admin" ? 1 : 0;
}

function mergePlatformRole(...xs: PlatformRole[]): PlatformRole {
  return xs.reduce((a, b) => (rank(a) >= rank(b) ? a : b), "user");
}

function normEmail(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s.includes("@") || s.startsWith("anonymous")) {
    return null;
  }
  return s;
}

const aggs = new Map<string, Agg>();

function upsertAgg(
  emailNorm: string,
  emailDisplay: string,
  displayName: string,
  pr: PlatformRole,
  vendor: VendorKey,
  slot: { token: string; pr: PlatformRole },
): void {
  const cur =
    aggs.get(emailNorm) ??
    ({
      emailNorm,
      emailDisplay,
      displayName,
      platformRole: "user",
    } as Agg);
  cur.emailDisplay = emailDisplay;
  cur.displayName = displayName || cur.displayName;
  cur.platformRole = mergePlatformRole(cur.platformRole, pr);
  cur[vendor] = slot;
  aggs.set(emailNorm, cur);
}

async function runPlane(): Promise<void> {
  const url = (process.env.APZHUB_IMPORT_PLANE_DATABASE_URL ?? DEFAULT_PLANE_URL).trim();
  const dom = FALLBACK_DOMAIN.replace(/'/g, "''");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query<{
      norm: string;
      disp: string;
      dn: string;
      is_superuser: boolean;
      is_staff: boolean;
    }>(`
      SELECT
        trim(lower(COALESCE(NULLIF(trim(email), ''), concat(username, '@${dom}')))) AS norm,
        trim(COALESCE(NULLIF(trim(email), ''), concat(username, '@${dom}'))) AS disp,
        COALESCE(NULLIF(trim(display_name), ''), username) AS dn,
        is_superuser,
        is_staff
      FROM users
      WHERE is_active AND NOT is_bot
        AND (trim(email) <> '' OR username <> '');
    `);
    for (const r of rows) {
      const emailNorm = normEmail(r.norm);
      if (!emailNorm) {
        continue;
      }
      const pr: PlatformRole = r.is_superuser ? "superadmin" : r.is_staff ? "admin" : "user";
      const token = pr === "user" ? "r-plane-member" : "r-plane-admin";
      upsertAgg(emailNorm, r.disp, r.dn, pr, "plane", { token, pr });
    }
  } finally {
    await client.end();
  }
}

async function runZammad(): Promise<void> {
  const url = (process.env.APZHUB_IMPORT_ZAMMAD_DATABASE_URL ?? DEFAULT_ZAMMAD_URL).trim();
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query<{
      norm: string;
      disp: string;
      dn: string;
      roles_csv: string;
    }>(`
      SELECT lower(trim(u.email)) AS norm,
             u.email AS disp,
             trim(both ' ' from concat(u.firstname, ' ', u.lastname)) AS dn,
             coalesce(string_agg(distinct r.name, ','), '') AS roles_csv
      FROM users u
      LEFT JOIN roles_users ru ON ru.user_id = u.id
      LEFT JOIN roles r ON r.id = ru.role_id
      WHERE u.active AND u.email IS NOT NULL AND u.email LIKE '%@%'
      GROUP BY u.id, u.email, u.firstname, u.lastname;
    `);
    for (const r of rows) {
      const emailNorm = normEmail(r.norm);
      if (!emailNorm) {
        continue;
      }
      const roles = (r.roles_csv ?? "").split(",").map((s) => s.trim());
      const pr: PlatformRole = roles.includes("Admin") ? "admin" : "user";
      const token = roles.includes("Admin")
        ? "r-zammad-admin"
        : roles.includes("Agent")
          ? "r-zammad-agent"
          : "r-zammad-customer";
      upsertAgg(emailNorm, r.disp, r.dn || emailNorm, pr, "zammad", { token, pr });
    }
  } finally {
    await client.end();
  }
}

async function runKimai(): Promise<void> {
  const url = (process.env.APZHUB_IMPORT_KIMAI_DATABASE_URL ?? DEFAULT_KIMAI_URL).trim();
  const conn = await createConnection(url);
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT lower(trim(email)) AS norm, email AS disp, COALESCE(NULLIF(trim(alias),''), username) AS dn, roles
       FROM kimai2_users WHERE enabled=1 AND system_account=0`,
    );
    for (const r of rows) {
      const norm = String(r.norm ?? "");
      const emailNorm = normEmail(norm);
      if (!emailNorm) {
        continue;
      }
      const roles = String(r.roles ?? "");
      const superAd = roles.includes("ROLE_SUPER_ADMIN");
      const pr: PlatformRole = superAd ? "admin" : "user";
      const token = superAd ? "r-kimai-admin" : "r-kimai-user";
      upsertAgg(emailNorm, String(r.disp), String(r.dn), pr, "kimai", { token, pr });
    }
  } finally {
    await conn.end();
  }
}

async function runKiwi(): Promise<void> {
  const url = (process.env.APZHUB_IMPORT_KIWI_DATABASE_URL ?? DEFAULT_KIWI_URL).trim();
  const conn = await createConnection(url);
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT lower(trim(email)) AS norm, email AS disp,
              trim(both ' ' from concat(first_name, ' ', last_name)) AS dn,
              is_superuser, is_staff
       FROM auth_user
       WHERE is_active AND email NOT LIKE 'Anonymous%'`,
    );
    for (const r of rows) {
      const emailNorm = normEmail(String(r.norm ?? ""));
      if (!emailNorm) {
        continue;
      }
      const su = Number(r.is_superuser) === 1;
      const st = Number(r.is_staff) === 1;
      const pr: PlatformRole = su ? "superadmin" : st ? "admin" : "user";
      const token = pr === "user" ? "r-kiwi-user" : "r-kiwi-admin";
      upsertAgg(emailNorm, String(r.disp), String(r.dn) || emailNorm, pr, "kiwi", { token, pr });
    }
  } finally {
    await conn.end();
  }
}

async function runPaperless(): Promise<void> {
  const url = (process.env.APZHUB_IMPORT_PAPERLESS_DATABASE_URL ?? DEFAULT_PAPERLESS_URL).trim();
  const dom = FALLBACK_DOMAIN.replace(/'/g, "''");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query<{
      norm: string;
      disp: string;
      dn: string;
      is_superuser: boolean;
      is_staff: boolean;
    }>(`
      SELECT
        trim(lower(COALESCE(NULLIF(trim(email), ''), concat(replace(username, ' ', '_'), '@${dom}')))) AS norm,
        trim(COALESCE(NULLIF(trim(email), ''), concat(replace(username, ' ', '_'), '@${dom}'))) AS disp,
        trim(both ' ' from concat(first_name, ' ', last_name)) AS dn,
        is_superuser,
        is_staff
      FROM auth_user
      WHERE is_active;
    `);
    for (const r of rows) {
      const emailNorm = normEmail(r.norm);
      if (!emailNorm) {
        continue;
      }
      const pr: PlatformRole = r.is_superuser ? "admin" : r.is_staff ? "admin" : "user";
      const token = pr === "user" ? "r-paperless-user" : "r-paperless-admin";
      upsertAgg(emailNorm, r.disp, r.dn || emailNorm, pr, "paperless", { token, pr });
    }
  } finally {
    await client.end();
  }
}

/** n8n Postgres: table "user", role slug e.g. global:owner | global:admin | global:member. Skips if DB missing. */
async function runN8n(): Promise<void> {
  const url = (process.env.APZHUB_IMPORT_N8N_DATABASE_URL ?? DEFAULT_N8N_URL).trim();
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
  } catch (e) {
    console.warn("[import-legacy-users] n8n: could not connect (set APZHUB_IMPORT_N8N_DATABASE_URL or provision DB):", String(e));
    return;
  }
  try {
    const { rows } = await client.query<{
      norm: string;
      disp: string;
      dn: string;
      role_text: string;
    }>(`
      SELECT
        lower(trim(email)) AS norm,
        trim(email) AS disp,
        trim(both ' ' from concat(coalesce("firstName", ''), ' ', coalesce("lastName", ''))) AS dn,
        role::text AS role_text
      FROM public."user"
      WHERE email IS NOT NULL
        AND length(trim(email)) > 3;
    `);
    for (const r of rows) {
      const emailNorm = normEmail(r.norm);
      if (!emailNorm) {
        continue;
      }
      const role = (r.role_text ?? "").toLowerCase();
      const isElevated =
        role.includes("owner") || role.includes("global:admin") || role === "global:admin" || role.includes("admin");
      const pr: PlatformRole = isElevated ? "admin" : "user";
      const token = isElevated ? "r-n8n-owner" : "r-n8n-member";
      upsertAgg(emailNorm, r.disp, r.dn || emailNorm, pr, "n8n", { token, pr });
    }
  } catch (e) {
    console.warn(
      "[import-legacy-users] n8n: query failed (SQLite-only instance or older schema?). Set APZHUB_IMPORT_N8N_DATABASE_URL or ignore:",
      String(e),
    );
  } finally {
    await client.end().catch(() => {});
  }
}

async function main(): Promise<void> {
  const password = process.env.APZHUB_IMPORT_DEFAULT_PASSWORD?.trim();
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Set APZHUB_IMPORT_DEFAULT_PASSWORD (min ${MIN_PASSWORD_LENGTH} characters).`);
  }
  const resetAll = process.env.APZHUB_IMPORT_RESET_PASSWORDS === "1";

  await runPlane();
  await runZammad();
  await Promise.all([runKimai(), runKiwi(), runPaperless()]);
  await runN8n();

  const db = getDb();
  const hash = await argon2.hash(password, { type: argon2.argon2id });

  for (const agg of aggs.values()) {
    await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(users).where(eq(users.emailNormalized, agg.emailNorm)).limit(1);
      let userId: string;
      if (existing) {
        userId = existing.id;
        const mergedRole = mergePlatformRole(existing.platformRole as PlatformRole, agg.platformRole);
        await tx
          .update(users)
          .set({
            displayName: agg.displayName || existing.displayName,
            platformRole: mergedRole,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id));
        const [cred] = await tx.select().from(userCredentials).where(eq(userCredentials.userId, userId)).limit(1);
        if (!cred || resetAll) {
          if (cred) {
            await tx.update(userCredentials).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(userCredentials.userId, userId));
          } else {
            await tx.insert(userCredentials).values({ userId, passwordHash: hash });
          }
        }
      } else {
        const [inserted] = await tx
          .insert(users)
          .values({
            email: agg.emailDisplay,
            emailNormalized: agg.emailNorm,
            displayName: agg.displayName || agg.emailDisplay.split("@")[0] || "User",
            status: "active",
            platformRole: agg.platformRole,
            emailVerifiedAt: new Date(),
          })
          .returning({ id: users.id });
        if (!inserted) {
          throw new Error("insert user failed: " + agg.emailNorm);
        }
        userId = inserted.id;
        await tx.insert(userCredentials).values({ userId, passwordHash: hash });
      }

      await replaceBundleAssignmentsForSubject(userId, [], tx);

      const vendors: Array<[VendorKey, { token: string } | undefined]> = [
        ["plane", agg.plane],
        ["zammad", agg.zammad],
        ["kimai", agg.kimai],
        ["kiwi", agg.kiwi],
        ["paperless", agg.paperless],
        ["n8n", agg.n8n],
      ];
      for (const [sid, slot] of vendors) {
        if (slot) {
          await upsertServiceOverride(userId, sid, slot.token, tx);
        }
      }
    });
  }

  console.log("Imported / merged", aggs.size, "unique emails into portal users + vendor access overrides.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
