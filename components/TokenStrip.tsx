// 首頁主視覺：一句話裡有幾個 token 被換成「連續思考」的向量格子，
// 致敬 Coconut 這類 latent reasoning 方法——推理發生在看不見的隱藏狀態裡。
const before = ["我", "研究", "語言模型"];
const after = ["怎麼", "想事情"];
const LATENT = 4;
const DIMS = 8;

function cell(i: number, j: number) {
  // 決定性的假 activation 值，讓每次 build 長得一樣
  const v = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export default function TokenStrip() {
  return (
    <p className="tokens" aria-label="我研究語言模型在看不見的隱藏狀態裡怎麼想事情">
      {before.map((t) => (
        <span className="tok" key={t} aria-hidden>{t}</span>
      ))}
      <span className="tok tok-mark" aria-hidden>⟨bot⟩</span>
      {Array.from({ length: LATENT }, (_, i) => (
        <span className="tok tok-latent" key={i} aria-hidden style={{ ["--i" as string]: i }}>
          {Array.from({ length: DIMS }, (_, j) => (
            <i key={j} style={{ opacity: 0.15 + cell(i, j) * 0.85 }} />
          ))}
        </span>
      ))}
      <span className="tok tok-mark" aria-hidden>⟨eot⟩</span>
      {after.map((t) => (
        <span className="tok" key={t} aria-hidden>{t}</span>
      ))}
    </p>
  );
}
