# 摄影师服务平台 - 测试计划

**版本**: 1.0
**日期**: 2026-03-21
**项目**: photo-web-app

---

## 📋 测试概述

### 测试目标
- 验证所有功能正常运行
- 确保前后端集成正确
- 保证数据安全性和完整性
- 验证用户体验符合设计规范

### 测试范围
- 前端 UI/UX 测试
- 后端 API 测试
- 数据库操作测试
- 安全性测试
- 性能测试

---

## 🧪 功能测试清单

### 一、用户认证模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| AUTH-001 | 用户注册 | 1. 访问 /auth/register<br>2. 填写用户名、邮箱、密码<br>3. 提交表单 | 注册成功，跳转到首页 | P0 |
| AUTH-002 | 用户登录 | 1. 访问 /auth/login<br>2. 输入正确的用户名和密码<br>3. 提交表单 | 登录成功，获取 JWT Token | P0 |
| AUTH-003 | 登录失败 | 1. 输入错误的密码<br>2. 提交表单 | 显示错误提示 | P0 |
| AUTH-004 | Token 验证 | 1. 携带有效 Token 访问受保护 API<br>2. 携带无效 Token 访问 | 有效 Token 返回数据，无效返回 401 | P0 |
| AUTH-005 | Token 刷新 | 1. 使用 refresh_token 刷新 access_token | 返回新的 access_token | P1 |
| AUTH-006 | 退出登录 | 1. 点击退出按钮 | 清除 Token，跳转到首页 | P0 |

### 二、作品模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| WORK-001 | 获取作品列表 | GET /api/v1/works | 返回作品列表，包含分页信息 | P0 |
| WORK-002 | 按分类筛选 | GET /api/v1/works?category=portrait | 返回人像分类的作品 | P0 |
| WORK-003 | 创建作品 | POST /api/v1/works<br>携带 title, description, images | 创建成功，返回作品详情 | P0 |
| WORK-004 | 获取作品详情 | GET /api/v1/works/:id | 返回作品完整信息 | P0 |
| WORK-005 | 点赞作品 | POST /api/v1/works/:id/like | 点赞成功，likes+1 | P0 |
| WORK-006 | 取消点赞 | DELETE /api/v1/works/:id/like | 取消成功，likes-1 | P0 |
| WORK-007 | 评论作品 | POST /api/v1/works/:id/comments | 评论成功 | P0 |
| WORK-008 | 删除作品 | DELETE /api/v1/works/:id | 删除成功（仅作者可删） | P1 |
| WORK-009 | 瀑布流展示 | 访问 /works 页面 | Pinterest 风格布局 | P0 |
| WORK-010 | 分类标签切换 | 点击分类标签 | 动态筛选作品 | P0 |

### 三、打卡点模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| SPOT-001 | 获取打卡点列表 | GET /api/v1/spots | 返回打卡点列表 | P0 |
| SPOT-002 | 创建打卡点 | POST /api/v1/spots<br>携带 name, location, description | 创建成功 | P0 |
| SPOT-003 | 获取打卡点详情 | GET /api/v1/spots/:id | 返回打卡点信息 | P0 |
| SPOT-004 | 打卡 | POST /api/v1/spots/:id/checkin | 打卡成功 | P0 |
| SPOT-005 | 打卡点评分 | POST /api/v1/spots/:id/rate | 评分成功，更新平均分 | P1 |
| SPOT-006 | 列表视图 | 访问 /spots 页面 | 显示打卡点卡片列表 | P0 |
| SPOT-007 | 地图视图 | 切换到地图视图 | 显示地图占位符（需 API Key） | P1 |
| SPOT-008 | 视图切换 | 点击列表/地图按钮 | 视图正常切换 | P0 |

