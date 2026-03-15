# 摄影师服务平台 - 整体开发完成实施计划

> **For Claude:** 实施本计划时请按任务逐项执行，并在阶段节点进行验证与代码审查。

**目标：** 在现有约 85% 完成度基础上，补齐前端页面、修复失败用例与已知 Bug、完成核心第三方集成，使平台达到可 Beta 上线状态。

**架构：** 后端 NestJS API 与实体已基本就绪，重点为前端页面补全、支付/地图/通知等集成、测试与 Bug 修复。采用「先修测试与 Bug → 再补前端 → 再集成第三方 → 最后加固与部署」的分阶段策略。

**技术栈：** Next.js 14 (App Router)、NestJS、PostgreSQL、Redis、TailwindCSS v4、TypeScript；集成目标：支付宝/微信支付 SDK、地图 API（如高德/腾讯）、可选 WebSocket（Socket.io）。

---

## 当前进度与缺口摘要

| 维度           | 状态   | 待办摘要 |
|----------------|--------|----------|
| 后端模块       | 基本完成 | 支付/订单流程、图片交付、退款需完善 |
| 前端页面       | ~70%  | 约拍页、订单页、个人中心、文章列表/详情未完成 |
| 测试通过率     | 90%   | 8 个失败用例（支付、地图、WebSocket、AI 等） |
| 第三方集成     | 未集成 | 支付、地图、实时通知、富文本、可选 AI |

---

## Phase 1：测试与已知 Bug 修复（优先）

目标：单元/集成/接口测试通过率提升至 95%+，解决高优先级已知 Bug。

### Task 1.1：修复单元测试中的 2 个失败用例

**涉及文件：**
- 查看：`services/api/test/` 或各模块 `*.spec.ts`
- 修改：根据 `npm run test` 输出定位的具体 spec 文件

**步骤：**
1. 在 `services/api` 执行 `npm run test`，记录失败用例及错误信息。
2. 针对每个失败用例：若为环境/ mock 问题则修正 test 配置或 mock；若为实现错误则修正对应 service/controller。
3. 再次执行 `npm run test`，确认全部通过。
4. 提交：`fix(api): resolve failing unit tests`。

---

### Task 1.2：修复集成测试中的 6 个失败用例

**涉及文件：**
- 查看：`services/api/test/` 下 e2e 或集成测试
- 修改：测试文件或被测模块（如 bookings、orders、notifications）

**步骤：**
1. 执行 `npm run test:e2e`（或项目内集成测试命令），记录失败列表。
2. 逐项分析：数据库状态、依赖服务（Redis 等）、断言与实际行为差异。
3. 修正测试数据、超时、或后端逻辑，使集成测试通过。
4. 提交：`fix(api): resolve failing integration tests`。

---

### Task 1.3：修复高优先级已知 Bug（API 错误、大文件超时、Token 过期）

**涉及文件：**
- 修改：`services/api/src/main.ts`（全局异常/超时）、`services/api/src/modules/auth/`（Token 刷新）、`services/api/src/modules/upload/`（大文件）
- 可选：`apps/web/src` 下请求封装（Token 过期后的重试/跳转登录）

**步骤：**
1. **数据库未连接时的 API 错误**：在健康检查或数据库模块中增加友好错误响应，避免 500 暴露内部信息。
2. **大文件上传超时**：在 upload 接口或全局增加 body 大小与超时配置（如 `bodyParser`、Nest 的 timeout）。
3. **Token 过期后无法正常操作**：前端在 401 时清除本地 Token 并跳转登录；后端保证 401 响应一致。
4. 提交：`fix: resolve high-priority bugs (db error, upload timeout, token expiry)`。

---

### Task 1.4：修复中优先级已知 Bug（刷新状态丢失、空指针、图片占位）

**涉及文件：**
- 修改：`apps/web/src` 下状态管理或持久化（如 localStorage/sessionStorage）、作品/列表组件、图片组件

**步骤：**
1. **页面刷新后状态丢失**：对需要持久化的状态（如登录态、主题）使用 cookie/localStorage 或服务端 session，并在 layout 或 provider 中恢复。
2. **边界条件空指针**：在列表/详情接口与前端组件中对空数组、空对象做防护（可选类型与默认值）。
3. **图片加载失败占位图**：在通用图片组件中 onError 时显示占位图或默认 avatar。
4. 提交：`fix(web): state persistence, null safety, image placeholder`。

---

## Phase 2：前端页面补全

目标：补齐约拍、订单、个人中心、经验分享（文章）等主要页面，使前端完成度达到 90%+。

### Task 2.1：约拍列表与详情页

**涉及文件：**
- 新增：`apps/web/src/app/bookings/page.tsx`（列表）、`apps/web/src/app/bookings/[id]/page.tsx`（详情）
- 复用/新增：`apps/web/src/components/` 下卡片、列表、按钮等
- 参考：`apps/web/src/app/works/page.tsx`、`apps/web/src/app/spots/page.tsx` 的数据拉取与 UI 模式

