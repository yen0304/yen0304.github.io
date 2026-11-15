import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Article from "@/components/Article";
import { all, get } from "@/lib/content";

type P = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const s = all("posts").map((e) => ({ slug: e.slug }));
  return s.length ? s : [{ slug: "_empty" }];
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const e = get("posts", (await params).slug);
  if (!e) return {};
  return {
    title: e.title,
    description: e.description,
    openGraph: { type: "article", publishedTime: e.date, images: e.cover ? [e.cover] : undefined },
  };
}

export default async function Page({ params }: P) {
  const e = get("posts", (await params).slug);
  if (!e) notFound();
  return <Article entry={e} />;
}
