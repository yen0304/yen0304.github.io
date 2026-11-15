import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Article from "@/components/Article";
import { all, get } from "@/lib/content";

type P = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return all("archive").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const e = get("archive", (await params).slug);
  if (!e) return {};
  return {
    title: e.title,
    description: e.description,
    alternates: e.duplicateOf ? { canonical: `/archive/${e.duplicateOf}/` } : undefined,
  };
}

export default async function Page({ params }: P) {
  const e = get("archive", (await params).slug);
  if (!e) notFound();
  return (
    <Article
      entry={e}
      notice={
        <aside className="notice">
          這是 {e.date.slice(0, 4)} 年的舊筆記，保留原樣沒有更新。<Link href="/archive/">看其他舊文</Link>
          {e.duplicateOf && (
            <> · 這篇有<Link href={`/archive/${e.duplicateOf}/`}>較新的版本</Link></>
          )}
        </aside>
      }
    />
  );
}