**步骤：**
1. 在 `apps/web` 中确认 bookings API 的调用方式（如 `fetch('/api/v1/bookings')` 或现有 api 封装）。
2. 实现约拍列表页：筛选（状态、类型）、分页、卡片展示（标题、状态、时间、发布者）。
3. 实现约拍详情页：展示详情、操作按钮（接受/拒绝/取消，按角色与状态显隐）。
4. 在导航中增加「约拍」入口（若存在 `components/Nav` 或 layout 中的 nav）。
5. 提交：`feat(web): add bookings list and detail pages`。

---

### Task 2.2：订单列表与详情页

**涉及文件：**
- 新增：`apps/web/src/app/orders/page.tsx`、`apps/web/src/app/orders/[id]/page.tsx`
- 复用：列表与详情布局组件

**步骤：**
1. 对接订单列表与详情 API（如 `GET /api/v1/orders`、`GET /api/v1/orders/:id`）。
2. 实现订单列表：状态筛选、分页、订单卡片（订单号、状态、金额、时间）。
3. 实现订单详情：订单信息、时间线、操作（支付、确认完成、申请退款等），与后端订单状态机一致。
4. 导航中增加「我的订单」入口（可放在个人中心或主导航）。
5. 提交：`feat(web): add orders list and detail pages`。

---

### Task 2.3：个人中心（资料、作品、约拍、订单入口）

**涉及文件：**
- 新增：`apps/web/src/app/profile/page.tsx` 或 `apps/web/src/app/user/center/page.tsx`
- 可选：`apps/web/src/app/profile/edit/page.tsx`（资料编辑）

**步骤：**
1. 实现个人中心骨架：头像、昵称、简介、统计（作品数、约拍数、订单数），数据来自用户信息 API 或聚合接口。
2. 增加入口：我的作品、我的约拍、我的订单、账号设置（可先链到占位或简单表单）。
3. 若已有用户更新接口，实现资料编辑页（昵称、头像、简介等）。
4. 在导航或用户菜单中增加「个人中心」入口。
5. 提交：`feat(web): add profile/center and profile edit`。

---

### Task 2.4：经验分享（文章列表与详情）

**涉及文件：**
- 新增：`apps/web/src/app/articles/page.tsx`、`apps/web/src/app/articles/[id]/page.tsx`
- 参考：`services/api/src/modules/articles/` 的 API 设计

**步骤：**
1. 对接文章列表与详情 API（如 `GET /api/v1/articles`、`GET /api/v1/articles/:id`）。
2. 实现文章列表：分类、搜索、分页、卡片（标题、摘要、封面、作者、时间）。
3. 实现文章详情：标题、正文（若暂无富文本可先渲染纯文本或简单 HTML）、作者、时间、点赞/评论（若 API 已支持）。
4. 导航中增加「经验分享」或「文章」入口。
5. 提交：`feat(web): add articles list and detail pages`。

---

### Task 2.5：前端响应式与移动端基础适配

**涉及文件：**
- 修改：`apps/web/src/app/**/page.tsx`、`apps/web/src/components/**`、`tailwind.config.*` 或全局 CSS

**步骤：**
1. 对主要列表页（作品、打卡点、约拍、订单、文章）使用 Tailwind 响应式类（如 `md:grid-cols-2`、`max-w-screen-lg`），保证平板与桌面下布局合理。
2. 对导航、头部、底部进行移动端折叠或抽屉式菜单，保证 375px 宽度下可用。
3. 对表单与按钮做触摸友好尺寸与间距。
4. 提交：`style(web): improve responsive and mobile layout`。

---

## Phase 3：核心第三方集成

目标：支付可下单与回调、地图可展示打卡点、可选实时通知，支撑核心业务流程。

### Task 3.1：支付集成（支付宝/微信支付占位或沙箱）

**涉及文件：**
- 新增/修改：`services/api/src/modules/orders/`（支付创建、回调）、`services/api/src/modules/payments/`（若独立支付模块）
- 配置：`.env` 中支付相关 key（不提交敏感信息）

**步骤：**
1. 选定支付方式（如支付宝沙箱 + 微信支付开发环境），在 Nest 中新增支付模块或订单模块内支付方法。
2. 实现：创建订单后生成支付参数（或支付链接）、前端跳转支付；支付回调接口验签并更新订单状态。
3. 前端订单详情页增加「去支付」按钮，根据后端返回的支付参数调起支付或跳转。
4. 编写支付相关单测或集成测试（可 mock 支付网关），保证通过。
5. 提交：`feat(api): integrate payment (alipay/wechat) and order callback`。

---

### Task 3.2：地图 API 集成（打卡点展示与选点）

**涉及文件：**
- 修改/新增：`apps/web/src/app/spots/page.tsx` 或 `apps/web/src/components/Map.tsx`
- 配置：`apps/web/.env.local` 中地图 API key（如 `NEXT_PUBLIC_MAP_KEY`）

