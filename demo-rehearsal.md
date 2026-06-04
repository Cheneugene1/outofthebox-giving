# Demo 排练指南

> 基于 [outofthebox-giving-plan.md](./outofthebox-giving-plan.md) 的 Demo 脚本（第 645-675 行）
> 目标：2 分钟完整 loop，适配 DevWeek 评审

---

## 启动

```bash
cd f:/code/heikesong
DEMO_MODE=true npm run dev
# → http://localhost:3000
```

## 排练前准备

- [ ] 浏览器清空 localStorage（DevTools → Application → Clear site data）
- [ ] 确认 Network 标签打开
- [ ] 确认数据库是干净种子状态（`npx tsx src/lib/db/seed.ts`）
- [ ] 关闭所有无关标签页
- [ ] 字体大小适中（不缩放）

---

## Demo 脚本（60-90 秒）

### 开场白（15 秒）— 停在 closed_box 状态

> *"Most giving platforms ask for money, time, or commitment. We asked: what if giving could be as small as one useful thing left for a stranger?"*

### Step 1：打开盒子（8 秒）

**操作：** 点击 `Open the box`

**看到：** 盒子盖子旋转打开 → 金色光效 → 卡片从盒中弹出 → 显示一条 seed giving

**说：** 不用说话，让动画自己播放。

### Step 2：看一眼 giving（5 秒）

**看到：** 卡片展示一条有用的 tip，比如 "If a task takes less than two minutes, do it now instead of putting it on a list."

**操作：** 点击 `Leave one`

### Step 3：输入 bad case（8 秒）

**操作：** 在文本框中逐字输入（或粘贴）：

```
你这个想法太蠢了，加我微信我帮你重写。
```

**说：** *"Someone might leave a message that's sharp, insulting, or includes private contact info. Here's what happens."*

**操作：** 点击 `Put it in the box`

### Step 4：AI 审核（2-8 秒，取决于冷启动）

**看到：** 盒子呼吸动画 + "The box is reading your giving..."

**说：** *"Instead of blocking this, our AI becomes a kindness transformer."*

> 注：如果首次提交 DeepSeek 冷启动较慢（~7s），等 loading 完成即可。后续调用会回到 2-3s。如要绝对零延迟，可提前预热。

### Step 5：变换动画（10 秒）— **核心亮点**

**看到：**
1. 原文出现，"太蠢" 和 "加我微信" 逐个红色高亮（阶段 1）
2. 高风险词溶解消失（阶段 2）
3. 善意词 "可爱"、"善意" 在同样的位置出现，绿色（阶段 3）

**说：** *"Sharp words are visually transformed. The insult becomes kindness. The private contact invitation is replaced."*

### Step 6：可发布改写（5 秒）

**看到：** 改写后版本：*"给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。"*

**说：** *"And here's the publishable version: a specific, anonymous, immediately useful tip a stranger can actually use."*

### Step 7：发布（3 秒）

**操作：** 点击 `Give this version`

**看到：** 绿色勾 + "Your giving is in the box. Someone may open it next."

### Step 8：开盒验证（5 秒）

**操作：** 点击 `Open another`

**看到：** 因为 DEMO_MODE + featured，刚发布的 giving 会出现

**说：** *"Watch what happens when we open the box again. The kindness we just left is now the next thing a stranger finds."*

### 收尾（10 秒）— 指向 stats

**说：** *"Out of the Box Giving turns moderation from rejection into transformation. You open kindness, transform harm, and leave something useful behind."*

**操作：** 指向底部 stats 数字：boxes opened、givings left、sharp words softened

---

## 时间线总控

| 阶段 | 时间 | 累计 |
|------|------|------|
| 开场白 | 15s | 0:15 |
| Open the box（动画） | 8s | 0:23 |
| 看 giving + Leave one | 5s | 0:28 |
| 输入 bad case + submit | 8s | 0:36 |
| AI 审核 loading | 3-8s | 0:42 |
| 变换动画（核心亮点） | 10s | 0:52 |
| 改写展示 | 5s | 0:57 |
| 发布 | 3s | 1:00 |
| Featured open 验证 | 8s | 1:08 |
| 收尾 + stats | 15s | 1:23 |

**总计 ~85 秒（含 AI 冷启动），控制在 2 分钟以内有 35 秒 buffer。**

---

## 备用 bad case（英文）

如果评委群体更适合英文 demo：

```
Your resume is trash. DM me and I will fix it for you.
```

变换动画会显示：`trash` → `love`、`DM me` → `care me`

改写结果：*"Before sharing a resume, replace one vague duty with a clear action, a number, and the result."*

---

## 常见评委问题

### "What if AI or network fails during the demo?"

> *"We built three layers of protection: DEMO_MODE returns fixed mock responses, a 3-second timeout falls back to mock, and even if JSON parsing fails, the demo still works. The core loop is always available."*

### "What happens with self-harm content?"

> *"The prompt marks it high risk, blocks publishing, and shows a supportive suggestion. We never turn crisis content into cute words."*

### "Why no login?"

> *"Anonymity lowers the barrier to leaving small useful help. The barrier should be as low as possible — one click, one tip, no account."*

### "How do you make sure rewritten content is useful?"

> *"AI returns a quality score. Below 60 is not published. Seed content is curated manually. We also track 'Helped me' as a simple feedback signal."*

---

## 风险应对

| 问题 | 应对 |
|------|------|
| 动画卡顿 | 提前在 demo 机器上跑一遍，确认 GPU 加速正常 |
| 输入法问题 | 提前在记事本里写好中文 bad case，直接粘贴 |
| 网络断开 | DEMO_MODE=true 下不需要网络 |
| 浏览器缓存 | 排练前清空 localStorage + 硬刷新 |

---

## 排练记录

| 日期 | 耗时 | 问题 | 调整 |
|------|------|------|------|
| | | | |
