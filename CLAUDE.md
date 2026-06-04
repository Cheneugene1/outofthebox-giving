# Out of the Box Giving — 项目入口

> AI 助手启动时阅读本文件，快速理解项目全貌。

---

## 项目一句话

**Out of the Box Giving** 是一个 AI 驱动的善意盒子。用户打开盒子接收陌生人留下的小有用之物，留下自己的信息时，AI 会把尖锐、不安全或不合适的语言转化为温和、有用、可分享的内容。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript (strict) |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| 数据库 | SQLite + Drizzle ORM (better-sqlite3) |
| AI | Vercel AI SDK (`ai` + `@ai-sdk/openai`) |
| 校验 | Zod |
| 部署 | 本地 `next start`（Hackathon 期间） |

## 关键架构决策

1. **单页面无路由** — 所有状态切换通过状态机在组件层完成，不涉及 Next.js 路由跳转
2. **不引入状态管理库** — `useAppState` hook + React state 足够
3. **Demo 三层保护** — DEMO_MODE → 3s 超时 fallback → JSON 解析失败 fallback
4. **文字变换是核心亮点** — Framer Motion 逐字替换动画，unsafeSpans 切分算法
5. **本地部署不是降级** — better-sqlite3 是 native module，Vercel Serverless 不支持

## 快速启动

```bash
# 安装依赖
npm install

# 初始化数据库 + 种子数据
npx tsx src/lib/db/seed.ts

# 启动开发服务器 (DEMO_MODE)
DEMO_MODE=true npm run dev

# 启动开发服务器 (真实 AI)
npm run dev
```

## 环境变量

```bash
DEMO_MODE=true              # Demo 模式：不调用真实 AI
OPENAI_API_KEY=sk-xxx       # AI API key
DATABASE_PATH=./data.db     # SQLite 文件路径
```

---

## 文档索引

### 核心文档

| 文件 | 内容 |
|------|------|
| [outofthebox-giving-plan.md](./outofthebox-giving-plan.md) | 产品方案（需求来源） |
| [architecture-dev-plan.md](./architecture-dev-plan.md) | 整体架构 + 分阶段开发计划（技术方案主文档） |
| [process.md](./process.md) | 项目进度追踪（当前状态、完成/进行中/待开始） |
| [demo-rehearsal.md](./demo-rehearsal.md) | **Demo 排练指南** — 2 分钟脚本 + 操作步骤 + 时间线 + 评委问答 |
| [docs/README.md](./docs/README.md) | **模块知识库索引** — 推荐阅读顺序 + 依赖图 |

### 模块知识库 (`docs/modules/`)

按依赖关系排列，建议从 [docs/README.md](./docs/README.md) 开始：

| # | 文件 | 模块 | 一句话 |
|---|------|------|--------|
| 1 | [app-state.md](./docs/modules/app-state.md) | 状态机 & 数据流 | 9 个 AppState + useReducer + 状态转移规则 |
| 2 | [api-routes.md](./docs/modules/api-routes.md) | API 路由 | 5 个 endpoint + Zod 校验 + 统一错误格式 |
| 3 | [database.md](./docs/modules/database.md) | 数据库 | SQLite WAL + Drizzle schema + queries.ts + seed |
| 4 | [components.md](./docs/modules/components.md) | 组件 | 组件树 + 7 个分组 + AnimatePresence |
| 5 | [animation.md](./docs/modules/animation.md) | 动画系统 | 7 种动画 + splitBySpans 算法 + 四阶段编排 |
| 6 | [ai-integration.md](./docs/modules/ai-integration.md) | AI 集成 | generateObject + prompt + fallback + few-shot |
| 7 | [demo-mode.md](./docs/modules/demo-mode.md) | Demo & 容错 | 四层容错 + error vs fallback 边界 |

---

## 核心代码路径速查

```
src/
├── app/
│   ├── page.tsx                    # 异步 RSC：服务端 getStats() → <ClientApp>
│   └── api/{open,submit,publish,helped,stats}/route.ts
├── components/
│   ├── ClientApp.tsx               # 客户端入口：useAppState + 状态路由渲染
│   ├── {box,card,compose,review,result,stats,ui}/
├── hooks/useAppState.ts            # 核心状态机 (useReducer)
├── lib/
│   ├── db/{index,schema,queries,seed}.ts
│   ├── ai/{prompt,review,fallback,few-shots}.ts
│   ├── types.ts, constants.ts, zod-schemas.ts, utils.ts
└── data/seed-givings.ts            # 40 条种子内容
```

---

## 开发约定

- 组件只调用 `useAppState` 提供的 action，不直接操作状态
- 所有 API 调用封装在 action 内部，组件不直接 fetch
- API 输入输出全部 Zod 校验
- 动画用 Framer Motion，不用纯 CSS transition
- 每个新模块建完后更新对应的 `docs/modules/*.md`
- 进度变更时更新 `process.md`
