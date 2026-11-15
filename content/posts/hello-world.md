---
title: "範例：一篇研究筆記長這樣"
description: "示範這個網站支援的寫法：程式碼、數學式、表格、圖片。發布前請改寫或刪除。"
date: "2026-11-15"
tags: ["網站"]
draft: true
---

這是一篇範例草稿，`draft: true` 的文章只會在本機 `npm run dev` 看到，正式網站不會出現。

## 數學式

行內寫 $h_t = f(h_{t-1}, x_t)$，獨立一行用兩個錢字號：

$$
\operatorname{Attention}(Q,K,V) = \operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

## 程式碼

```python
import torch

def continuous_thought(model, h, steps=4):
    for _ in range(steps):
        h = model(inputs_embeds=h).last_hidden_state[:, -1:]
    return h
```

## 表格

| 方法 | 推理形式 | 需要 CoT 標註 |
| --- | --- | --- |
| CoT | 文字 | 是 |
| Coconut | 隱藏狀態 | 訓練初期需要 |

## 圖片

圖片放在 `public/posts/<文章檔名>/` 底下，用 `![說明](/posts/<文章檔名>/圖檔.png)` 引用。
