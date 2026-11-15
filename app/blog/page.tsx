import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { byYear, list } from "@/lib/content";

export const metadata: Metadata = { title: "文章" };

export default function Blog() {
  const groups = byYear(list("posts"));
  return (
    <section className="page">
      <h1>文章</h1>
      <p className="intro">研究筆記、論文閱讀、做工具的過程。</p>
      {groups.length === 0 && <p className="empty">還沒有文章。</p>}
      {groups.map(([year, entries]) => (
        <div className="year" key={year}>
          <h2>{year}</h2>
          <PostList entries={entries} base="/blog" />
        </div>
      ))}
    </section>
  );
}
