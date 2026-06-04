# 模块知识库 — 阅读顺序

按依赖关系排列，建议按顺序阅读：

---

## 1. [app-state.md](./modules/app-state.md)

**一句话**：9 个 AppState + 状态转移规则 + useAppState hook（用 `useReducer`）

**前置**：无

**为什么先看**：理解整个应用的骨架——所有 UI 和 API 调用都围绕着这个状态机。

---

## 2. [api-routes.md](./modules/api-routes.md)

**一句话**：5 个 API endpoint 的完整规格 + Zod 校验 + 统一错误格式

**依赖**：app-state（理解状态转移后才能明白 API 在哪个状态下被谁调用）

**为什么第二个看**：前后端的契约，所有数据交互都在这里定义。

---

## 3. [database.md](./modules/database.md)

**一句话**：SQLite + Drizzle schema + queries.ts + seed + WAL 模式

**依赖**：api-routes（API 的实现依赖数据库查询）

**为什么第三个看**：数据持久化层，API routes 的底层依赖。

---

## 4. [components.md](./modules/components.md)

**一句话**：组件树 + 7 个分组 + `AnimatePresence mode="wait"` + 移动端适配

**依赖**：app-state（组件按 state 分支渲染）

**为什么第四个看**：UI 层，理解了状态机后看组件树直接能对着写。

---

## 5. [animation.md](./modules/animation.md)

**一句话**：7 种动画 + TransformAnimation 核心算法（splitBySpans + 四阶段编排）

**依赖**：components（动画附着在组件上）

**为什么第五个看**：这是 Demo 的核心亮点，实现细节最密集的模块。

---

## 6. [ai-integration.md](./modules/ai-integration.md)

**一句话**：System prompt + generateObject + fallback + few-shot

**依赖**：api-routes（`POST /api/submit` 的 AI 部分）、demo-mode（fallback 共用）

**为什么第六个看**：相对独立，主要是 prompt 工程 + 容错策略。

---

## 7. [demo-mode.md](./modules/demo-mode.md)

**一句话**：四层容错 + DEMO_MODE 影响范围 + error vs fallback 的边界

**依赖**：ai-integration、api-routes

**为什么最后看**：横切关注点，涉及所有模块的容错边界定义。

---

## 模块依赖图

```
app-state.md ◄──────────────────────────────────────────┐
    │                                                     │
    ▼                                                     │
api-routes.md ◄──── components.md                        │
    │                   │                                 │
    ▼                   ▼                                 │
database.md        animation.md                          │
    │                                                     │
    ▼                                                     │
ai-integration.md ◄────────────────────────────────────┘
    │
    ▼
demo-mode.md
```

---

## 上级文档

- [CLAUDE.md](../CLAUDE.md) — AI 助手入口，项目全景
- [process.md](../process.md) — 项目进度追踪
- [architecture-dev-plan.md](../architecture-dev-plan.md) — 整体架构与开发计划（技术方案主文档）
- [outofthebox-giving-plan.md](../outofthebox-giving-plan.md) — 产品方案（需求来源）
