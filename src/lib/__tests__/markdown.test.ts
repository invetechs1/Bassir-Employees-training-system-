import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("escapes HTML to prevent script injection", () => {
    const html = renderMarkdown("Hello <script>alert(1)</script> world");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders headings, bold and lists", () => {
    const html = renderMarkdown("## Title\n\nSome **bold** text\n\n- one\n- two");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<ul");
    expect(html).toContain("<li>one</li>");
  });

  it("only linkifies http/https/mailto and adds rel=noopener", () => {
    const ok = renderMarkdown("See [ZATCA](https://zatca.gov.sa)");
    expect(ok).toContain('href="https://zatca.gov.sa"');
    expect(ok).toContain('rel="noopener noreferrer"');

    // A javascript: URL must NOT become a clickable link (stays inert text).
    const bad = renderMarkdown("[x](javascript:alert(1))");
    expect(bad).not.toContain("<a ");
    expect(bad).not.toContain('href="javascript');
  });

  it("renders Arabic content without breaking structure", () => {
    const html = renderMarkdown("## العنوان\n\nنص **غامق** هنا");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>غامق</strong>");
  });
});
