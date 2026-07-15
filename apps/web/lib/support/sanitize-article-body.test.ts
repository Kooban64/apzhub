import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  renderableArticleBody,
  stripHtmlToText,
} from "./sanitize-article-body";

describe("sanitize-article-body", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)"> & '"'`)).toContain("&lt;");
    expect(escapeHtml(`<b>`)).not.toContain("<b>");
  });

  it("strips tags and scripts for HTML bodies", () => {
    const text = stripHtmlToText(
      `<p>Hello <strong>world</strong></p><script>alert(1)</script><style>.x{}</style>`,
    );
    expect(text).toContain("Hello");
    expect(text).toContain("world");
    expect(text.toLowerCase()).not.toContain("script");
    expect(text).not.toContain("<");
  });

  it("returns text kind for plain and html formats", () => {
    expect(renderableArticleBody("plain text", "text/plain")).toEqual({
      kind: "text",
      text: "plain text",
    });
    expect(renderableArticleBody("<em>Hi</em>", "text/html")).toEqual({
      kind: "text",
      text: "Hi",
    });
  });
});
