import { test, expect } from "@playwright/test";

test.describe("Law API developer experience", () => {
  test("serves OpenAPI YAML specification", async ({ request }) => {
    const response = await request.get("/api/law/v1/openapi.yaml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("yaml");
    const text = await response.text();
    expect(text).toContain("openapi: 3.1.0");
    expect(text).toContain("/clients:");
  });

  test("serves OpenAPI JSON specification", async ({ request }) => {
    const response = await request.get("/api/law/v1/openapi.json");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.paths["/clients"]).toBeTruthy();
  });

  test("documentation landing page is available at /api/docs", async ({ page }) => {
    await page.goto("/api/docs");
    await expect(
      page.getByRole("heading", { name: "Developer Documentation" }),
    ).toBeVisible();
    await expect(page.getByTestId("law-api-swagger-explorer")).toBeVisible();
  });

  test("serves developer guide markdown", async ({ request }) => {
    const response = await request.get("/api/docs/guides/getting-started");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("Getting Started");
  });

  test("serves Postman collection download", async ({ request }) => {
    const response = await request.get(
      "/specs/collections/LAW-OpenAPI-v1.postman_collection.json",
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.info.name).toContain("Law Platform API");
    expect(Array.isArray(body.item)).toBe(true);
  });

  test("law API health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/law/v1/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