### 四、约拍模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| BOOK-001 | 获取约拍列表 | GET /api/v1/bookings | 返回约拍列表 | P0 |
| BOOK-002 | 创建约拍请求 | POST /api/v1/bookings<br>携带 title, description, type, time | 创建成功 | P0 |
| BOOK-003 | 获取约拍详情 | GET /api/v1/bookings/:id | 返回约拍完整信息 | P0 |
| BOOK-004 | 接受约拍 | POST /api/v1/bookings/:id/accept | 状态变为 accepted | P0 |
| BOOK-005 | 拒绝约拍 | POST /api/v1/bookings/:id/reject | 状态变为 rejected | P0 |
| BOOK-006 | 取消约拍 | POST /api/v1/bookings/:id/cancel | 状态变为 cancelled | P0 |
| BOOK-007 | 互勉/付费筛选 | 选择类型筛选 | 显示对应类型约拍 | P1 |
| BOOK-008 | 约拍卡片展示 | 访问 /bookings 页面 | 显示丰富信息的卡片 | P0 |

### 五、订单模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| ORD-001 | 获取订单列表 | GET /api/v1/orders | 返回用户订单列表 | P0 |
| ORD-002 | 创建订单 | POST /api/v1/orders<br>携带 booking_id, amount | 创建成功，状态 pending | P0 |
| ORD-003 | 获取订单详情 | GET /api/v1/orders/:id | 返回订单信息 | P0 |
| ORD-004 | 支付订单 | POST /api/v1/orders/:id/pay | 状态变为 paid（沙箱） | P0 |
| ORD-005 | 取消订单 | POST /api/v1/orders/:id/cancel | 状态变为 cancelled | P0 |
| ORD-006 | 订单状态流转 | pending → paid → completed | 状态正确流转 | P0 |

### 六、文章模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| ART-001 | 获取文章列表 | GET /api/v1/articles | 返回文章列表 | P0 |
| ART-002 | 创建文章 | POST /api/v1/articles<br>携带 title, content, category | 创建成功 | P0 |
| ART-003 | 获取文章详情 | GET /api/v1/articles/:id | 返回文章完整内容 | P0 |
| ART-004 | 点赞文章 | POST /api/v1/articles/:id/like | 点赞成功 | P0 |
| ART-005 | 收藏文章 | POST /api/v1/articles/:id/favorite | 收藏成功 | P1 |
| ART-006 | 富文本编辑器 | 访问 /articles/new | TipTap 编辑器可用 | P0 |
| ART-007 | 文章分类筛选 | 选择分类 | 显示对应分类文章 | P1 |

### 七、通知模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| NOTIF-001 | 获取通知列表 | GET /api/v1/notifications | 返回通知列表 | P0 |
| NOTIF-002 | 标记已读 | PUT /api/v1/notifications/:id/read | 状态变为已读 | P0 |
| NOTIF-003 | 全部标记已读 | PUT /api/v1/notifications/read-all | 所有通知变为已读 | P0 |
| NOTIF-004 | 实时通知 | WebSocket 连接 | 实时接收新通知 | P1 |
| NOTIF-005 | 通知页面 | 访问 /notifications | 显示通知列表 | P0 |

### 八、关注模块 (P1)

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| FOLL-001 | 关注用户 | POST /api/v1/follow/:userId | 关注成功 | P0 |
| FOLL-002 | 取消关注 | DELETE /api/v1/follow/:userId | 取消成功 | P0 |
| FOLL-003 | 获取粉丝列表 | GET /api/v1/follow/followers | 返回粉丝列表 | P0 |
| FOLL-004 | 获取关注列表 | GET /api/v1/follow/following | 返回关注列表 | P0 |
| FOLL-005 | 关注状态检查 | GET /api/v1/follow/status/:userId | 返回是否关注 | P1 |
| FOLL-006 | 关注统计 | GET /api/v1/follow/stats/:userId | 返回粉丝/关注数 | P1 |

### 九、私信模块 (P1)

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| MSG-001 | 发送私信 | POST /api/v1/messages<br>携带 receiverId, content | 发送成功 | P0 |
| MSG-002 | 获取对话列表 | GET /api/v1/messages/conversations | 返回对话列表 | P0 |
| MSG-003 | 获取聊天记录 | GET /api/v1/messages/:userId | 返回聊天记录 | P0 |
| MSG-004 | 标记已读 | PUT /api/v1/messages/:id/read | 状态变为已读 | P0 |
| MSG-005 | 实时消息 | WebSocket 连接 | 实时接收消息 | P1 |

