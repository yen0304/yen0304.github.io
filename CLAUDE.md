# Yen 的個人網站

Next.js（App Router，`output: "export"` 靜態輸出），推到 `main` 後由 GitHub Actions 部署到 GitHub Pages：https://yen0304.github.io

## 幫我寫文章時

- 新文章放在 `content/posts/<slug>.md`。slug 用英文小寫加連字號，例如 `coconut-reading-notes`，它就是網址 `/blog/<slug>/`。
  也可以跑 `npm run new -- "標題" slug` 產生檔案。
- Frontmatter 格式（欄位都要有）：

  ```yaml
  ---
  title: "文章標題"
  description: "一兩句摘要，會顯示在列表和分享預覽"
  date: "YYYY-MM-DD"   # 台灣時間
  tags: ["LLM", "latent reasoning"]
  draft: true          # 我確認過再改成 false 才會上線
  ---
  ```

- 新寫的文章一律先設 `draft: true`，除非我說要直接發布。
- 內文用 GitHub 風格 Markdown：支援表格、`$行內數學$`、`$$獨立數學式$$`（KaTeX）、程式碼區塊（記得標語言，例如 ```python）。
- 不要在內文開頭再寫一個 `# 標題`，頁面會自動顯示 frontmatter 的 title。章節從 `##` 開始。
- 圖片放 `public/posts/<slug>/`，用 `![說明](/posts/<slug>/檔名.png)` 引用。
- 用繁體中文（台灣用語）寫，技術名詞保留英文原文。語氣是我自己的研究筆記：直接、具體，避免行銷腔和空泛的開場白。
- 引用論文或數據時附上連結；不確定的事實要標出來讓我查，不要編造。

## 其他內容

- 作品清單：`lib/site.ts` 的 `projects` 陣列。
- 關於頁：`app/about/page.tsx`；首頁自我介紹：`app/page.tsx`。
- `content/archive/` 是 2021–2022 從舊 Hugo 網站轉回來的筆記，保持原樣不要改寫。舊網址 `/p/...` 的轉址由 `scripts/postbuild.mjs` 產生。

## 指令

- `npm run dev`：本機預覽（會顯示草稿）
- `npm run build`：產生 `out/`，送 PR 前跑一次確認沒有錯
