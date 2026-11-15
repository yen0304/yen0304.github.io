import Link from "next/link";
import TokenStrip from "@/components/TokenStrip";
import PostList from "@/components/PostList";
import { list } from "@/lib/content";
import { projects, site } from "@/lib/site";

export default function Home() {
  const posts = list("posts").slice(0, 5);
  const archiveCount = list("archive").length;
  return (
    <>
      <section className="hero">
        <h1>顏承恩<span className="latin">Yen</span></h1>
        <TokenStrip />
        <p className="lede">
          在高雄念書、做研究。主題是大型語言模型的潛在推理：讓模型在隱藏狀態裡思考，而不是一個字一個字把推理寫出來。手邊只有一張消費級顯卡，所以也很在意怎麼用小資源做實驗。研究之外會寫一些給 AI agent 用的開發工具。</p>
        <p className="links">
          <a href={site.github}>GitHub</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </section>

      <section className="block">
        <h2>作品</h2>
        <ul className="projects">
          {projects.slice(0, 4).map((p) => (
            <li key={p.name}>
              <a href={p.repo} className="pname">{p.name}</a>
              <span className="stack">{p.stack}</span>
              <p>{p.summary}</p>
            </li>
          ))}
        </ul>
        <p className="more"><Link href="/projects/">全部作品</Link></p>
      </section>

      <section className="block">
        <h2>最近的文章</h2>
        {posts.length > 0 ? (
          <PostList entries={posts} base="/blog" />
        ) : (
          <p className="empty">新文章準備中。在 <code>content/posts</code> 放一個 .md 檔就會出現在這裡。</p>
        )}
        <p className="more">
          <Link href="/blog/">所有文章</Link>
          <Link href="/archive/">2021–2022 的後端筆記（{archiveCount} 篇）</Link>
        </p>
      </section>
    </>
  );
}