### 十、话题标签模块 (P1)

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| TAG-001 | 获取热门标签 | GET /api/v1/tags/popular | 返回热门标签 | P1 |
| TAG-002 | 获取标签下作品 | GET /api/v1/tags/:tag/works | 返回相关作品 | P1 |
| TAG-003 | 获取标签下文章 | GET /api/v1/tags/:tag/articles | 返回相关文章 | P1 |
| TAG-004 | 标签聚合页 | 访问 /tags/[tag] | 显示标签内容 | P1 |

### 十一、排行榜模块 (P1)

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| RANK-001 | 日榜 | GET /api/v1/rankings/daily | 返回日榜数据 | P1 |
| RANK-002 | 周榜 | GET /api/v1/rankings/weekly | 返回周榜数据 | P1 |
| RANK-003 | 月榜 | GET /api/v1/rankings/monthly | 返回月榜数据 | P1 |
| RANK-004 | 分类排行榜 | GET /api/v1/rankings/:category | 返回分类排行 | P2 |

### 十二、文件上传模块

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| UP-001 | 上传图片 | POST /api/v1/upload<br>携带 image 文件 | 返回图片 URL | P0 |
| UP-002 | 图片压缩 | 上传大图 | 自动压缩到 1920px | P1 |
| UP-003 | 生成缩略图 | 上传图片 | 自动生成 400px 缩略图 | P1 |
| UP-004 | 文件类型验证 | 上传非图片文件 | 返回错误 | P0 |
| UP-005 | 文件大小限制 | 上传超大文件 | 返回错误 | P0 |

### 十三、首页展示

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| HOME-001 | Hero 轮播 | 访问首页 | 显示作品轮播，自动切换 | P0 |
| HOME-002 | 统计数据 | 查看统计栏 | 显示作品/摄影师/打卡点/约拍数 | P0 |
| HOME-003 | 热门作品 | 查看热门作品区 | 显示 4 个热门作品 | P0 |
| HOME-004 | 热门打卡点 | 查看热门打卡点区 | 显示热门打卡点卡片 | P0 |
| HOME-005 | 社区动态 | 查看社区动态区 | 显示话题和最新动态 | P0 |

### 十四、个人中心

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| PROF-001 | 个人主页头部 | 访问 /profile | 显示封面、头像、统计 | P0 |
| PROF-002 | 标签页切换 | 点击作品/打卡/约拍/喜欢 | 正确切换内容 | P0 |
| PROF-003 | 编辑资料 | 点击编辑按钮 | 可修改个人信息 | P0 |
| PROF-004 | 作品列表 | 查看我的作品 | 显示用户发布的作品 | P0 |

### 十五、帮助中心

| ID | 测试项 | 测试步骤 | 预期结果 | 优先级 |
|----|--------|----------|----------|--------|
| HELP-001 | FAQ 页面 | 访问 /help/faq | 显示常见问题列表 | P1 |
| HELP-002 | 使用指南 | 访问 /help/guide | 显示分步指南 | P1 |
| HELP-003 | 联系我们 | 访问 /help/contact | 显示联系表单 | P1 |
| HELP-004 | 服务条款 | 访问 /help/terms | 显示服务条款 | P1 |

---

## 🔒 安全测试

| ID | 测试项 | 测试步骤 | 预期结果 |
|----|--------|----------|----------|
| SEC-001 | SQL 注入 | 在输入框输入 SQL 语句 | 不执行 SQL，返回错误 |
| SEC-002 | XSS 攻击 | 在输入框输入 JS 脚本 | 脚本不执行 |
| SEC-003 | CSRF 攻击 | 伪造跨站请求 | 请求被拒绝 |
| SEC-004 | 未授权访问 | 无 Token 访问受保护 API | 返回 401 |
| SEC-005 | 越权访问 | 访问其他用户的私有数据 | 返回 403 |
| SEC-006 | 密码加密 | 查看数据库密码字段 | 密码已加密存储 |
| SEC-007 | Token 过期 | 使用过期 Token | 返回 401 |
| SEC-008 | 请求限流 | 短时间大量请求 | 触发限流，返回 429 |

