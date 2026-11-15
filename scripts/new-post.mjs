// 用法：npm run new -- "文章標題" [slug]
import fs from "node:fs";
import path from "node:path";

const [title, slugArg] = process.argv.slice(2);
if (!title) {
  console.error('用法：npm run new -- "文章標題" [英文-slug]');
  process.exit(1);
}
const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
const base =
  slugArg ??
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const slug = base || `post-${date}`;
const file = path.join("content/posts", `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`已經有 ${file} 了`);
  process.exit(1);
}
fs.writeFileSync(
  file,
  `---
title: "${title.replace(/"/g, '\\"')}"
description: ""
date: "${date}"
tags: []
draft: true
---

`,
);
console.log(`建立了 ${file}（draft: true，寫完把它改成 false 才會上線）`);
