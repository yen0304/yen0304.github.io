import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Kind = "posts" | "archive";
export type Entry = {
  kind: Kind;
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  draft: boolean;
  hidden: boolean;
  legacyUrl?: string;
  duplicateOf?: string;
  body: string;
  readingMinutes: number;
};

const root = path.join(process.cwd(), "content");
const showDrafts = process.env.NODE_ENV !== "production";

function load(kind: Kind): Entry[] {
  const dir = path.join(root, kind);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const tags = [...new Set([...(data.tags ?? []), ...(data.categories ?? [])].map(String))];
      const chars = content.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, "").length;
      return {
        kind,
        slug: file.replace(/\.mdx?$/, ""),
        title: String(data.title ?? file),
        description: String(data.description ?? ""),
        date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
        tags,
        cover: data.cover || undefined,
        draft: Boolean(data.draft),
        hidden: Boolean(data.hidden),
        legacyUrl: data.legacyUrl,
        duplicateOf: data.duplicateOf,
        body: content,
        readingMinutes: Math.max(1, Math.round(chars / 400)),
      } satisfies Entry;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 會出現在列表上的文章（排除草稿與重複的舊文） */
export function list(kind: Kind) {
  return load(kind).filter((e) => !e.hidden && (showDrafts || !e.draft));
}

/** 所有要產生頁面的文章（重複的舊文也產生頁面，只是不列出） */
export function all(kind: Kind) {
  return load(kind).filter((e) => showDrafts || !e.draft);
}

export function get(kind: Kind, slug: string) {
  return all(kind).find((e) => e.slug === decodeURIComponent(slug));
}

export function byYear(entries: Entry[]) {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const y = e.date.slice(0, 4);
    map.set(y, [...(map.get(y) ?? []), e]);
  }
  return [...map.entries()];
}
