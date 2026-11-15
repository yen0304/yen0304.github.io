import Link from "next/link";
export default function NotFound() {
  return (
    <section className="page">
      <h1>找不到這一頁</h1>
      <p className="intro">網站在 2026 年改版過，舊網址可能已經搬家。可以從<Link href="/archive/">舊文封存</Link>或<Link href="/blog/">文章列表</Link>找找看。</p>
    </section>
  );
}
