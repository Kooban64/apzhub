/**
 * Stream 1 commerce basket — multi-package selection across public → checkout.
 * Client storage: sessionStorage. Server never trusts cart alone for AuthZ.
 */

export const COMMERCE_CART_STORAGE_KEY = "apzhub.commerce.cart.v2";
export const LEGACY_COMMERCE_CART_STORAGE_KEY = "apzhub.commerce.cart.v1";

export type CommerceCart = {
  readonly packageIds: readonly string[];
  readonly planId: "plan.individual" | "plan.business";
  readonly seats: number;
};

export const DEFAULT_ORG_COMMERCE_PLAN_ID = "plan.business" as const;

const SELF_SERVE_DOGFOOD_PACKAGES = new Set([
  "pkg.apzqep.starter",
  "pkg.apzpen.starter",
  "pkg.apzprd.projects",
]);

export function isDogfoodSelfServePackage(packageId: string): boolean {
  return SELF_SERVE_DOGFOOD_PACKAGES.has(packageId.trim());
}

export function normalizeCommercePlanId(
  value: string | null | undefined,
): CommerceCart["planId"] {
  const trimmed = (value ?? "").trim();
  if (trimmed === "plan.individual") return "plan.individual";
  return DEFAULT_ORG_COMMERCE_PLAN_ID;
}

function normalizePackageIds(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((v) => String(v).trim()).filter(Boolean))];
  }
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  return [];
}

export function parseCommerceCart(raw: unknown): CommerceCart | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const packageIds = normalizePackageIds(
    record.packageIds ?? record.packageId ?? record.packages,
  );
  if (packageIds.length === 0) return null;
  const seatsRaw = record.seats;
  const seats =
    typeof seatsRaw === "number" && Number.isFinite(seatsRaw) && seatsRaw > 0
      ? Math.floor(seatsRaw)
      : 1;
  return {
    packageIds,
    planId: normalizeCommercePlanId(
      typeof record.planId === "string" ? record.planId : undefined,
    ),
    seats,
  };
}

export function commerceCartFromSearchParams(
  params: URLSearchParams | { get(name: string): string | null },
): CommerceCart | null {
  const fromList = params.get("packages")?.trim();
  const fromSingle = params.get("package")?.trim();
  const packageIds = fromList
    ? fromList
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : fromSingle
      ? [fromSingle]
      : [];
  if (packageIds.length === 0) return null;
  const seatsRaw = Number(params.get("seats") ?? "1");
  return {
    packageIds: [...new Set(packageIds)],
    planId: normalizeCommercePlanId(params.get("plan")),
    seats: Number.isFinite(seatsRaw) && seatsRaw > 0 ? Math.floor(seatsRaw) : 1,
  };
}

export function commerceCartToQuery(cart: CommerceCart): string {
  const params = new URLSearchParams({
    packages: cart.packageIds.join(","),
    plan: cart.planId,
    seats: String(cart.seats),
  });
  return params.toString();
}

export function buildPathWithCart(path: string, cart: CommerceCart | null): string {
  if (!cart || cart.packageIds.length === 0) return path;
  const query = commerceCartToQuery(cart);
  return path.includes("?") ? `${path}&${query}` : `${path}?${query}`;
}

export function readCommerceCartFromStorage(): CommerceCart | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(COMMERCE_CART_STORAGE_KEY) ??
      sessionStorage.getItem(LEGACY_COMMERCE_CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseCommerceCart(JSON.parse(raw) as unknown);
    if (parsed) return parsed;
    // Legacy v1 single package
    const legacy = JSON.parse(raw) as { packageId?: string };
    if (legacy.packageId) {
      return parseCommerceCart({
        packageId: legacy.packageId,
        planId: "plan.business",
        seats: 1,
      });
    }
    return null;
  } catch {
    return null;
  }
}

export function writeCommerceCartToStorage(cart: CommerceCart): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(COMMERCE_CART_STORAGE_KEY, JSON.stringify(cart));
}

export function clearCommerceCartStorage(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(COMMERCE_CART_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_COMMERCE_CART_STORAGE_KEY);
}

/** Merge URL params over storage; persist when packages present. */
export function resolveCommerceCart(
  params?: URLSearchParams | { get(name: string): string | null },
): CommerceCart | null {
  const fromUrl = params ? commerceCartFromSearchParams(params) : null;
  if (fromUrl) {
    writeCommerceCartToStorage(fromUrl);
    return fromUrl;
  }
  return readCommerceCartFromStorage();
}

export function onboardingOrganisationPath(cart: CommerceCart | null): string {
  return buildPathWithCart("/onboarding/organisation", cart);
}

export function checkoutPath(cart: CommerceCart | null): string {
  return buildPathWithCart("/pricing/checkout", cart);
}

export function registerPath(cart: CommerceCart | null): string {
  return buildPathWithCart("/register", cart);
}

export function loginPath(cart: CommerceCart | null): string {
  const next = onboardingOrganisationPath(cart);
  return `/login?callbackUrl=${encodeURIComponent(next)}`;
}

export function togglePackageInCart(
  cart: CommerceCart | null,
  packageId: string,
): CommerceCart {
  const id = packageId.trim();
  const base: CommerceCart = cart ?? {
    packageIds: [],
    planId: DEFAULT_ORG_COMMERCE_PLAN_ID,
    seats: 1,
  };
  const set = new Set(base.packageIds);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  return { ...base, packageIds: [...set] };
}
