import Link from "next/link";
import type { Entry } from "@/lib/content";

export default function PostList({ entries, base }: { entries: Entry[]; base: string }) {
  return (
    <ul className="posts">
      {entries.map((e) => (
        <li key={e.slug}>
          <time dateTime={e.date}>{e.date.slice(5).replace("-", "/")}</time>
          <div>
            <Link href={`${base}/${e.slug}/`}>{e.title}</Link>
            {e.draft && <span className="draft">草稿</span>}
            {e.description && e.description !== e.title && <p>{e.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
