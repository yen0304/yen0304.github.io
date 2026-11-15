import type { Metadata } from "next";
import { projects } from "@/lib/site";

export const metadata: Metadata = { title: "作品" };

export default function Projects() {
  return (
    <section className="page">
      <h1>作品</h1>
      <p className="intro">大多是在研究和日常開發時，覺得「應該要有這個工具」就動手做的東西。</p>
      <ul className="projects full">
        {projects.map((p) => (
          <li key={p.name}>
            <a href={p.repo} className="pname">{p.name}</a>
            <span className="stack">{p.stack}</span>
            <p>{p.summary}</p>
            <p className="plinks">
              <a href={p.repo}>原始碼</a>
              {p.links?.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
