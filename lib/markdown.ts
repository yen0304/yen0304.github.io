import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { bundledLanguages } from "shiki";

const alias: Record<string, string> = { mssql: "sql", tsql: "sql", mysql: "sql", sh: "bash", shell: "bash", yml: "yaml", dockerfile: "docker" };

function normalizeFences(md: string) {
  return md.replace(/^(\s*)```([\w+#-]+)/gm, (_m, sp: string, lang: string) => {
    const l = alias[lang.toLowerCase()] ?? lang.toLowerCase();
    return `${sp}\`\`\`${l in bundledLanguages ? l : "plaintext"}`;
  });
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypePrettyCode, {
    theme: { light: "github-light", dark: "github-dark-dimmed" },
    keepBackground: false,
    defaultLang: { block: "plaintext" },
    onVisitHighlightedLine() {},
  } as any)
  .use(rehypeStringify);

export async function render(md: string) {
  return String(await processor.process(normalizeFences(md)));
}
