export const site = {
  name: "顏承恩 Yen",
  title: "Yen 的筆記本",
  url: "https://yen0304.github.io",
  description: "研究大型語言模型的潛在推理（latent reasoning），順手做給 AI agent 用的開發工具。",
  email: "asce55123@gmail.com",
  github: "https://github.com/yen0304",
};

export type Project = {
  name: string;
  summary: string;
  stack: string;
  repo: string;
  links?: { label: string; href: string }[];
};

// 想加或改作品，直接編輯這個陣列
export const projects: Project[] = [
  {
    name: "pretok",
    summary: "在 tokenize 之前先把輸入翻成模型擅長的語言，讓任何文字 LLM 都能吃多國語言，不用改模型或 tokenizer。",
    stack: "Python",
    repo: "https://github.com/yen0304/pretok",
  },
  {
    name: "Agent-ROI",
    summary: "讀取 Claude Code、Codex、Copilot、Cursor 等工具的本機紀錄，按主題統計每件事燒了多少 token、值不值得。",
    stack: "Python · PyPI",
    repo: "https://github.com/Agent-ROI/agent-roi",
    links: [{ label: "PyPI", href: "https://pypi.org/project/agent-roi-tracker/" }],
  },
  {
    name: "xlex",
    summary: "給 AI agent 用的 Excel 命令列工具，讓 coding agent 能讀寫、排版、轉換 .xlsx 檔。",
    stack: "Rust",
    repo: "https://github.com/yen0304/xlex",
  },
  {
    name: "Skill Dock",
    summary: "VS Code / Cursor 擴充套件，跨專案瀏覽、建立、匯入 agent skills，支援多種 AI 助手格式。",
    stack: "TypeScript · VS Code",
    repo: "https://github.com/yen0304/Skill-Dock",
    links: [{ label: "Marketplace", href: "https://marketplace.visualstudio.com/items?itemName=skill-dock.skill-dock" }],
  },
  {
    name: "NestJS Starter Kit",
    summary: "NestJS + Prisma 的專案起手式，TypeScript strict、測試覆蓋率 100%、CI/CD 全套。",
    stack: "TypeScript · NestJS",
    repo: "https://github.com/yen0304/nestjs-starter-kit",
  },
];
