// build 完之後：產生舊網址（Hugo 時代）的轉址頁，清掉占位頁。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const out = path.resolve("out");
const archiveDir = path.resolve("content/archive");

const redirects = {
  "/關於我/": "/about/",
  "/post/": "/archive/",
  "/archives/": "/archive/",
  "/categories/": "/archive/",
  "/tags/": "/archive/",
  "/search/": "/archive/",
  "/page/": "/archive/",
};
for (let i = 1; i <= 6; i++) {
  redirects[`/page/${i}/`] = "/archive/";
  redirects[`/post/page/${i}/`] = "/archive/";
}

for (const file of fs.readdirSync(archiveDir)) {
  const { data } = matter(fs.readFileSync(path.join(archiveDir, file), "utf8"));
  const slug = file.replace(/\.mdx?$/, "");
  if (data.legacyUrl) redirects[data.legacyUrl] = `/archive/${data.duplicateOf ?? slug}/`;
}

const page = (to) => `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8">
<title>頁面已搬家</title><link rel="canonical" href="${to}"><meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${to}"><script>location.replace(${JSON.stringify(to)})</script>
</head><body><p>這一頁搬到 <a href="${to}">${to}</a>。</p></body></html>`;

let n = 0;
for (const [from, to] of Object.entries(redirects)) {
  const target = path.join(out, from, "index.html");
  if (fs.existsSync(target)) continue; // 新網站已經有這一頁就不覆蓋
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, page(to));
  n++;
}

fs.rmSync(path.join(out, "blog", "_empty"), { recursive: true, force: true });
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log(`postbuild: 產生 ${n} 個舊網址轉址頁`);
