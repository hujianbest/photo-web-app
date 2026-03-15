# 生产部署与安全清单

本文档用于上线前检查，确保生产环境配置与安全项就绪。

## 1. 环境变量（必改）

| 变量 | 说明 | 生产要求 |
|------|------|----------|
| `APP_ENV` | 应用环境 | 设为 `production` |
| `JWT_SECRET` | JWT 签名密钥 | **必须**更换为强随机字符串，勿使用示例值 |
| `DB_PASSWORD` | 数据库密码 | 强密码，且不提交到仓库 |
| `DB_SYNCHRONIZE` | TypeORM 自动同步表结构 | **必须**为 `false`，使用迁移 |
| `CORS_ORIGINS` | 允许的前端来源 | 仅配置实际前端域名，如 `https://your-domain.com` |
| `REDIS_PASSWORD` | Redis 密码 | 生产建议设置 |
| `UPLOAD_PATH` | 上传目录 | 使用持久化存储或对象存储路径 |

其他敏感变量（支付、短信、邮件、OSS 等）从 `.env.example` 复制后**仅在本机或密钥管理系统中配置**，不要提交到 Git。

## 2. HTTPS 与反向代理

- 生产环境应通过 **HTTPS** 对外提供服务。
- 若使用 Nginx/云负载均衡：在反向代理层终止 SSL，将 `X-Forwarded-Proto` 等头正确传给应用。
- 应用内不硬编码 `http://` 的绝对 URL；使用 `BASE_URL` 或相对路径。

## 3. 安全项检查

- [ ] **JWT**：`JWT_SECRET` 已更换；`JWT_EXPIRATION` / `JWT_REFRESH_EXPIRATION` 按策略设置（如 7d / 30d）。
- [ ] **CORS**：仅允许可信前端域名，禁止 `*`。
- [ ] **数据库**：生产禁用 `DB_SYNCHRONIZE`；使用迁移脚本更新表结构。
- [ ] **日志**：生产不打印敏感信息（密码、Token、完整请求体）；可设 `LOG_LEVEL=warn` 或 `error`。
- [ ] **错误响应**：已通过全局异常过滤器对 DB/连接错误返回 503 友好提示，避免泄露内部堆栈。

## 4. 部署步骤（简要）

### API（NestJS）

```bash
cd services/api
cp .env.example .env   # 按上表修改
npm ci
npm run build
npm run db:migrate     # 若有迁移
npm run start:prod
```

- 静态上传目录：确保 `UPLOAD_PATH` 存在且进程可写；若用对象存储，需接对应模块。

### Web（Next.js）

```bash
cd apps/web
cp .env.example .env.local   # 配置 NEXT_PUBLIC_API_URL 等
npm ci
npm run build
npm run start
```

- `NEXT_PUBLIC_API_URL` 指向生产 API 地址（如 `https://api.your-domain.com`）。

### 基础设施

- PostgreSQL、Redis（及可选 RabbitMQ）按 `docker-compose` 或运维方案提前就绪。
- 健康检查：可请求 `GET /api/v1/health` 验证 API 存活。

## 5. 上线后验证

- [ ] 登录/注册与 JWT 刷新正常。
- [ ] 上传图片可访问（含缩略图若已启用 sharp）。
- [ ] CORS 仅允许预期前端域名，无多余来源。
- [ ] 生产环境无 500 堆栈信息外泄。

---

**文档版本**: 2026-03-15  
**维护**: 随部署方式变更及时更新本清单。