**步骤：**
1. 选用地图 SDK（如高德/腾讯地图 JS API），在 Next 中按官方文档引入（避免 SSR 报错）。
2. 在打卡点列表或详情页嵌入地图组件，展示打卡点位置；支持点击标记查看简要信息。
3. 若有「发布打卡点」或「选点」流程，增加地图选点（选坐标回填表单）。
4. 文档中说明如何配置 API key，并确保 key 不提交到仓库。
5. 提交：`feat(web): integrate map for spots display and picker`。

---

### Task 3.3：实时通知（WebSocket 可选）

**涉及文件：**
- 新增：`services/api/src/modules/notifications/gateway/`（如使用 Socket.io 或 Nest WS Gateway）
- 修改：`services/api/src/app.module.ts`、`services/api/src/main.ts`
- 修改：`apps/web/src` 下建立 WebSocket 客户端并订阅通知

**步骤：**
1. 在 Nest 中实现 WebSocket Gateway，鉴权后允许客户端订阅「当前用户」的通知通道。
2. 在创建通知的业务逻辑中（如订单状态变更、约拍状态变更）向对应用户推送 WS 消息。
3. 前端在登录后建立 WS 连接，收到新通知时更新未读数或弹出提示。
4. 若时间紧张，可将此任务标为「可选」，先保证轮询未读数的接口可用。
5. 提交：`feat(api): add WebSocket notification push; feat(web): subscribe notifications via WS`。

---

## Phase 4：增强与收尾

目标：富文本编辑、图片压缩、安全与部署配置，达到可交付 Beta 状态。

### Task 4.1：经验分享富文本编辑

**涉及文件：**
- 新增/修改：`apps/web/src/app/articles/new/page.tsx` 或 `apps/web/src/app/articles/edit/[id]/page.tsx`
- 新增：`apps/web/src/components/richtext-editor.tsx`（封装第三方编辑器）

**步骤：**
1. 选用富文本组件（如 TipTap、Quill、Slate），在文章创建/编辑页集成，输出 HTML 或 Markdown 存到后端。
2. 文章详情页安全渲染富文本（防 XSS），若后端存 HTML 则使用受控的 HTML 渲染方式。
3. 提交：`feat(web): add rich text editor for articles`。

---

### Task 4.2：上传前/后端图片压缩（可选 sharp）

**涉及文件：**
- 修改：`services/api/src/modules/upload/upload.service.ts` 或上传中间件
- 依赖：在 `services/api` 中增加 `sharp`，用于服务端缩略图或压缩

**步骤：**
1. 服务端：在上传完成后对图片生成缩略图或限制最大边长/质量，减少列表页加载体积。
2. 前端（可选）：大图在上传前用 canvas 或库做压缩再上传，降低超时概率。
3. 为上传与压缩逻辑补充单测或集成测试。
4. 提交：`feat(api): image resize/compress with sharp; fix(web): optional client-side compress`。

---

### Task 4.3：安全与生产配置检查

**涉及文件：**
- 修改：`services/api/src/main.ts`、Nginx 或部署配置、`apps/web/next.config.*`
- 文档：`docs/` 下部署与安全清单

**步骤：**
1. 确认生产环境使用 HTTPS；若由反向代理提供，在文档中说明并关闭开发时的 HTTP 降级。
2. 检查 CORS、JWT 过期时间、敏感环境变量不落库不打印。
3. 为生产构建与启动编写简短部署清单（环境变量、数据库迁移、静态资源）。
4. 提交：`chore: production and security checklist`。

---

### Task 4.4：CI 与自动化测试（可选）

**涉及文件：**
- 新增/修改：`.github/workflows/*.yml` 或 `.gitlab-ci.yml`、`services/api/package.json`、`apps/web/package.json`

**步骤：**
1. 在 CI 中增加：安装依赖、lint、类型检查、单元测试；可选 e2e（需数据库等服务）。
2. 主分支或 PR 触发，确保合并前测试通过。
3. 提交：`ci: add lint, typecheck, and test pipeline`。

---

## 执行与验收

- **Phase 1 验收**：在 `services/api` 运行 `npm run test` 与 `npm run test:e2e`，通过率 ≥95%；高优先级 Bug 已修复。
- **Phase 2 验收**：所有主要业务入口（约拍、订单、个人中心、文章）可访问且与后端 API 联调通过。
- **Phase 3 验收**：支付流程（至少沙箱）可走通；地图可展示打卡点；若实现 WebSocket，通知可实时收到。
- **Phase 4 验收**：富文本与图片压缩按需可用；部署清单与 CI 可复现。

---

## 计划元信息

- **保存路径**：`docs/plans/2026-03-15-overall-completion-plan.md`
- **创建日期**：2026-03-15
- **依赖文档**：`docs/plans/development-summary.md`、`docs/plans/test-report.md`、`CLAUDE.md`

---

**计划已保存。两种执行方式可选：**

1. **本会话内子代理驱动**：按任务拆分子代理执行，每完成若干任务做一次代码审查与验证。  
2. **新会话中按计划执行**：在新会话中使用 executing-plans，按 Phase 分批执行并在阶段节点做检查点。

你更倾向哪种方式？若需要，我可以先把 Phase 1 的失败用例具体定位（跑一遍测试并列出文件与错误信息）。
