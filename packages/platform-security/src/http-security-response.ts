import { HttpSecurityHeaderService } from "./http-security-header-service";
import type { HttpSecuritySurface } from "./http-security-header-types";
import type { CspAppProfile } from "./csp-types";

const headerService = new HttpSecurityHeaderService();

export function securePlatformResponse(
  response: Response,
  surface: HttpSecuritySurface = "api",
  app: CspAppProfile = "web",
): Response {
  return headerService.applyToResponse(response, {
    app,
    isProduction: process.env.NODE_ENV === "production",
    surface,
  });
}

export function jsonPlatformResponse(
  body: unknown,
  init?: ResponseInit,
  surface: HttpSecuritySurface = "api",
  app: CspAppProfile = "web",
): Response {
  return securePlatformResponse(Response.json(body, init), surface, app);
}
