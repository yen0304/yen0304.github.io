import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s｜${site.title}` },
  description: site.description,
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: { siteName: site.title, locale: "zh_TW", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&family=Noto+Sans+TC:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body>
        <a className="skip" href="#main">跳到內容</a>
        <header className="site-header">
          <Link href="/" className="brand">顏承恩</Link>
          <nav aria-label="主選單">
            <Link href="/projects/">作品</Link>
            <Link href="/blog/">文章</Link>
            <Link href="/archive/">舊文</Link>
            <Link href="/about/">關於</Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <p>
            <a href={site.github}>GitHub</a>
            <a href={`mailto:${site.email}`}>Email</a>
            <a href="/rss.xml">RSS</a>
          </p>
          <p>© {new Date().getFullYear()} 顏承恩。文章採 CC BY-NC-ND 4.0 授權。</p>
        </footer>
      </body>
    </html>
  );
}
