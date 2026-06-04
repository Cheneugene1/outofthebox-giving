# 模块：AI 集成

> 对应源码：`src/lib/ai/{provider,prompt,review,fallback,few-shots}.ts`
> SDK: Vercel AI SDK (`ai` + `@ai-sdk/openai`，用 `createOpenAI` 兼容 DeepSeek / OpenAI)

---

## 支持的 AI 提供商

通过 `AI_PROVIDER` 环境变量切换（`src/lib/ai/provider.ts`）：

| 值 | 模型 | 需要环境变量 | 说明 |
|---|------|-------------|------|
| `deepseek` | `deepseek-chat` | `DEEPSEEK_API_KEY` | 默认。兼容 OpenAI 格式，新用户有免费额度 |
| `openai` | `gpt-4o-mini` | `OPENAI_API_KEY` | — |

## 核心职责

将用户提交的文本发送给 AI，返回结构化的 `ReviewResult` JSON。AI 的角色是**善意转换器（kindness transformer）**，而非仅仅是一个审核分类器。

## 文件结构

```
src/lib/ai/
├── prompt.ts       # System prompt（中英文规则）
├── few-shots.ts    # Few-shot 样例
├── review.ts       # 主调用：prompt 构建 + AI 调用 + 解析
└── fallback.ts     # Mock review（DEMO_MODE + 容错兜底）
```

## 调用流程

```
POST /api/submit
  → review.ts: reviewGiving(text, language)
    → DEMO_MODE? → fallback.getMockReview(text, language)
    → 构建 messages: [systemPrompt, ...fewShots, userText]
    → 调用 AI (3s 超时)
    → 解析响应 → parseReviewResponse(raw)
      → reviewResultSchema.parse(parsed)
    → 成功 → 返回 ReviewResult
    → 失败 → fallback.getMockReview(text, language)
```

## 超时控制

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 3000);
// ... AI 调用 ...
clearTimeout(timeoutId);
```

3 秒是基于 Hackathon Demo 体验的硬限制。超过 3 秒评委会觉得卡。

## AI 调用方式：`generateObject`

推荐使用 Vercel AI SDK 的 `generateObject` 替代手动 `JSON.parse`：

```typescript
import { generateObject } from 'ai';
import { getModel } from './provider';  // 根据 AI_PROVIDER 环境变量自动选择

const model = getModel();  // deepseek-chat 或 gpt-4o-mini

const { object } = await generateObject({
  model,
  schema: reviewResultSchema,  // Zod schema 直接传入
  messages: [
    { role: 'system', content: systemPrompt },
    ...fewShots,
    { role: 'user', content: text },
  ],
  temperature: 0.3,
});
// object 已经过 Zod 校验，类型安全
```

`generateObject` 的好处：
- 自动处理结构化输出（OpenAI JSON mode / function calling）
- 内置重试（默认 3 次）
- 返回的 `object` 已经过 schema 校验
- 不需要手写 `parseReviewResponse()`

## JSON 提取（容错，仅当不使用 generateObject 时）

如果不用 `generateObject`，需要手动处理 AI 返回的 ` ```json{...}``` ` 等非纯净 JSON：

```typescript
function parseReviewResponse(raw: string): ReviewResult {
  // 1. 直接 JSON.parse + Zod parse
  // 2. 正则提取第一个 {...} → JSON.parse + Zod parse
  // 3. 失败 → throw → 外层 catch 调用 fallback
}
```

**建议优先用 `generateObject`**，避免手写 JSON 容错逻辑。

## System Prompt 核心规则

定义在 `src/lib/ai/prompt.ts`：

1. **你是善意转换器**，不是审核分类器
2. **只标记真正不安全的部分**：侮辱、骚扰、仇恨、联系方式、广告、隐私泄漏、危险建议、诈骗
3. **不标记**：普通沮丧、建设性批评、直接但有用的建议
4. **自我伤害 / 心理健康危机**：标记为 high risk，提供支持性建议，**不转换为可爱/善意词**
5. **不要提供确定性的医疗、法律、财务建议**
6. **改写必须简短、具体、安全、匿名、对陌生人立刻有用**
7. **无法安全改写时标记为 high risk**
8. **只输出 JSON，不输出 Markdown**

## Few-Shot 样例

定义在 `src/lib/ai/few-shots.ts`，至少 4 条：

| 场景 | 输入特征 | 期望输出 |
|------|----------|----------|
| 正常有用内容 | 具体 debug 技巧 | low risk, publish original |
| 中等风险 | 侮辱 + 私人联系方式 | medium risk, unsafeSpans, rewrite |
| 高风险 | 自我伤害危机 | high risk, 不出版, 支持性建议 |
| 低质量 | "Be good" | low risk, qualityScore < 60, 要求更具体 |

## Mock Fallback

定义在 `src/lib/ai/fallback.ts`：

```typescript
function getMockReview(text: string, language: 'en' | 'zh'): ReviewResult
```

### 匹配规则

使用**简单 substring 匹配**，不做模糊匹配、不分大小写（英文 lowercase 后比较）、不处理半全角：

- 中文 bad case：`text.includes('太蠢了') && text.includes('加我微信')` → medium risk
- 英文 bad case：`text.toLowerCase().includes('trash') && text.toLowerCase().includes('dm')` → medium risk
- 其他内容 → low risk, qualityScore=75，建议发布

**不处理**的情况（简化版的边界）：如果有人写 `太 蠢 了`（中间有空格），匹配会失败，返回 low risk。这是有意为之——Hackathon demo 用固定的 demo 输入走流程，不做模糊匹配。

## ReviewResult 类型

```typescript
interface ReviewResult {
  language: 'en' | 'zh';
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  unsafeSpans: string[];
  kindnessTranslation: string;      // 善意翻译（仅用于展示变换动画）
  publishableRewrite: string;       // 可发布的改写（实际入库的版本）
  qualityScore: number;             // 0-100
  shouldPublishOriginal: boolean;
  shouldOfferRewrite: boolean;
  softenedWordCount: number;
  suggestionForUser: string;
  reason: string;
}
```

## 环境变量

```bash
AI_PROVIDER=deepseek          # 可选: deepseek (默认) | openai
DEEPSEEK_API_KEY=sk-xxx       # DeepSeek API key
# 或
OPENAI_API_KEY=sk-xxx         # OpenAI API key (仅 AI_PROVIDER=openai)
DEMO_MODE=true                # 跳过真实 AI 调用，使用 mock
```

## 注意事项

- `kindnessTranslation` 只是视觉展示，不存入 giving
- 存库时存的是 `publishableRewrite`（med risk）或原 `content`（low risk）
- High risk 内容永远不写入 giving 表
- **AI 调用失败时的容错路径**：
  - AI 超时 / JSON 解析失败 / 返回格式错误 → **静默 fallback mock**（不切 `error` 状态，用户无感知）
  - 整个 `POST /api/submit` 返回非 200（比如 DB 出错） → **`error` 状态**
- 其他 API（`open`/`publish`/`helped`）返回非 200 → **`error` 状态**
- 相关模块：[demo-mode.md](./demo-mode.md)、[api-routes.md](./api-routes.md)
