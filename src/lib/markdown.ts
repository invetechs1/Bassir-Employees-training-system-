/**
 * Tiny, dependency-free, safe Markdown → HTML renderer for lesson bodies.
 *
 * We deliberately avoid a full Markdown library: lesson content is authored by
 * tenant admins (semi-trusted) and seeded by us, so the priority is that the
 * output can NEVER inject scripts. The approach is: escape ALL HTML first, then
 * layer a small, fixed set of formatting rules on top of the escaped text.
 *
 * Supported: headings (##, ###), unordered lists (-, *), ordered lists (1.),
 * bold (**x**), italic (*x* / _x_), inline code (`x`), links [text](https://…),
 * horizontal rules (---) and paragraphs. Everything else renders as plain text.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Inline formatting runs on already-escaped text.
function inline(escaped: string): string {
  let s = escaped;
  // Links: only http(s) and mailto, on already-escaped text (so "(" etc. are literal).
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    (_m, text, href) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-brand-700 underline">${text}</a>`
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/_([^_\n]+)_/g, "<em>$1</em>");
  s = s.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-[0.85em]">$1</code>');
  return s;
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md.replace(/\r\n/g, "\n")).split("\n");
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flushPara();
      closeList();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\s*(#{2,4})\s+(.*)$/))) {
      flushPara();
      closeList();
      const level = m[1].length; // 2..4
      out.push(`<h${level} class="font-semibold text-slate-900">${inline(m[2])}</h${level}>`);
    } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push('<hr class="my-4 border-slate-200" />');
    } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      flushPara();
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        out.push('<ul class="list-disc space-y-1 ps-6">');
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      flushPara();
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        out.push('<ol class="list-decimal space-y-1 ps-6">');
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      para.push(line.trim());
    }
  }
  flushPara();
  closeList();
  return out.join("\n");
}
