/**
 * Escape HTML so highlight snippets are safe for text / controlled rendering.
 * Workbench renders these as plain text — never dangerouslySetInnerHTML.
 */
export function sanitiseHighlightHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip tags after escaping is not needed — convert common em/mark to plain. */
export function highlightToPlainText(input: string): string {
  const withoutTags = input.replace(/<\/?[^>]+>/g, "");
  return sanitiseHighlightHtml(withoutTags);
}
