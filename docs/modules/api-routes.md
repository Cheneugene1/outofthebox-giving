# 模块：API 路由

> 对应源码：`src/app/api/{open,submit,publish,helped,stats}/route.ts`
> 校验：`src/lib/zod-schemas.ts`

---

## 概览

5 个 API endpoint，全部在 Next.js App Router 的 `route.ts` 中实现。所有输入输出经过 Zod 校验。

## API 列表

### `GET /api/open?exclude_ids=...&featured=...`

随机返回一条 giving，排除已打开过的。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `exclude_ids` | string | 否 | 逗号分隔的 giving ID 列表，最近 30 个 |
| `featured` | string | 否 | 指定返回的 giving ID（仅 DEMO_MODE 生效） |

**响应：**
```json
{
  "id": "g_123",
  "content": "Before debugging, write what you expected...",
  "language": "en",
  "helpedCount": 12
}
```

**逻辑：**
1. 解析 `exclude_ids`：`?exclude_ids=` → 视为空数组；`?exclude_ids=a,b,c` → `['a','b','c']`；空字符串 `""` → `[]`
2. Demo 模式 + featured 有效 → 返回 featured 指定的 giving
3. 排除 `exclude_ids` + `hidden=true`
4. `ORDER BY RANDOM()` 取一条
5. 无可用数据 → 返回内置 fallback
6. 写入 events (`type='open_box'`)

### 统一错误响应格式

所有 API 出错时返回统一结构：

```json
{
  "error": "human-readable message"
}
```

HTTP 状态码：
- `400` — 输入校验失败（Zod）
- `500` — 服务器内部错误（DB 挂了等）

前端 `useAppState` 中，任何非 `2xx` 响应 → 读 `response.json().error` → `dispatch({ type: 'SET_ERROR', error })`。

---

### `POST /api/submit`

接收用户文本，返回 AI 审核结果（或 mock）。

**请求：** `{ "text": "..." }` （≤ 280 字符）

**响应：** `ReviewResult` 完整 JSON

**逻辑：**
1. Zod 校验 + 长度检查
2. 自动检测语言（中文 >30% → `zh`）
3. DEMO_MODE → mock review
4. 调用 AI，3s 超时，JSON 提取 + Zod 校验
5. 失败 → mock review
6. 写入 events (`type='submitted'`)

---

### `POST /api/publish`

发布 giving 到数据库。

**请求：**
```json
{
  "content": "...",
  "language": "en",
  "sourceType": "user_rewrite",
  "softenedWordCount": 2
}
```

**响应：** `{ "ok": true, "givingId": "g_456" }`

**逻辑：**
1. INSERT INTO givings
2. INSERT INTO events (`type='published'`)
3. 如果 `softenedWordCount > 0` → INSERT events (`type='softened'`)
4. 返回新 ID

---

### `POST /api/helped`

"Helped me" 点赞。

**请求：** `{ "givingId": "g_123" }`

**响应：** `{ "ok": true, "helpedCount": 13 }`

**逻辑：**
1. UPDATE givings SET helpedCount + 1
2. INSERT INTO events (`type='helped'`)

---

### `GET /api/stats`

全局统计。

**响应：**
```json
{
  "boxesOpened": 1234,
  "givingsLeft": 456,
  "sharpWordsSoftened": 78
}
```

**逻辑：**
```sql
SELECT SUM(count) FROM events WHERE type = 'open_box';
SELECT SUM(count) FROM events WHERE type = 'published';
SELECT SUM(count) FROM events WHERE type = 'softened';
```

---

## Zod 校验体系

所有 API 输入输出定义在 `src/lib/zod-schemas.ts`：

```typescript
// API 输入
submitRequestSchema = z.object({ text: z.string().max(280) })
publishRequestSchema = z.object({ content, language, sourceType, softenedWordCount })
helpedRequestSchema = z.object({ givingId: z.string() })

// AI 输出（核心校验）
reviewResultSchema = z.object({
  language: z.enum(['en','zh']),
  riskLevel: z.enum(['low','medium','high']),
  flags: z.array(z.string()),
  unsafeSpans: z.array(z.string()),
  kindnessTranslation: z.string(),
  publishableRewrite: z.string(),
  qualityScore: z.number().min(0).max(100),
  shouldPublishOriginal: z.boolean(),
  shouldOfferRewrite: z.boolean(),
  softenedWordCount: z.number().min(0),
  suggestionForUser: z.string(),
  reason: z.string(),
})
```

---

## 注意事项

- 所有 API route 使用 `export const runtime = 'nodejs'` + `export const dynamic = 'force-dynamic'`（不用 Edge Runtime，不用静态渲染）
- better-sqlite3 只能在 Node.js runtime 中运行
- `POST /api/submit` 不写入 giving，只是审核；发布由 `POST /api/publish` 完成
- `featured` 参数只在 DEMO_MODE 下生效，生产环境忽略
- 相关模块：[app-state.md](./app-state.md)、[database.md](./database.md)、[ai-integration.md](./ai-integration.md)
