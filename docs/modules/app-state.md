# 模块：状态机 & 数据流

> 对应源码：`src/hooks/useAppState.ts`、`src/lib/types.ts`

---

## 核心概念

整个应用是一个**状态机**——同一时刻只有一个 `AppState`，所有 UI 切换由 state 决定。状态转移封装在 `useAppState` hook 中，组件只看 state、调 action，不直接操作状态。

## 状态定义 (9 个)

```typescript
type AppState =
  | 'closed_box'           // 初始：盒子关闭，显示 Open the box
  | 'opening'              // 动画过渡：盒子打开中 ~1.5s
  | 'giving_card'          // 展示一条 giving + 三个按钮
  | 'compose'              // 输入新 giving 的文本区
  | 'reviewing'            // AI 审核中，显示 loading
  | 'translation_result'   // 审核结果（low: 原文确认 / med: 变换改写）
  | 'published'            // 发布成功
  | 'blocked'              // 被阻止（high risk 或 qualityScore < 60）
  | 'error';               // 网络/API 出错
```

## 状态转移规则

| 当前状态 | 触发 Action | 目标状态 | 条件 |
|----------|-------------|----------|------|
| `closed_box` | `openBox()` | `opening` | — |
| `opening` | 动画结束(自动) | `giving_card` | — |
| `giving_card` | `openAnother()` | `opening` | — |
| `giving_card` | `startCompose()` | `compose` | — |
| `giving_card` | `helpedMe()` | `giving_card` | 原地停留 |
| `compose` | `submitGiving(text)` | `reviewing` | — |
| `reviewing` | AI 返回 low/med + qs≥60 | `translation_result` | low 显示原文，med 显示变换 |
| `reviewing` | AI 返回 high / qs<60 | `blocked` | — |
| `reviewing` | fetch 失败 | `error` | 网络断开、超时等 |
| `translation_result` | `publishOriginal()` / `publishRewrite()` | `published` | — |
| `translation_result` | `tryAgain()` | `compose` | 重新输入 |
| `published` | `openAnother()` | `opening` | — |
| `blocked` | `tryAgain()` | `compose` | 重新输入 |
| `error` | `tryAgain()` | `compose` | 重试 |

## `useAppState` Hook 接口

```typescript
interface AppStateContext {
  state: AppState;
  currentGiving: Giving | null;
  composeText: string;
  aiReview: ReviewResult | null;
  error: string | null;

  // Actions
  openBox: () => Promise<void>;
  helpedMe: () => Promise<void>;
  openAnother: () => Promise<void>;
  startCompose: () => void;
  submitGiving: (text: string) => Promise<void>;
  publishOriginal: () => Promise<void>;
  publishRewrite: () => Promise<void>;
  tryAgain: () => void;
  setComposeText: (text: string) => void;
}
```

## 核心数据流

```
用户操作 → action() → [setState + fetch API + localStorage] → setState(...) → 组件重渲染
```

所有副作用（API 调用、localStorage 读写）封装在 action 内部，组件不直接调用 fetch。

## 本地存储 (localStorage)

- Key: `"ootbg_state"`
- 内容：
  - `excludeIds: string[]` — 最近 30 个已打开的 giving ID，传给 `/api/open` 去重
  - `lastPublishedId: string | null` — Demo 模式下发布后 feature 自己的 giving

## React StrictMode 兼容

- 所有 `useEffect` 副作用使用 `AbortController` + cleanup
- `openBox()` 等异步 action 使用 ref 标记防重入
- 开发模式下 `useEffect` 触发两次，cleanup 中 `abort()` 取消第一次请求

## 实现选择：`useReducer` 而非 `useState`

9 个状态 + 多个异步 action + 多种副作用。多个 `useState`/`setXxx()` 调用容易产生状态不一致的中间态（比如 state 切了但 giving 还没 set）。推荐 `useReducer`：

```typescript
type Action =
  | { type: 'SET_STATE'; state: AppState }
  | { type: 'SET_GIVING'; giving: Giving }
  | { type: 'SET_REVIEW'; review: ReviewResult }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_COMPOSE_TEXT'; text: string };

function appReducer(state: AppStateContext, action: Action): AppStateContext {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, state: action.state, error: null };
    case 'SET_GIVING':
      return { ...state, currentGiving: action.giving };
    case 'SET_REVIEW':
      return { ...state, aiReview: action.review };
    case 'SET_ERROR':
      return { ...state, state: 'error', error: action.error };
    case 'SET_COMPOSE_TEXT':
      return { ...state, composeText: action.text };
    default:
      return state;
  }
}
```

dispatch 单一入口保证每次状态切换的原子性，不存在"state 切了但 giving 还是旧的"这种中间态。

## 注意事项

- `giving_card` 下的 `helpedMe()` 成功不跳转，静默更新 `helpedCount`
- `translation_result` 的 UI 内容由 `aiReview.riskLevel` 决定（low: 无动画，med: 有变换动画）
- `error` 状态不属于正常流程，是 catch-all 兜底
- 相关模块：[api-routes.md](./api-routes.md)、[ai-integration.md](./ai-integration.md)
