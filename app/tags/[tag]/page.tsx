import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { list } from "@/lib/content";

type P = { params: Promise<{ tag: string }> };
const entries = () => [...list("posts"), ...list("archive")];

export function generateStaticParams() {
  return [...new Set(entries().flatMap((e) => e.tags))].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return { title: `#${decodeURIComponent((await params).tag)}` };
}

export default async function Tag({ params }: P) {
  const tag = decodeURIComponent((await params).tag);
  const posts = list("posts").filter((e) => e.tags.includes(tag));
  const archive = list("archive").filter((e) => e.tags.includes(tag));
  return (
    <section className="page">
      <h1>#{tag}</h1>
      {posts.length > 0 && <PostList entries={posts} base="/blog" />}
      {archive.length > 0 && (
        <div className="year">
          <h2>舊文</h2>
          <PostList entries={archive} base="/archive" />
        </div>
      )}
    </section>
  );
}
