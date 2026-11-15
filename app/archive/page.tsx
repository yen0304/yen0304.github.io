import type { Metadata } from "next";
import PostList from "@/components/PostList";
import { byYear, list } from "@/lib/content";

export const metadata: Metadata = { title: "舊文封存" };

export default function Archive() {
  const groups = byYear(list("archive"));
  return (
    <section className="page">
      <h1>舊文封存</h1>
      <p className="intro">
        2021 到 2022 年當後端工程師時寫的學習筆記：Spring Boot、Spring Security、Docker、SQL、Git。內容保留原樣沒有更新，部分觀念（特別是 Spring Security 那幾篇）現在看來不太正確，參考時請斟酌。</p>
      {groups.map(([year, entries]) => (
        <div className="year" key={year}>
          <h2>{year}</h2>
          <PostList entries={entries} base="/archive" />
        </div>
      ))}
    </section>
  );
}
