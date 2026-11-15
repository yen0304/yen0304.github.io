import Link from "next/link";
import type { Entry } from "@/lib/content";
import { render } from "@/lib/markdown";

export default async function Article({ entry, notice }: { entry: Entry; notice?: React.ReactNode }) {
  const html = await render(entry.body);
  return (
    <article className="article">
      <header>
        <h1>{entry.title}</h1>
        <p className="meta">
          <time dateTime={entry.date}>{entry.date}</time>
          <span>約 {entry.readingMinutes} 分鐘</span>
          {entry.draft && <span className="draft">草稿，正式網站不會顯示</span>}
        </p>
        {entry.tags.length > 0 && (
          <ul className="tags">
            {entry.tags.map((t) => (
              <li key={t}>
                <Link href={`/tags/${encodeURIComponent(t)}/`}>#{t}</Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      {notice}
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
