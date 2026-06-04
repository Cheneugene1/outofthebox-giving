# 模块：Demo 模式 & 容错

> 对应源码：`src/lib/ai/fallback.ts`、环境变量 `DEMO_MODE`

---

## 容错层级（由高到低）

```
1. DEMO_MODE=true → 全部 mock，不调用 AI，不依赖网络
       ↓ (如果 DEMO_MODE 未设置或不生效)
2. AI 调用超时 (3s) → fallback mock
       ↓ (如果 AI 回应了但格式有问题)
3. AI 返回非法 JSON → 正则提取 + Zod 校验 → 失败则 fallback mock
       ↓ (如果数据库不可用)
4. 数据库不可用 → 内存 fallback（返回一条内置 giving）
```

## DEMO_MODE

### 启用方式

```bash
DEMO_MODE=true npm run dev
```

或在 `.env.local` 中写入 `DEMO_MODE=true`。

### 影响范围

| API | DEMO_MODE=true | DEMO_MODE=false |
|-----|---------------|-----------------|
| `POST /api/submit` | 返回 mock ReviewResult | 调用真实 AI |
| `GET /api/open?featured=...` | 接受 featured 参数 | 忽略 featured 参数 |
| 其他 API | 正常（仍然操作数据库） | 正常 |

### Mock Review 逻辑

`src/lib/ai/fallback.ts`：

```typescript
function getMockReview(text: string, language: 'en' | 'zh'): ReviewResult {
  // 已知 demo bad cases → 返回确切 mock
  // 中文: "太蠢了" + "加我微信" → medium risk, 变换 + 改写
  // 英文: "trash" + "DM me" → medium risk, 变换 + 改写

  // 其他内容 → low risk, qualityScore=75, 建议发布
}
```

## 错误处理

### Error 状态 (`AppState = 'error'`)

触发条件（仅当 API 层面出错，不包括 AI 调用的软失败）：

| 场景 | 行为 |
|------|------|
| `POST /api/submit` 返回非 200 | → `error` 状态 |
| `POST /api/publish` 返回非 200 | → `error` 状态 |
| `GET /api/open` 返回非 200 | → `error` 状态 |
| `POST /api/helped` 返回非 200 | → `error` 状态（但静默，不切状态） |

**AI 调用的软失败不走 `error`**：
- AI 超时 (3s) → fallback mock（静默，用户无感知）
- AI 返回非法 JSON → fallback mock（静默）
- 这不是 `error` 状态，而是容错降级

处理：
- 设置 `error` 字段
- 切换状态为 `error`
- UI 显示轻量提示："Something went wrong. Try again."
- 用户点击 "Try again" → 回到 `compose` 状态

### Fallback Giving

当 `GET /api/open` 无法从数据库获取任何 giving 时：

```typescript
const FALLBACK_GIVING: OpenResponse = {
  id: 'fallback',
  content: 'Before debugging, write what you expected and what actually happened.',
  language: 'en',
  helpedCount: 0,
};
```

## 超时控制

```typescript
// 3 秒硬超时
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 3000);
```

- 3 秒是 Hackathon Demo 体验的硬限制
- 超时后 catch 进入 fallback mock
- 不清除 timeoutId 会导致内存泄漏 → 必须 `clearTimeout(timeoutId)`

## Loading 状态

- `AppState = 'reviewing'` 期间显示 `<ReviewLoading />`
- 文案："The box is reading your giving..."
- 动画：盒子"呼吸"脉冲 CSS keyframes
- 如果 3 秒后还没有结果 → 自动触发 fallback（用户在 loading 中等待不超过 3 秒）

## 注意事项

- `DEMO_MODE` 只控制 AI 调用，不影响数据库读写
- `featured` 参数只在 DEMO_MODE 下生效
- 生产环境应移除 DEMO_MODE 分支，或通过配置中心控制
- Fallback mock 对于 demo bad cases 必须返回与真实 AI 一致的结果（方便排练）
- 相关模块：[ai-integration.md](./ai-integration.md)、[app-state.md](./app-state.md)、[api-routes.md](./api-routes.md)
