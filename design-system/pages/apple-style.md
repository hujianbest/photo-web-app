# Apple 官网风格 — 页面级覆盖

> 覆盖 MASTER，全站采用苹果官网式极简风格。

## 设计来源 (ui-ux-pro-max)

- **Pattern**: Minimal Single Column + Exaggerated Minimalism
- **关键词**: Bold minimalism, oversized typography, high contrast, negative space, black/white, single accent
- **色彩**: #000000, #FFFFFF, 单一强调色（如蓝 #0071E3）
- **字体**: 大标题 clamp 或 4rem+，font-weight 600–700，letter-spacing -0.02em ~ -0.05em
- **留白**: 大量留白，padding 4rem–8rem，单栏居中
- **避免**: 花哨装饰、过多样式、快速动画

---

## 色彩（Apple-like）

| 角色 | Hex | Tailwind/用法 |
|------|-----|----------------|
| 背景 | #FFFFFF / #FBFBFD | bg-white, bg-neutral-50 |
| 正文 | #1D1D1F | text-neutral-900 |
| 次要文 | #6E6E73 | text-neutral-500 |
| 链接/CTA | #0071E3 | text-blue-600, bg-blue-600 |
| 边框 | #D2D2D7 | border-neutral-200 |

---

## 字体与排版

- **标题**: 大号、字重 600–700、letter-spacing: -0.025em（tracking-tight）
- **正文**: 17–19px，line-height 1.47，色 #1D1D1F
- **系统字体**: 优先 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui

---

## 组件

- **导航**: 背景白或极浅灰，字小（14–17px），hover 透明度或下划线，无粗边框
- **按钮主**: 蓝 #0071E3，圆角大（rounded-full 或 rounded-xl），padding 宽松
- **卡片**: 白底、极浅阴影或仅边框，大量内边距，hover 极 subtle
- **Footer**: 深灰底 #F5F5F7 或 #1D1D1F，小字，链接一行或简洁分组

---

## 反模式

- 不用多种强调色（仅一种蓝）
- 不用大块彩色背景（保持白/浅灰）
- 不用过重阴影或花哨圆角
