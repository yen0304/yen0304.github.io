import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "關於" };

export default function About() {
  return (
    <section className="page prose-page">
      <h1>關於</h1>
      <p>我是顏承恩，大家叫我 Yen，住在高雄。</p>
      <p>
        現在是學生，研究方向是大型語言模型的潛在推理（latent reasoning）：像 Coconut 那樣讓模型把中間的推理留在連續的隱藏狀態裡，而不是用文字一步步寫出來，並試著用因果介入的方式去理解、訓練這些看不見的思考。實驗都跑在一張消費級 GPU 上。</p>
      <p>
        在這之前當過幾年後端工程師，寫 Java Spring 和 Node.js，那段時間的筆記收在<a href="/archive/">舊文封存</a>。現在除了研究，也常做一些讓 AI coding agent 更好用的小工具，列在<a href="/projects/">作品</a>。</p>
      <p>
        想聯絡的話寄信到 <a href={`mailto:${site.email}`}>{site.email}</a>，或在 <a href={site.github}>GitHub</a> 找我。</p>
    </section>
  );
}