---

## ⚡ 性能测试

| ID | 测试项 | 目标值 | 测试方法 |
|----|--------|--------|----------|
| PERF-001 | 首页加载时间 | < 3s | Lighthouse |
| PERF-002 | API 响应时间 | < 200ms | 压测工具 |
| PERF-003 | 图片加载 | 懒加载 | 手动测试 |
| PERF-004 | 瀑布流滚动 | 流畅 60fps | 手动测试 |
| PERF-005 | 并发用户 | 100+ | 压测工具 |

---

## 📱 兼容性测试

| 平台 | 测试浏览器 | 测试项 |
|------|------------|--------|
| Desktop | Chrome, Firefox, Safari, Edge | 全功能测试 |
| Tablet | iPad Safari, Android Chrome | 响应式布局 |
| Mobile | iOS Safari, Android Chrome | 触摸操作、布局 |

---

## 🧪 测试环境

### 本地开发环境
- Node.js: v22.x
- PostgreSQL: 16
- Redis: 7.x
- 操作系统: WSL2 / Linux

### 测试数据
- 测试用户: testuser / 123456
- 测试管理员: admin / admin123

---

## 📊 测试进度追踪

| 模块 | 测试用例数 | 通过 | 失败 | 待测试 |
|------|------------|------|------|--------|
| 用户认证 | 6 | - | - | 6 |
| 作品模块 | 10 | - | - | 10 |
| 打卡点模块 | 8 | - | - | 8 |
| 约拍模块 | 8 | - | - | 8 |
| 订单模块 | 6 | - | - | 6 |
| 文章模块 | 7 | - | - | 7 |
| 通知模块 | 5 | - | - | 5 |
| 关注模块 | 6 | - | - | 6 |
| 私信模块 | 5 | - | - | 5 |
| 话题标签 | 4 | - | - | 4 |
| 排行榜 | 4 | - | - | 4 |
| 文件上传 | 5 | - | - | 5 |
| 首页展示 | 5 | - | - | 5 |
| 个人中心 | 4 | - | - | 4 |
| 帮助中心 | 4 | - | - | 4 |
| 安全测试 | 8 | - | - | 8 |
| **总计** | **95** | **0** | **0** | **95** |

---

## 📝 测试报告模板

```markdown
# 测试执行报告

**日期**: YYYY-MM-DD
**测试人员**: 
**环境**: 

## 测试摘要
- 总用例数: 
- 通过数: 
- 失败数: 
- 通过率: 

## 失败用例详情

| ID | 用例名称 | 失败原因 | 严重程度 |
|----|----------|----------|----------|
| | | | |

## 问题列表

| ID | 问题描述 | 严重程度 | 状态 |
|----|----------|----------|------|
| | | | |

## 建议

```

---

## 🔧 自动化测试

### 单元测试
```bash
# 后端单元测试
cd services/api && npm run test

# 前端单元测试
cd apps/web && npm run test
```

### E2E 测试
```bash
# 运行 E2E 测试
cd apps/web && npm run test:e2e
```

### 测试覆盖率
```bash
# 生成覆盖率报告
npm run test:cov
```

---

## ✅ 验收标准

### P0 功能
- [ ] 用户注册/登录正常
- [ ] 作品 CRUD 正常
- [ ] 打卡点功能正常
- [ ] 约拍流程完整
- [ ] 订单流程完整
- [ ] 首页展示正常

### P1 功能
- [ ] 关注系统正常
- [ ] 私信功能正常
- [ ] 话题标签正常
- [ ] 排行榜正常

### 安全性
- [ ] 无 SQL 注入漏洞
- [ ] 无 XSS 漏洞
- [ ] 认证授权正确

### 性能
- [ ] 首页加载 < 3s
- [ ] API 响应 < 200ms

---

**文档版本**: 1.0
**创建日期**: 2026-03-21
**创建人**: 菲菲
