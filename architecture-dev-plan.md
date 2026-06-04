# Out of the Box Giving — 框架搭建与整体开发方案

> 本文档基于 [outofthebox-giving-plan.md](./outofthebox-giving-plan.md) 的产品方案，设计技术架构、目录结构、组件树、数据流和分阶段开发计划。
> 状态：方案阶段，尚未开始编码。

---

## 目录

1. [技术选型](#1-技术选型)
2. [项目目录结构](#2-项目目录结构)
3. [架构总览](#3-架构总览)
4. [组件树设计](#4-组件树设计)
5. [状态机设计](#5-状态机设计)
6. [数据流设计](#6-数据流设计)
7. [API 路由设计](#7-api-路由设计)
8. [数据库设计](#8-数据库设计)
9. [种子数据方案](#9-种子数据方案)
10. [Demo 模式与容错设计](#10-demo-模式与容错设计)
11. [动画方案](#11-动画方案)
12. [分阶段开发计划](#12-分阶段开发计划)
13. [关键风险与技术决策](#13-关键风险与技术决策)

---

## 1. 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| **框架** | Next.js 14+ (App Router) | 产品方案推荐；API Routes 可直接承载后端，单仓库搞定前后端 |
| **前端库** | React 18+ | Next.js 内置，生态成熟 |
| **样式** | Tailwind CSS | 方案推荐；原子化 CSS，快速出 UI |
| **动画** | Framer Motion | 方案首推；开箱动画和文字变换动画需要流畅的声明式动画库 |
| **语言** | TypeScript (strict) | 类型安全，减少运行时错误；AI JSON 响应需要强类型校验 |
| **数据库** | SQLite + Drizzle ORM | 轻量零配置，Hackathon 友好；Drizzle 提供类型安全的 query builder |
| **AI SDK** | Vercel AI SDK (`ai` + `@ai-sdk/openai`) | 统一 AI 调用接口，内置 stream/response 处理，方便超时和 fallback |
| **数据校验** | Zod | AI 返回的 JSON 结构需要运行时校验，Zod 与 TypeScript 无缝配合 |
| **部署** | 本地 `next start`（Hackathon 期间） | Vercel Serverless 不兼容 SQLite 文件写入，本次 Hackathon 采用本地部署；如需公网展示可用 ngrok 或 Docker 打包 |

### 不选的方案及原因

| 不选 | 原因 |
|------|------|
| Pages Router | App Router 是 Next.js 当前主推方向，API Route Handlers 写法更简洁 |
| Prisma | 比 Drizzle 重，需要 generate 步骤，Hackathon 场景下 Drizzle 更轻更快 |
| PostgreSQL / Vercel KV / Neon | MVP 不需要 serverless 数据库，SQLite 零配置本地跑；Hackathon 不追求云端部署 |
| CSS Modules / styled-components | Tailwind 出活最快，方案已推荐 |
| 单独的 Express/Fastify 后端 | 单仓库 Next.js 即可覆盖全部 API 需求，无需额外服务 |
| Vercel 部署 | Vercel Serverless 无持久化文件系统，SQLite 文件写入会在请求间丢失；Hackathon 期间用本地 `next start` |

---

## 2. 项目目录结构

```
heikesong/
├── outofthebox-giving-plan.md      # 产品方案（已存在）
├── architecture-dev-plan.md        # 本文档
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # 根布局：字体、全局样式、metadata
│   │   ├── page.tsx                # 唯一路由：单页面应用入口
│   │   ├── globals.css             # 全局样式 + Tailwind directives
│   │   │
│   │   └── api/                    # API Route Handlers
│   │       ├── open/
│   │       │   └── route.ts        # GET /api/open
│   │       ├── submit/
│   │       │   └── route.ts        # POST /api/submit
│   │       ├── publish/
│   │       │   └── route.ts        # POST /api/publish
│   │       ├── helped/
│   │       │   └── route.ts        # POST /api/helped
│   │       ├── stats/
│   │       │   └── route.ts        # GET /api/stats
│   │
│   ├── components/                 # React 组件
│   │   ├── box/                    # 盒子的视觉呈现
│   │   │   ├── Box.tsx             # 盒子主组件（SVG/CSS 绘制）
│   │   │   ├── BoxClosed.tsx       # 关闭态
│   │   │   ├── BoxOpening.tsx      # 开启动画
│   │   │   └── BoxSparkles.tsx     # 粒子/光效（可选加强）
│   │   │
│   │   ├── card/                   # 给予卡片
│   │   │   ├── GivingCard.tsx      # 卡片容器
│   │   │   └── CardActions.tsx     # Helped me / Open another / Leave one
│   │   │
│   │   ├── compose/                # 编写区
│   │   │   ├── ComposeForm.tsx     # 文本输入 + 字数统计
│   │   │   └── ComposeActions.tsx  # Put it in the box 按钮
│   │   │
│   │   ├── review/                 # AI 审核态
│   │   │   ├── ReviewLoading.tsx   # "The box is reading your giving..."
│   │   │   ├── TranslationResult.tsx  # 善意翻译 + 可发布改写展示
│   │   │   └── TransformAnimation.tsx # 关键词替换动画（核心 demo 亮点）
│   │   │
│   │   ├── result/                 # 结果态
│   │   │   ├── Published.tsx       # 发布成功
│   │   │   ├── Blocked.tsx         # 被阻止 + 提示重试
│   │   │   └── ErrorView.tsx       # 网络/API 错误 + 提示重试
│   │   │
│   │   ├── stats/                  # 统计栏
│   │   │   └── StatsBar.tsx        # Boxes opened / Givings left / Sharp words softened
│   │   │
│   │   └── ui/                     # 通用 UI 原子
│   │       ├── Button.tsx          # 统一样式按钮
│   │       ├── TextArea.tsx        # 统一样式文本区
│   │       └── Badge.tsx           # Badge/标签
│   │
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useAppState.ts          # 主状态机 hook
│   │   ├── useOpenBox.ts           # 开盒子逻辑 + API 调用
│   │   ├── useSubmitGiving.ts      # 提交逻辑 + AI review
│   │   ├── usePublish.ts           # 发布逻辑
│   │   ├── useHelped.ts            # "Helped me" 逻辑
│   │   └── useLocalStorage.ts      # localStorage 封装（exclude_ids 去重）
│   │
│   ├── lib/                        # 工具库
│   │   ├── db/                     # 数据库
│   │   │   ├── index.ts            # Drizzle 初始化 + 连接
│   │   │   ├── schema.ts           # 表结构定义
│   │   │   ├── queries.ts          # 查询函数（getStats, getRandomGiving, etc.）
│   │   │   └── seed.ts             # 种子数据脚本（40 条）
│   │   │
│   │   ├── ai/                     # AI 相关
│   │   │   ├── prompt.ts           # System prompt（中文版 + 英文版）
│   │   │   ├── review.ts           # 调用 AI，返回 ReviewResult
│   │   │   ├── fallback.ts         # Mock review（DEMO_MODE + 容错）
│   │   │   └── few-shots.ts        # Few-shot 样例
│   │   │
│   │   ├── types.ts                # 共享 TypeScript 类型定义
│   │   ├── constants.ts            # 常量（字数限制、超时时间等）
│   │   ├── zod-schemas.ts          # Zod 校验 schema（AI 响应 + API 输入）
│   │   └── utils.ts                # 通用工具函数
│   │
│   └── data/                       # 静态数据
│       └── seed-givings.ts         # 40 条种子给予内容
│
├── public/                         # 静态资源
│   └── (可能的图片、字体等)
│
├── .env.local                      # 环境变量（API keys、DEMO_MODE 等）
├── .env.example                    # 环境变量模板
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── drizzle.config.ts
```

### 关键配置文件

**`next.config.js`** — better-sqlite3 是 native module，必须声明为外部包：

```js
// next.config.js — Next.js 14 写法
// 如果升级到 Next.js 15，改用 serverExternalPackages: ['better-sqlite3']
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

module.exports = nextConfig;
```

---

## 3. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Single Page (page.tsx)               │   │
│  │  ┌────────────────┐  ┌───────────────────────┐   │   │
│  │  │  Box Component  │  │  StatsBar Component   │   │   │
│  │  │  (closed/open)  │  │  (always visible)     │   │   │
│  │  └───────┬────────┘  └───────────────────────┘   │   │
│  │          │                                        │   │
│  │  ┌───────▼────────────────────────────────────┐   │   │
│  │  │         State Router (useAppState)          │   │   │
│  │  │  closed_box → opening → giving_card         │   │   │
│  │  │       → compose → reviewing                 │   │   │
│  │  │       → translation_result                  │   │   │
│  │  │       → published | blocked                 │   │   │
│  │  └──────────────────────┬─────────────────────┘   │   │
│  │                         │                         │   │
│  │  ┌──────────────────────▼─────────────────────┐   │   │
│  │  │         Current View Component              │   │   │
│  │  │  GivingCard / ComposeForm /                 │   │   │
│  │  │  TranslationResult / Published / Blocked    │   │   │
│  │  └──────────────────────┬─────────────────────┘   │   │
│  └─────────────────────────┼─────────────────────────┘   │
│                            │                              │
│              ┌─────────────▼─────────────┐                │
│              │   localStorage             │                │
│              │   - exclude_ids (max 30)   │                │
│              │   - lastPublishedId        │                │
│              └───────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
                             │
                    HTTP fetch()
                             │
┌────────────────────────────▼────────────────────────────┐
│                   Next.js Server                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  API Routes                       │   │
│  │  GET /api/open    → 随机取一条 giving              │   │
│  │  POST /api/submit  → AI review → 返回审核结果      │   │
│  │  POST /api/publish → 写入数据库 + 更新统计          │   │
│  │  POST /api/helped  → helpedCount++                │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │                   Lib Layer                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │   │
│  │  │ db/*     │  │ ai/*     │  │ zod-schemas  │    │   │
│  │  │ Drizzle  │  │ prompt   │  │ 数据校验      │    │   │
│  │  │ + SQLite │  │ review   │  │              │    │   │
│  │  │          │  │ fallback │  │              │    │   │
│  │  └──────────┘  └──────────┘  └──────────────┘    │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │              SQLite (file)                        │   │
│  │  givings table  │  events table                   │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │           External AI API (OpenAI / Claude)       │   │
│  │           3s timeout, fallback on fail            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 组件树设计

```
<Layout>                              // layout.tsx
  <main>
    <Page>                            // page.tsx — 状态机容器
      ├── <StatsBar />                // 始终可见，底部或顶部
      │     stats: { opened, gave, softened }
      │
      └── <AnimatePresence mode="wait">  // Framer Motion 状态切换（key 驱动退出/进入动画）
            │
            ├── case "closed_box":
            │     <motion.div key="closed">
            │       <BoxClosed />
            │       <Button>Open the box</Button>
            │     </motion.div>
            │
            ├── case "opening":
            │     <motion.div key="opening">
            │       <BoxOpening />       // 自动播放 → transition to giving_card
            │     </motion.div>
            │
            ├── case "giving_card":
            │     <motion.div key="giving">
            │       <GivingCard giving={currentGiving}>
            │         <p>{content}</p>
            │         <CardActions>
            │           <Button>Helped me</Button>
            │           <Button>Open another</Button>
            │           <Button>Leave one</Button>
            │         </CardActions>
            │       </GivingCard>
            │     </motion.div>
            │
            ├── case "compose":
            │     <motion.div key="compose">
            │       <ComposeForm>
            │         <TextArea maxLength={280} />
            │         <CharCount />
            │         <Button>Put it in the box</Button>
            │       </ComposeForm>
            │     </motion.div>
            │
            ├── case "reviewing":
            │     <motion.div key="reviewing">
            │       <ReviewLoading />
            │       <Spinner />
            │       <p>The box is reading your giving...</p>
            │     </motion.div>
            │
            ├── case "translation_result":
            │     <motion.div key="translation">
            │       <TranslationResult review={aiReview}>
            │         <!-- low risk: 仅显示原文 + 确认 -->
            │         <!-- medium risk: 显示变换 + 改写 -->
            │         <TransformAnimation ... />  <!-- 仅 medium 时播放 -->
            │         <PublishableVersion>
            │           <p>{publishableRewrite}</p>
            │         </PublishableVersion>
            │         <Button>Publish this giving</Button>
            │         <Button>Try again</Button>
            │       </TranslationResult>
            │     </motion.div>
            │
            ├── case "error":
            │     <motion.div key="error">
            │       <ErrorView message={error}>
            │         <p>出错了</p>
            │         <Button>Try again</Button>
            │       </ErrorView>
            │     </motion.div>
            │
            ├── case "published":
            │     <motion.div key="published">
            │       <Published>
            │         <CheckIcon />
            │         <p>Your giving is in the box.</p>
            │         <Button>Open another</Button>
            │       </Published>
            │     </motion.div>
            │
            └── case "blocked":
                  <motion.div key="blocked">
                    <Blocked>
                      <p>{suggestion}</p>
                      <Button>Try again</Button>
                    </Blocked>
                  </motion.div>
      </AnimatePresence>
    </Page>
  </main>
</Layout>
```

---

## 5. 状态机设计

### 5.1 状态定义

```typescript
type AppState =
  | 'closed_box'
  | 'opening'
  | 'giving_card'
  | 'compose'
  | 'reviewing'
  | 'translation_result'
  | 'published'
  | 'blocked'
  | 'error';
```

### 5.2 状态转移图

```
                    ┌─────────────┐
                    │ closed_box  │  (初始状态)
                    └──────┬──────┘
                           │ [Open the box]
                           ▼
                    ┌─────────────┐
                    │  opening    │  (动画播放 ~1.5s)
                    └──────┬──────┘
                           │ 动画结束
                           ▼
                    ┌─────────────┐
            ┌───────│ giving_card │◄──────────────┐
            │       └──┬───┬───┬──┘               │
            │          │   │   │                   │
            │ [Helped] │   │   │ [Leave one]       │
            │ (停留当前 │   │   │                   │
            │  卡片)    │   │   ▼                   │
            │          │   │  ┌─────────────┐      │
            │          │   │  │  compose    │      │
            │          │   │  └──────┬──────┘      │
            │          │   │         │ [Put it in] │
            │          │   │         ▼              │
            │          │   │  ┌─────────────┐      │
            │          │   │  │ reviewing   │      │
            │          │   │  └──────┬──────┘      │
            │          │   │         │ AI 返回      │
            │          │   │    ┌────┴──────────────┐
            │          │   │    ▼                   ▼
            │          │   │ ┌──────────────────┐ ┌──────────┐
            │          │   │ │ low or medium    │ │ high or  │
            │          │   │ │ + qualityScore   │ │ qs < 60  │
            │          │   │ │ >= 60            │ │          │
            │          │   │ └────────┬─────────┘ └────┬─────┘
            │          │   │          │                 │
            │          │   │          ▼                 ▼
            │          │   │ ┌──────────────────┐ ┌──────────┐
            │          │   │ │translation_result│ │ blocked  │
            │          │   │ │ low: 确认原文发布  │ └────┬─────┘
            │          │   │ │ med: 确认改写发布  │      │
            │          │   │ └──┬───────┬───────┘      │
            │          │   │    │       │              │
            │          │   │    │ [Publish] [Retry]    │ [Retry]
            │          │   │    │       │     │        │
            │          │   │    ▼       ▼     ▼        ▼
            │          │   │ ┌──────────┐   compose ◄──┘
            │          │   │ │published │
            │          │   │ └────┬─────┘
            │          │   │      │
            │          │   │      ▼
            │          │   │ ┌──────────────────────┐
            │          │   │ │  published (success)  │
            │          │   │ └──────────┬───────────┘
            │          │   │            │ [Open another]
            │          │   │            ▼
            │          │   │       opening
            │          │   │
            │          │   └──────────────┐
            │          │                  │
            │          │ [Open another]   │
            │          └──────────────────┘
            │
            └──── [if qs<60 or high risk]
                       ▼
                 ┌─────────────┐
                 │  blocked    │
                 └──────┬──────┘
                        │ [Try again]
                        ▼
                     compose

备注：reviewing → error 不在主流程中画出，但是所有 API 调用的 catch 都会设置 error，
组件在 state='error' 时展示 ErrorView，提供 "Try again" 回到 compose。
```

### 5.3 核心 Hook 设计：`useAppState`

```typescript
// src/hooks/useAppState.ts

interface AppStateContext {
  state: AppState;
  currentGiving: Giving | null;       // 当前显示的 giving
  composeText: string;                // 用户输入的文本
  aiReview: ReviewResult | null;      // AI 审核结果
  error: string | null;               // 错误信息

  // Actions — 每个 action 触发状态转移 + 副作用
  openBox: () => Promise<void>;
  helpedMe: () => Promise<void>;
  openAnother: () => Promise<void>;
  startCompose: () => void;
  submitGiving: (text: string) => Promise<void>;
  publishOriginal: () => Promise<void>;  // low risk 时发布原文
  publishRewrite: () => Promise<void>;   // medium risk 时发布改写
  tryAgain: () => void;                  // 回到 compose 或重试
  setComposeText: (text: string) => void;
}
```

设计原则：
- 所有副作用（API 调用、localStorage 操作）封装在 action 内部。
- 组件只调用 action，不直接操作状态。
- 如果 action 执行过程中出错，设置 `error` 字段，状态切换为 `error`。
- `error` 状态展示轻量提示（"Something went wrong. Try again."），点击重试回到 `compose`。
- **React StrictMode 兼容**：所有 `useEffect` 中的副作用通过 AbortController + cleanup 函数防止 double-effect（开发模式下 effect 会执行两次）。`openBox()` 等 action 内部使用 ref 标记防重入。

---

## 6. 数据流设计

### 6.1 核心类型定义

```typescript
// src/lib/types.ts

// === 数据库实体 ===
interface Giving {
  id: string;               // "g_" + nanoid()
  content: string;
  language: 'en' | 'zh';
  sourceType: 'seed' | 'user_original' | 'user_rewrite';
  helpedCount: number;
  createdAt: string;        // ISO 8601
  hidden: boolean;
}

interface Event {
  id: string;
  type: 'open_box' | 'helped' | 'submitted' | 'published' | 'softened';
  count: number;            // 增量（非累计）
  createdAt: string;
}

// === AI 审核结果 ===
interface ReviewResult {
  language: 'en' | 'zh';
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  unsafeSpans: string[];
  kindnessTranslation: string;
  publishableRewrite: string;
  qualityScore: number;
  shouldPublishOriginal: boolean;
  shouldOfferRewrite: boolean;
  softenedWordCount: number;
  suggestionForUser: string;
  reason: string;
}

// === API 请求/响应 ===
interface OpenResponse {
  id: string;
  content: string;
  language: 'en' | 'zh';
  helpedCount: number;
}

interface SubmitRequest {
  text: string;
}

// SubmitResponse = ReviewResult (直接复用)

interface PublishRequest {
  content: string;
  language: 'en' | 'zh';
  sourceType: 'user_original' | 'user_rewrite';
  softenedWordCount: number;
}

interface PublishResponse {
  ok: boolean;
  givingId: string;
}

interface HelpedRequest {
  givingId: string;
}

interface HelpedResponse {
  ok: boolean;
  helpedCount: number;
}

// === 统计 ===
interface Stats {
  boxesOpened: number;
  givingsLeft: number;
  sharpWordsSoftened: number;
}
```

### 6.2 前端数据流（以 "Leave one + publish rewrite" 为例）

```
1. 用户在 compose 状态输入文本
   → setComposeText(text) 更新 composeText

2. 用户点击 "Put it in the box"
   → submitGiving(text)
   → 状态切换为 reviewing
   → POST /api/submit { text }
   → 等待响应（loading 动画播放）

3. 收到 AI ReviewResult
   → 判断路由：
     ├─ low risk + qualityScore >= 60
     │    → 设置 aiReview
     │    → 状态切换为 translation_result（显示原文，按钮:"Publish this giving")
     │    → 用户确认后才调用 POST /api/publish
     │
     ├─ medium risk + qualityScore >= 60
     │    → 设置 aiReview
     │    → 状态切换为 translation_result（显示变换 + 改写，按钮:"Give this version")
     │
     ├─ high risk
     │    → 设置 aiReview
     │    → 状态切换为 blocked
     │
     └─ qualityScore < 60
          → 设置 aiReview
          → 状态切换为 blocked

4. (translation_result) 用户点击 "Publish this giving" / "Give this version"
   → publishRewrite() 或 publishOriginal()
   → POST /api/publish { content, sourceType, ... }
   → 状态切换为 published
   → localStorage 记录 lastPublishedId

5. (published) 用户点击 "Open another"
   → openBox()
   → GET /api/open?exclude_ids=...&featured=lastPublishedId
   → 状态切换为 opening → 动画 → giving_card
   → Stats 刷新
```

### 6.3 本地存储 (localStorage) 结构

```typescript
// Key: "ootbg_state"
interface LocalState {
  excludeIds: string[];        // 最近 30 个已打开的 giving ID
  lastPublishedId: string | null;
}
```

---

## 7. API 路由设计

### 7.1 `GET /api/open`

```
文件：src/app/api/open/route.ts

逻辑：
1. 解析 query params: exclude_ids, featured
2. 如果是 demo 模式且 featured 有效，优先返回 featured
3. 从 givings 表中排除 exclude_ids + hidden=true 的条目
4. 随机选一条（ORDER BY RANDOM() LIMIT 1）
5. 如果无可用 giving，返回一条内置 fallback 消息
6. 写入 events 表 (type='open_box', count=1)
7. 返回 OpenResponse
```

### 7.2 `POST /api/submit`

```
文件：src/app/api/submit/route.ts

逻辑：
1. Zod 校验请求体 { text: string, maxLength: 280 }
2. 自动检测语言 (中文字符 >30% → zh, else en)
3. 如果 DEMO_MODE=true → 返回 mock review
4. 否则调用 AI:
   - 使用 AbortController 设置 3 秒超时
   - 构建 prompt（系统提示 + few-shot + 用户文本）
   - 要求 AI 返回纯 JSON
5. 解析 AI 响应:
   - 尝试提取第一个 JSON object
   - Zod 校验 ReviewResult schema
   - 失败 → 返回 mock review
6. 写入 events 表 (type='submitted', count=1)
7. 返回 ReviewResult
```

### 7.3 `POST /api/publish`

```
文件：src/app/api/publish/route.ts

逻辑：
1. Zod 校验请求体
2. INSERT INTO givings (content, language, sourceType, helpedCount=0, hidden=false)
3. INSERT INTO events (type='published', count=1)
4. 如果 softenedWordCount > 0:
   INSERT INTO events (type='softened', count=softenedWordCount)
5. 返回 { ok: true, givingId }
```

### 7.4 `POST /api/helped`

```
文件：src/app/api/helped/route.ts

逻辑：
1. Zod 校验 { givingId: string }
2. UPDATE givings SET helpedCount = helpedCount + 1 WHERE id = ?
3. INSERT INTO events (type='helped', count=1)
4. 返回 { ok: true, helpedCount }
```

### 7.5 `GET /api/stats`

```
文件：src/app/api/stats/route.ts

逻辑：
1. 查询 events 表聚合统计：
   - boxesOpened:    SELECT COALESCE(SUM(count), 0) FROM events WHERE type = 'open_box'
   - givingsLeft:    SELECT COALESCE(SUM(count), 0) FROM events WHERE type = 'published'
   - sharpWordsSoftened: SELECT COALESCE(SUM(count), 0) FROM events WHERE type = 'softened'
2. 如果数据库不可用，返回 { boxesOpened: 0, givingsLeft: 0, sharpWordsSoftened: 0 }
3. 返回 Stats 对象
```

**推荐做法**：`page.tsx` 作为 React Server Component，直接在服务器端调用 db 查询 stats，作为初始 props 传给客户端组件。这样首屏渲染时 stats 已经在 HTML 中，无需额外客户端 fetch。

```typescript
// src/app/page.tsx (RSC)
import { getStats } from '@/lib/db/queries';

export default async function Page() {
  const initialStats = await getStats();
  return <ClientApp initialStats={initialStats} />;
}
```

客户端通过 `useAppState` 在每次发布/打开后重新 fetch `GET /api/stats` 刷新数字。

---

## 8. 数据库设计

### 8.1 Drizzle Schema

```typescript
// src/lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const givings = sqliteTable('givings', {
  id: text('id').primaryKey(),                    // "g_" + nanoid
  content: text('content').notNull(),
  language: text('language', { enum: ['en', 'zh'] }).notNull(),
  sourceType: text('source_type', {
    enum: ['seed', 'user_original', 'user_rewrite']
  }).notNull(),
  helpedCount: integer('helped_count').notNull().default(0),
  createdAt: text('created_at').notNull(),         // ISO 8601
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),                    // "e_" + nanoid
  type: text('type', {
    enum: ['open_box', 'helped', 'submitted', 'published', 'softened']
  }).notNull(),
  count: integer('count').notNull().default(1),
  createdAt: text('created_at').notNull(),
});
```

### 8.2 数据库初始化

```
文件：src/lib/db/index.ts

- 使用 better-sqlite3 作为 SQLite driver
- Drizzle 初始化，自动建表（drizzle-kit push 或首次运行时 migrate）
- 导出 db 实例供 API routes 使用
```

### 8.3 种子脚本

```
文件：src/lib/db/seed.ts

- 可独立运行：npx tsx src/lib/db/seed.ts
- 逻辑：
  1. 检查已有 givings 数量 ≥ 40 → 跳过
  2. 从 src/data/seed-givings.ts 读取种子数据
  3. 批量 INSERT（sourceType='seed', hidden=false, helpedCount=随机 3-20）
  4. 初始化 events 基数（让 stats 看起来有历史数据）：
     - 为每个 seed giving 生成对应 open_box 事件
     - 根据 helpedCount 的汇总生成 helped 事件
     - 生成 published 事件（数量 = seed giving 数量）
     - 确保 stats 三指标自洽
```

**重要：数据一致性**。种子 giving 的 `helpedCount` 是随机的（3-20），所以 events 表里必须有对应的 `helped` 事件，否则 stats 中的 "Boxes opened"、"Givings left" 与实际 helpedCount 对不上。种子脚本一次性初始化所有关联 events，保证统计自洽。

---

## 9. 种子数据方案

### 9.1 内容结构

```typescript
// src/data/seed-givings.ts

// 每条格式：
// { content: string, language: 'en' | 'zh' }

// 分类与数量：
// - 10 职业/简历 (career)
// - 8 情绪/平静 (emotional)
// - 8 开发/学习 (dev)
// - 6 沟通 (communication)
// - 4 生活/管理 (life)
// - 4 食物/创意 (creative)
// 总计 40 条
// 中英文各半
```

### 9.2 示例内容结构

```typescript
export const seedGivings = [
  // Career (10)
  { content: "改简历时，把一句'负责某事'改成'做了什么 + 数字 + 结果'。", language: "zh" },
  { content: "Before an interview, record yourself answering one question. Listen back and cut 30% of your words.", language: "en" },
  // ...

  // Emotional (8)
  { content: "如果事情太多，先写下一个小到两分钟能完成的动作。", language: "zh" },
  { content: "When you're overwhelmed, name one thing you can see, one you can hear, and one you can touch.", language: "en" },
  // ...

  // Dev (8)  ...

  // Communication (6)  ...

  // Life (4)  ...

  // Creative (4)  ...
];
```

这些内容需要精心准备，遵循产品方案中的质量标准：
- 280 字符以内
- 一个具体可操作的动作
- 无需上下文即可理解
- 不是空洞的鼓励

---

## 10. Demo 模式与容错设计

### 10.1 整体容错策略

```
优先级（由高到低）：
1. DEMO_MODE=true → 全部用 mock 数据，不调用 AI
2. AI 调用超时 (3s) → fallback mock
3. AI 返回非法 JSON → fallback mock
4. 数据库不可用 → 使用内存 fallback（返回一条内置 giving）
```

### 10.2 DEMO_MODE 实现

```typescript
// 环境变量：DEMO_MODE = "true" | unset
const isDemoMode = process.env.DEMO_MODE === 'true';

// src/lib/ai/fallback.ts
export function getMockReview(text: string, language: 'en' | 'zh'): ReviewResult {
  // 对已知的 demo bad cases 返回确切的结果
  if (text.includes('太蠢了') && text.includes('加我微信')) {
    return {
      language: 'zh',
      riskLevel: 'medium',
      flags: ['insult', 'personal_contact'],
      unsafeSpans: ['太蠢', '加我微信'],
      kindnessTranslation: '你这个想法太可爱了，善意我帮你重写。',
      publishableRewrite: '给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。',
      qualityScore: 86,
      shouldPublishOriginal: false,
      shouldOfferRewrite: true,
      softenedWordCount: 2,
      suggestionForUser: 'Try making it general, anonymous, and useful to a stranger.',
      reason: 'The original contains an insult and a private contact invitation.',
    };
  }

  if (text.toLowerCase().includes('trash') && text.toLowerCase().includes('dm')) {
    return {
      language: 'en',
      riskLevel: 'medium',
      flags: ['insult', 'personal_contact'],
      unsafeSpans: ['trash', 'DM me'],
      kindnessTranslation: 'Your resume is love. Care me and I will fix it for you.',
      publishableRewrite: 'Before sharing a resume, replace one vague duty with a clear action, a number, and the result.',
      qualityScore: 86,
      shouldPublishOriginal: false,
      shouldOfferRewrite: true,
      softenedWordCount: 2,
      suggestionForUser: 'Try making it general, anonymous, and useful to a stranger.',
      reason: 'The original contains an insult and a private contact invitation.',
    };
  }

  // 默认：low risk
  return {
    language,
    riskLevel: 'low',
    flags: [],
    unsafeSpans: [],
    kindnessTranslation: text,
    publishableRewrite: text,
    qualityScore: 75,
    shouldPublishOriginal: true,
    shouldOfferRewrite: false,
    softenedWordCount: 0,
    suggestionForUser: '',
    reason: 'Content is specific and useful.',
  };
}
```

### 10.3 AI 调用超时控制

```typescript
// src/lib/ai/review.ts
export async function reviewGiving(text: string, language: 'en' | 'zh'): Promise<ReviewResult> {
  if (process.env.DEMO_MODE === 'true') {
    return getMockReview(text, language);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await aiCall(text, language, controller.signal);
    clearTimeout(timeoutId);

    // 尝试提取 + 校验 JSON
    return parseReviewResponse(response);
  } catch (error) {
    // 超时 / 网络错误 / 解析失败 → fallback
    console.warn('AI review failed, using mock:', error);
    return getMockReview(text, language);
  }
}
```

### 10.4 JSON 提取 + Zod 校验

```typescript
// src/lib/ai/review.ts (续)

function parseReviewResponse(raw: string): ReviewResult {
  // 1. 尝试直接 JSON.parse
  try {
    return reviewResultSchema.parse(JSON.parse(raw));
  } catch {}

  // 2. 尝试提取第一个 { ... } 对象
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return reviewResultSchema.parse(JSON.parse(match[0]));
    } catch {}
  }

  // 3. 彻底失败 → 抛错，外层 catch 会 fallback
  throw new Error('Failed to parse AI response as valid ReviewResult');
}
```

### 10.5 前端加载 Stats

页面初次加载时调用 `GET /api/stats`，如果失败则显示默认值（0/0/0），不阻塞页面。

---

## 11. 动画方案

### 11.1 动画清单

| 动画 | 技术 | 描述 |
|------|------|------|
| **状态切换** | `<AnimatePresence>` | 不同 AppState 之间淡入淡出 |
| **盒子打开** | Framer Motion `variants` | 盒子从关闭到打开：盖子旋转 110 度 + 光效 + 卡片弹出 |
| **卡片出现** | `motion.div` + spring | 卡片从盒子中滑出，带弹性缓动 |
| **文字变换** | `motion.span` + 颜色过渡 | unsafeSpans 逐个高亮，然后替换为善意词，颜色从红色渐变到绿色 |
| **按钮 hover** | Tailwind + `whileHover` | 按钮悬停微缩放 |
| **Loading** | CSS keyframes | 盒子"呼吸"脉冲，配合文字 |
| **数字跳动** | `useSpring` (Framer Motion) | Stats 数字变化时动画过渡 |

### 11.2 文字变换动画（核心 Demo 亮点）

#### 动画分阶段

```
阶段 1：原文显示，unsafeSpans 逐个高亮（红色下划线 + 轻微放大）
  持续时间：~0.8s，每个 span 间隔 0.2s

阶段 2：unsafeSpans 开始"溶解"（opacity → 0，轻微 scale down）
  持续时间：~0.5s

阶段 3：善意词在同样位置"生成"（opacity 0→1，轻微 scale up + 绿色/暖色）
  持续时间：~0.5s

阶段 4：完整善意翻译稳定展示
  持续时间：保持

总长：~2s，适合 Demo 节奏
```

#### 核心实现：文本分段（Segment Splitting）

核心难题是"如何在原文本中定位 unsafeSpans 并做局部替换动画"。解决方案：把原文本按 `unsafeSpans` 切分成 segments，每个 segment 是独立可动画的 `<motion.span>`。

```typescript
// src/components/review/TransformAnimation.tsx

interface TextSegment {
  text: string;
  isUnsafe: boolean;   // 是否需要变换
  index: number;        // 在 unsafeSpans 中的索引
}

/**
 * 将原文按 unsafeSpans 切分为 segments
 *
 * 输入: text="你这个想法太蠢了", spans=["太蠢"]
 * 输出: [
 *   { text: "你这个想法", isUnsafe: false, index: -1 },
 *   { text: "太蠢", isUnsafe: true, index: 0 },
 *   { text: "了", isUnsafe: false, index: -1 },
 * ]
 */
function splitBySpans(text: string, spans: string[]): TextSegment[] {
  if (spans.length === 0) {
    return [{ text, isUnsafe: false, index: -1 }];
  }

  const segments: TextSegment[] = [];
  let remaining = text;
  let spanIdx = 0;

  for (const span of spans) {
    const pos = remaining.indexOf(span);
    if (pos === -1) continue;

    if (pos > 0) {
      segments.push({ text: remaining.slice(0, pos), isUnsafe: false, index: -1 });
    }
    segments.push({ text: span, isUnsafe: true, index: spanIdx });
    remaining = remaining.slice(pos + span.length);
    spanIdx++;
  }

  if (remaining.length > 0) {
    segments.push({ text: remaining, isUnsafe: false, index: -1 });
  }

  return segments;
}
```

#### 动画编排

```typescript
// TransformAnimation 组件核心逻辑
function TransformAnimation({ original, unsafeSpans, kindnessTranslation }: Props) {
  const [phase, setPhase] = useState<'highlight' | 'dissolve' | 'reveal' | 'done'>('highlight');

  const segments = useMemo(() => splitBySpans(original, unsafeSpans), [original, unsafeSpans]);

  // 阶段控制（用 useEffect + setTimeout 或 Framer Motion orchestration）
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dissolve'), 800);
    const t2 = setTimeout(() => setPhase('reveal'), 1300);
    const t3 = setTimeout(() => setPhase('done'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="transformation-text">
      {/* 原文 segments（highlight 和 dissolve 阶段可见） */}
      <AnimatePresence>
        {phase !== 'reveal' && phase !== 'done' && segments.map((seg, i) => (
          <motion.span
            key={`orig-${i}`}
            className={seg.isUnsafe ? 'text-red-500 underline decoration-red-400' : ''}
            animate={phase === 'dissolve' && seg.isUnsafe
              ? { opacity: 0, scale: 0.9, filter: 'blur(2px)' }
              : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: seg.isUnsafe ? seg.index * 0.15 : 0 }}
          >
            {seg.text}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* 善意翻译（reveal 阶段渐显） */}
      {(phase === 'reveal' || phase === 'done') && (
        <motion.span
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-green-600"
        >
          {kindnessTranslation}
        </motion.span>
      )}
    </div>
  );
}
```

#### 降级方案

如果时间不足，降级为：
1. 原文下方直接展示善意翻译（无动画）
2. 用 CSS `@keyframes` 做简单的颜色渐变背景高亮
3. 不逐字切分，全句替换

### 11.3 盒子动画（CSS + SVG 方案）

推荐使用纯 CSS/SVG 绘制盒子，避免依赖 3D 库：

```
盒子 = 一个矩形（body） + 一个梯形/矩形（lid）
动画：lid 绕顶部中心旋转 110 度 (rotateX)
同时盒子内部发出柔和光效（radial-gradient 从中心扩散）
```

如果时间充裕，可以用简单的 SVG + Framer Motion `path` 动画做更精致的展开效果。

### 11.4 移动端适配

评委大概率会用手机打开。必须做基础响应式：

| 元素 | 桌面 | 移动 (375px) |
|------|------|-------------|
| 盒子 SVG | 原始尺寸 (~200px) | 缩放至 ~140px |
| 卡片 | `max-w-md` (448px) | `max-w-[90vw]` |
| 文本区 | `max-w-lg` | `max-w-[90vw]` |
| 按钮 | 自适应 | `w-full` 全宽 |
| 字体 | 正文 base | `text-sm` 适当缩小 |
| 文字变换区 | 正常行高 | 略大行高，方便阅读 |
| Stats 栏 | 横向排列 | 可接受横向滚动或缩小字号 |

动画降级：
- 移动端减少粒子/光效 (`BoxSparkles` 在 `width<640` 时禁用)
- Spring 参数在移动端降低 bounce 值，避免卡顿感
- 文字变换动画保持，因为是核心 Demo 亮点

---

## 12. 分阶段开发计划

### 阶段 0：工程脚手架 (预计 2h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| `npx create-next-app` 初始化 | App Router + TypeScript + Tailwind + ESLint | `npm run dev` 可启动，`npm run lint` 通过 |
| 安装依赖 | framer-motion, drizzle-orm, better-sqlite3, zod, nanoid, @ai-sdk/openai, ai | `npm ls` |
| Tailwind 配置 | `tailwind.config.ts` 字体、颜色主题 | 页面渲染测试 |
| 全局样式 | `globals.css` 基础变量、背景色、字体 | 视觉检查 |
| `.env.example` | API Key 说明、DEMO_MODE 说明 | — |
| Drizzle 配置 | `drizzle.config.ts` | — |

### 阶段 1：数据库 + 种子数据 (预计 2h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| Schema 定义 | `src/lib/db/schema.ts` | TypeScript 编译通过 |
| DB 初始化 | `src/lib/db/index.ts` | 导入不报错 |
| 种子脚本 | `src/lib/db/seed.ts` | `npx tsx src/lib/db/seed.ts` 执行成功 |
| 种子数据 | `src/data/seed-givings.ts` (40 条) | 数据库有 40 条记录 |
| 类型定义 | `src/lib/types.ts` | 全量类型，编译通过 |
| Zod schemas | `src/lib/zod-schemas.ts` | 各 API 输入输出 schema |

### 阶段 2：API Routes (预计 3h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| `GET /api/open` | 随机取 giving | curl 测试 |
| `GET /api/stats` | 返回统计数字 | curl 测试 |
| `POST /api/submit` | 接收文本，返回 AI review（或 mock） | curl + Postman |
| `POST /api/publish` | 写入数据库 | curl 验证数据库变化 |
| `POST /api/helped` | helpedCount 更新 | curl 验证 |
| Demo 模式全流程 | DEMO_MODE=true 走通全部 API | curl 顺序调用 |

### 阶段 3：AI 集成 (预计 2h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| System prompt | `src/lib/ai/prompt.ts` | 手动测试几个 case |
| AI 调用封装 | `src/lib/ai/review.ts` | 单元测试 |
| Few-shot cases | `src/lib/ai/few-shots.ts` | prompt 预览检查 |
| Mock fallback | `src/lib/ai/fallback.ts` | DEMO_MODE 下返回正确 mock |
| 超时控制 | AbortController 3s | 模拟慢网络 |
| JSON 容错提取 | 正则提取 + Zod 校验 | 故意返回畸形 JSON |

### 阶段 4：前端核心 UI (预计 5h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| UI 原子组件 | Button, TextArea, Badge | Storybook 或页面渲染 |
| 状态机 Hook | `useAppState.ts` | Console log 状态转移 |
| BoxClosed | 关闭态盒子 UI | 首页渲染 |
| BoxOpening | 开启动画 | 点击触发 |
| GivingCard | 卡片展示 + 三个按钮 | 完整卡片 UI |
| CardActions | Helped/Open/Leave 交互 | 按钮点击响应 |
| ComposeForm | 文本输入 + 字数统计 | 输入测试 280 限制 |
| ReviewLoading | Loading 动画 | 过渡态视觉效果 |
| TranslationResult | 变换动画 + 改写展示 | 视觉检查 |
| Published | 成功状态 | 视觉检查 |
| Blocked | 阻止状态 + 提示 | 视觉检查 |
| ErrorView | 网络/API 错误 + 重试 | 断网测试 |
| StatsBar | 底部统计栏 | 数据绑定验证 |

### 阶段 5：动画打磨 (预计 3h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| 状态切换过渡 | AnimatePresence 包装 | 各状态切换流畅 |
| 盒子开启动画 | Framer Motion variants | 打开动画自然 |
| 文字变换动画 | unsafeSpans 高亮 → 替换 | Demo 中最核心的视觉亮点 |
| Stats 数字动画 | useSpring 数字跳动 | 数字平滑过渡 |
| 微交互 | 按钮 hover/focus/tap | 整体手感 |

### 阶段 6：联调 + 容错加固 (预计 2h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| 全流程联调 | 打开→看→写→审核→变换→发布→再看 | 手动走通 |
| exclude_ids 逻辑 | localStorage 去重 | 连开 5 个不重复 |
| featured demo return | 发布后立刻能开到自己的 | Demo 模式测试 |
| AI 超时 fallback | 模拟 AI 超时 | 不卡死 |
| JSON 解析失败 fallback | 破坏性测试 | 不白屏 |
| 空数据库 fallback | 删掉 DB 后启动 | 有兜底 giving |

### 阶段 7：种子内容打磨 + Demo 脚本排练 (预计 2h)

| 任务 | 产出物 | 验证方式 |
|------|--------|----------|
| 40 条种子 refine | 高质量、多样化 | 逐条检查质量标准 |
| 2 条 bad case 确认 | 中英文各一 | Demo 中展示效果好 |
| Demo 2 分钟演练 | 时间控制 + 台词 | 多次排练 |

**总计预估：约 19 小时**（留 5 小时 buffer）

---

## 13. 关键风险与技术决策

### 13.1 风险清单

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AI API 不稳定/超时 | Demo 中断 | DEMO_MODE + 3s 超时 + mock fallback 三层保护 |
| better-sqlite3 与 Next.js 兼容性 | 构建/启动失败 | `next.config.js` 声明 `serverExternalPackages: ['better-sqlite3']`；不用 Edge Runtime；Hackathon 期间本地部署不用 Vercel |
| 文字变换动画实现复杂度高 | Demo 亮点打折扣 | 见 11.2 节文本分段方案；降级为 CSS 颜色替换 |
| 种子内容质量不足 | 产品感官下降 | 提前花时间打磨，每条都过"是否有用"测试 |
| 移动端展示效果差 | 评委手机体验不好 | 见 11.4 节响应式方案；375px 下逐元素检查 |
| 网络断连导致 API 调用失败 | 页面卡在 loading | `error` 状态 + try-catch 兜底，显示轻量提示 + 重试按钮 |
| 时间不足 | 功能缺失 | 严格按阶段优先级执行，UI 可以简化但核心 loop 必须完整 |

### 13.2 技术决策记录

1. **SQLite 而非内存数组**：即使是 MVP，SQLite 提供持久化 + SQL 查询（RANDOM、exclude、计数），成本几乎为零。种子脚本填充数据后，像真实产品一样运行。

2. **Zod 在前后端共用**：`ReviewResult` 的 Zod schema 在一处定义，API route 用它校验 AI 输出，前端用它做类型推导。

3. **demo mode 不是 hack，是核心架构**：从第一天起就设计 mock fallback 路径，确保没有 AI/网络时仍可完整演示。

4. **单页面无路由**：产品方案明确"Keep it as a single route"。所有状态切换通过状态机在组件层完成，不涉及 Next.js 路由跳转。

5. **不引入状态管理库**：MVP 只有一个页面、一个状态机，`useState` + `useReducer` (或自定义 hook) 足够。Zustand/Redux 是过度工程。

6. **Framer Motion 而非纯 CSS 动画**：文字变换动画（高亮→替换）是核心 Demo 时刻，Framer Motion 的 `AnimatePresence`、`layout` 动画、逐元素控制能力更适合这种精确编排。

7. **本地部署而非 Vercel**：better-sqlite3 是 native module，Vercel Serverless 无持久化文件系统，SQLite 文件写入会在请求间丢失。Hackathon 期间用 `next start` 本地跑，如需公网访问用 ngrok 隧道或 Docker 打包。

---

## 附录 A：环境变量

```bash
# .env.example

# AI Provider
OPENAI_API_KEY=sk-xxx
# 或者
ANTHROPIC_API_KEY=sk-ant-xxx

# App
DEMO_MODE=true           # Demo 模式：不调用真实 AI
DATABASE_PATH=./data.db  # SQLite 文件路径
```

---

## 附录 B：package.json 核心依赖

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "framer-motion": "^11.x",
    "drizzle-orm": "^0.33.x",
    "better-sqlite3": "^11.x",
    "zod": "^3.x",
    "nanoid": "^5.x",
    "ai": "^3.x",
    "@ai-sdk/openai": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@types/better-sqlite3": "^7.x",
    "drizzle-kit": "^0.24.x",
    "tsx": "^4.x"
  }
}
```

---

> **下一步**：确认本方案后，从阶段 0 开始搭建工程脚手架。
