import Link from "next/link";

import { LawApiSwaggerExplorer } from "@/components/law-api-docs/law-api-swagger-explorer";
import {
  LAW_API_DEVELOPER_GUIDES,
  LAW_API_DOC_DOWNLOADS,
  LAW_API_IMPLEMENTED_RESOURCES,
  LAW_API_OPENAPI_JSON_PATH,
  LAW_API_PLANNED_RESOURCES,
} from "@/lib/api/docs/law-api-docs-content";

/** Avoid static prerender of swagger-ui-react (client-only useContext). */
export const dynamic = "force-dynamic";

export default function LawApiDocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
            Law Platform API
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Developer Documentation
          </h1>
          <p className="max-w-3xl text-base text-zinc-600">
            Explore, test, and integrate with the tenant-scoped Law Platform REST API at{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
              /api/law/v1/
            </code>
            . All business resources are implemented; use the interactive explorer below
            with your session cookie and tenant header.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800">
              v1.0.0
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
              OpenAPI 3.1
            </span>
            <Link
              href={LAW_API_OPENAPI_JSON_PATH}
              className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 hover:bg-blue-100"
            >
              Download OpenAPI
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10">
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Authentication</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Sign in via the portal, then call APIs with your session cookie.
              Programmatic clients may use a bearer token. All entity endpoints require
              authentication and a valid tenant.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
              {`GET /api/law/v1/clients
Cookie: better-auth.session_token=...
x-tenant-id: t0000001-0000-4000-8000-000000000001
x-correlation-id: my-trace-id`}
            </pre>
            <Link
              href="/api/docs/guides/authentication"
              className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline"
            >
              Authentication guide →
            </Link>
          </article>

          <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Tenant header</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Every authenticated business API request must include{" "}
              <code className="rounded bg-zinc-100 px-1">x-tenant-id</code>. Data is
              scoped to the resolved tenant; cross-tenant access returns 403/404.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
              {`x-tenant-id: t0000001-0000-4000-8000-000000000001`}
            </pre>
            <Link
              href="/api/docs/guides/tenant-resolution"
              className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline"
            >
              Tenant resolution guide →
            </Link>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Implemented resources</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {LAW_API_IMPLEMENTED_RESOURCES.map((resource) => (
              <span
                key={resource}
                className="rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-800"
              >
                {resource}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-600">Planned (contract only):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LAW_API_PLANNED_RESOURCES.map((resource) => (
              <span
                key={resource}
                className="rounded-md bg-zinc-100 px-3 py-1 text-sm text-zinc-600"
              >
                {resource}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Downloads</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {LAW_API_DOC_DOWNLOADS.map((download) => (
              <li key={download.href}>
                <a
                  href={download.href}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-blue-300 hover:bg-blue-50"
                  download={download.href.endsWith(".json") ? true : undefined}
                >
                  <span className="font-medium text-blue-700">{download.label}</span>
                  <p className="mt-1 text-sm text-zinc-600">{download.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">API Explorer</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Try GET, POST, PATCH, and DELETE against live endpoints. Enable cookies
                in your browser and sign in first for authenticated calls.
              </p>
            </div>
          </div>
          <LawApiSwaggerExplorer specUrl="/api/law/v1/openapi.yaml" />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Developer guides</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LAW_API_DEVELOPER_GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/api/docs/guides/${guide.slug}`}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium">{guide.title}</span>
                  <p className="mt-1 text-sm text-zinc-600">{guide.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Pagination</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Cursor-based lists with <code className="text-xs">limit</code>,{" "}
              <code className="text-xs">cursor</code>, and{" "}
              <code className="text-xs">sort</code>.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Errors</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Standard <code className="text-xs">{`{ ok: false, error, meta }`}</code>{" "}
              envelope with documented codes.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Concurrency</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Use <code className="text-xs">ETag</code> /{" "}
              <code className="text-xs">If-Match</code> on PATCH and DELETE.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
