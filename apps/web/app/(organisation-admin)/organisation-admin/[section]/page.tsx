import { notFound } from "next/navigation";

/**
 * Catch-all for unknown Organisation Admin sections.
 * Implemented Block 1–3 routes use dedicated pages.
 */
export default async function OrganisationAdminSectionPage({
  params,
}: {
  readonly params: Promise<{ readonly section: string }>;
}) {
  await params;
  notFound();
}
