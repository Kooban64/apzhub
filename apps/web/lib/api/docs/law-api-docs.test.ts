import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { GET as getOpenApiJson } from "../../../app/api/law/v1/openapi.json/route";
import { GET as getOpenApiYaml } from "../../../app/api/law/v1/openapi.yaml/route";
import { GET as getGuide } from "../../../app/api/docs/guides/[slug]/route";
import {
  LAW_API_DEVELOPER_GUIDES,
  LAW_API_DOC_DOWNLOADS,
  loadOpenApiSpecObject,
  loadOpenApiSpecYaml,
  resetOpenApiSpecCache,
} from "./index";

describe("Law API OpenAPI serving", () => {
  afterEach(() => {
    resetOpenApiSpecCache();
  });

  it("loads canonical YAML from docs/specs", () => {
    const yaml = loadOpenApiSpecYaml();
    expect(yaml).toContain("openapi: 3.1.0");
    expect(yaml).toContain("/clients:");
    expect(yaml).toContain("APZHUB Law Platform API");
  });

  it("parses OpenAPI to JSON object", () => {
    const spec = loadOpenApiSpecObject();
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths).toBeTruthy();
  });

  it("serves GET /api/law/v1/openapi.yaml", async () => {
    const response = await getOpenApiYaml();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("yaml");
    const text = await response.text();
    expect(text).toContain("openapi: 3.1.0");
  });

  it("serves GET /api/law/v1/openapi.json", async () => {
    const response = await getOpenApiJson();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toContain("Law Platform");
  });
});

describe("Law API developer guides", () => {
  it("serves getting-started guide markdown", async () => {
    const response = await getGuide(
      new Request("http://localhost/api/docs/guides/getting-started"),
      {
        params: Promise.resolve({ slug: "getting-started" }),
      },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("markdown");
    const text = await response.text();
    expect(text).toContain("Getting Started");
  });

  it("lists all developer guides with slugs", () => {
    expect(LAW_API_DEVELOPER_GUIDES.length).toBeGreaterThanOrEqual(10);
    expect(LAW_API_DEVELOPER_GUIDES.some((guide) => guide.slug === "changelog")).toBe(
      true,
    );
  });
});

describe("Law API documentation downloads", () => {
  it("defines OpenAPI and collection download links", () => {
    const hrefs = LAW_API_DOC_DOWNLOADS.map((item) => item.href);
    expect(hrefs).toContain("/api/law/v1/openapi.yaml");
    expect(hrefs).toContain("/api/law/v1/openapi.json");
    expect(hrefs).toContain(
      "/specs/collections/LAW-OpenAPI-v1.postman_collection.json",
    );
  });

  it("includes generated Postman collection in public assets", () => {
    const collectionPath = path.resolve(
      process.cwd(),
      "apps/web/public/specs/collections/LAW-OpenAPI-v1.postman_collection.json",
    );
    const altPath = path.resolve(
      process.cwd(),
      "public/specs/collections/LAW-OpenAPI-v1.postman_collection.json",
    );
    expect(fs.existsSync(collectionPath) || fs.existsSync(altPath)).toBe(true);
  });

  it("includes generated Bruno collection in public assets", () => {
    const brunoPath = path.resolve(
      process.cwd(),
      "apps/web/public/specs/collections/bruno/LAW-OpenAPI-v1/bruno.json",
    );
    const altPath = path.resolve(
      process.cwd(),
      "public/specs/collections/bruno/LAW-OpenAPI-v1/bruno.json",
    );
    expect(fs.existsSync(brunoPath) || fs.existsSync(altPath)).toBe(true);
  });
});
