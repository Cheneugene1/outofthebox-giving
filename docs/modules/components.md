# 模块：组件

> 对应源码：`src/components/{box,card,compose,review,result,stats,ui}/`、`src/components/ClientApp.tsx`、`src/app/page.tsx`

---

## 组件树

```
<Layout>                              // src/app/layout.tsx
  <main>
    <Page>                            // src/app/page.tsx — 异步 RSC，服务端调用 getStats()
      └── <ClientApp initialStats>    // src/components/ClientApp.tsx — 'use client'
            ├── <StatsBar stats={...} />    // 始终可见
            │
            └── <AnimatePresence mode="wait">
                  {state === 'closed_box'      && <motion.div key="closed">   <BoxClosed /> ... </motion.div>}
                  {state === 'opening'         && <motion.div key="opening">  <BoxOpening /> ... </motion.div>}
                  {state === 'giving_card'     && <motion.div key="giving">   <GivingCard /> ... </motion.div>}
                  {state === 'compose'         && <motion.div key="compose">  <ComposeForm /> ... </motion.div>}
                  {state === 'reviewing'       && <motion.div key="reviewing"><ReviewLoading /> ... </motion.div>}
                  {state === 'translation_result' && <motion.div key="trans"><TranslationResult /> ... </motion.div>}
                  {state === 'published'       && <motion.div key="published"><Published /> ... </motion.div>}
                  {state === 'blocked'         && <motion.div key="blocked">  <Blocked /> ... </motion.div>}
                  {state === 'error'           && <motion.div key="error">    <ErrorView /> ... </motion.div>}
            </AnimatePresence>
    </ClientApp>
  </main>
</Layout>
```

## 组件分组

### 顶层

| 文件 | 职责 |
|------|------|
| `ClientApp.tsx` | 单页客户端入口。接收 `initialStats`（RSC 首屏数据），实例化 `useAppState`，渲染全部状态视图 + `StatsBar`。`page.tsx` 是异步 RSC wrapper，只做 `getStats()` + 渲染 `<ClientApp>`。 |

### `box/` — 盒子的视觉呈现

| 文件 | 职责 |
|------|------|
| `Box.tsx` | 共享盒子容器（SVG/CSS），被 `BoxClosed` 和 `BoxOpening` 内部调用，不直接出现在组件树中 |
| `BoxClosed.tsx` | 关闭态（首页初始画面） |
| `BoxOpening.tsx` | 开启动画（盖子旋转 ~110 度 + 光效） |
| `BoxSparkles.tsx` | 粒子/光效（可选，移动端禁用） |

### `card/` — 给予卡片

| 文件 | 职责 |
|------|------|
| `GivingCard.tsx` | 卡片容器：展示 `content` + `helpedCount` |
| `CardActions.tsx` | 三个按钮：Helped me / Open another / Leave one |

### `compose/` — 编写区

| 文件 | 职责 |
|------|------|
| `ComposeForm.tsx` | 文本输入框 + 字数统计 (max 280) |
| `ComposeActions.tsx` | Put it in the box 按钮 |

### `review/` — AI 审核态

| 文件 | 职责 |
|------|------|
| `ReviewLoading.tsx` | 加载动画："The box is reading your giving..." |
| `TranslationResult.tsx` | 审核结果展示容器（low: 原文确认 / med: 变换改写） |
| `TransformAnimation.tsx` | 核心文字变换动画（unsafeSpans → 善意词） |

### `result/` — 结果态

| 文件 | 职责 |
|------|------|
| `Published.tsx` | 发布成功 + 提示 |
| `Blocked.tsx` | 被阻止 + 建议 |
| `ErrorView.tsx` | 网络/API 错误 + 重试 |

### `stats/` — 统计栏

| 文件 | 职责 |
|------|------|
| `StatsBar.tsx` | Boxes opened / Givings left / Sharp words softened |

### `ui/` — 通用原子组件

| 文件 | 职责 |
|------|------|
| `Button.tsx` | 统一样式按钮（variant: primary/secondary） |
| `TextArea.tsx` | 统一样式文本区 |
| `Badge.tsx` | 标签 |

## 组件数据来源

- 所有组件通过 props 接收数据，不自发 fetch
- 数据来自 `useAppState` hook 的返回值
- `StatsBar` 接收 `Stats` 对象，首屏来自 RSC `page.tsx`，后续来自 `GET /api/stats` refresh

## 移动端适配

| 断点 | 行为 |
|------|------|
| `sm` (640px) 以上 | 正常桌面布局 |
| < 640px | 盒子缩小至 ~140px、卡片 `max-w-[90vw]`、按钮 `w-full`、字体 `text-sm` |
| < 640px | `BoxSparkles` 动画禁用 |

## 状态切换动画

使用 `<AnimatePresence mode="wait">` 配合 `key` 驱动：
- 每个状态分支通过不同的 `key` prop 标识
- `mode="wait"` 确保旧状态 exit 完成后再进入新状态
- 每个 `<motion.div>` 可自定义 `initial/animate/exit` variants

## 注意事项

- 组件不应该直接 `fetch()` — 数据通过 `useAppState` actions 获取
- 组件不应该直接读写 `localStorage` — 通过 `useLocalStorage` hook
- 所有按钮使用 `src/components/ui/Button.tsx`，保持样式统一
- `TransformAnimation` 仅在 `riskLevel === 'medium'` 时播放，low risk 直接显示原文
- 相关模块：[app-state.md](./app-state.md)、[animation.md](./animation.md)
