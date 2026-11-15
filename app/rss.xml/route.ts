import { list } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = list("posts")
    .slice(0, 30)
    .map((e) => {
      const url = `${site.url}/blog/${e.slug}/`;
      return `<item><title>${esc(e.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(e.date).toUTCString()}</pubDate><description>${esc(e.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.title)}</title><link>${site.url}</link><description>${esc(site.description)}</description><language>zh-TW</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
