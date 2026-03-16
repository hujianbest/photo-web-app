# 摄影师服务平台 — 设计系统 (Master)

> **当前风格**: 苹果官网式极简（见 `design-system/pages/apple-style.md`）

**产品类型**: 摄影/创意服务平台  
**风格**: Apple-like — 极简、大标题、留白、黑白灰 + 单一蓝色强调  
**技术栈**: Next.js + Tailwind CSS

---

## 色彩（Apple 风格）

| 角色 | Hex | Tailwind | 用途 |
|------|-----|----------|------|
| 背景 | #FFFFFF / #FBFBFD | white, neutral-50 | 页面、卡片 |
| 正文 | #1D1D1F | neutral-900 | 标题、正文 |
| 次要文 | #6E6E73 | neutral-500 | 描述、辅助 |
| 链接/CTA | #0071E3 | blue-600 | 主按钮、链接、强调 |
| 边框 | #D2D2D7 | neutral-200 | 边框、分割 |

---

## 字体

- **系统字体栈**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
- **标题**: 字重 600、tracking-tight（-0.025em）、大号（4xl–6xl）
- **正文**: 17–19px，line-height 1.47

---

## 圆角与阴影

- 主按钮: `rounded-full`（药丸形）
- 卡片/输入: `rounded-xl` 或 `rounded-2xl`，阴影极轻或仅边框

---

## 图标与交互

- **图标**: 仅 SVG（Lucide React），禁止 emoji
- **可点击**: `cursor-pointer`，悬停 `text-blue-600` 或 `hover:bg-neutral-100`
- **过渡**: 150–200ms，避免 scale 导致布局抖动
- **触摸**: 最小 44px 触控区

---

## 反模式

- 不用多种强调色（仅一种蓝）
- 不用大块彩色背景
- 不用 emoji 当图标；不缺失 cursor-pointer

---

## 无障碍

- 图片必有 alt；表单有 label；焦点可见；对比度 ≥ 4.5:1
