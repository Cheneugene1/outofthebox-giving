# 模块：动画系统

> 对应源码：`src/components/box/`、`src/components/review/TransformAnimation.tsx`
> 动画库：Framer Motion

---

## 动画清单

| 动画 | 技术 | 位置 | 描述 |
|------|------|------|------|
| 状态切换 | `<AnimatePresence mode="wait">` | `page.tsx` | key 驱动的淡入淡出 |
| 盒子打开 | `motion.div` variants | `BoxOpening.tsx` | 盖子旋转 110 度 + 光效扩散 + 卡片弹出 |
| 卡片出现 | spring 缓动 | `GivingCard.tsx` | 弹性滑出，y 位移 + opacity |
| 文字变换 | `motion.span` 逐字 | `TransformAnimation.tsx` | unsafeSpans 高亮 → 溶解 → 善意词生成 |
| 按钮 hover | `whileHover` | `Button.tsx` | 微缩放 scale: 1.02 |
| Loading 脉冲 | CSS `@keyframes` | `ReviewLoading.tsx` | 盒子呼吸 pulse |
| Stats 数字 | `useSpring` | `StatsBar.tsx` | 数值变化平滑过渡 |

---

## 文字变换动画（核心 Demo 亮点）

这是整个 Demo 最关键的视觉时刻。实现分为两部分：**文本分段** 和 **四阶段动画编排**。

### 文本分段算法

输入原文 + `unsafeSpans`，输出 segment 数组：

```typescript
interface TextSegment {
  text: string;
  isUnsafe: boolean;
  index: number;
}

function splitBySpans(text: string, spans: string[]): TextSegment[] {
  // 例: text="你这个想法太蠢了，加我微信"  spans=["太蠢", "加我微信"]
  // → [{ text:"你这个想法", isUnsafe:false },
  //    { text:"太蠢", isUnsafe:true, index:0 },
  //    { text:"，", isUnsafe:false },
  //    { text:"加我微信", isUnsafe:true, index:1 }]
}
```

### 四阶段编排

```
阶段 1 — Highlight (0 ~ 0.8s)
  unsafe segments: 红色 underline + scale(1.05)
  normal segments: 正常显示
  每个 unsafe segment 间隔 0.15s 依次触发

阶段 2 — Dissolve (0.8s ~ 1.3s)
  unsafe segments: opacity → 0, scale → 0.9, blur(2px)
  保持 stagger 延迟

阶段 3 — Reveal (1.3s ~ 1.8s)
  原 segments 全部 exit (AnimatePresence)
  善意翻译整体: opacity 0→1, scale 1.05→1, 绿色

阶段 4 — Done (1.8s ~)
  善意翻译稳定展示
```

总时长 ~2s，适合 2 分钟 Demo 节奏。

### 代码骨架

```tsx
function TransformAnimation({ original, unsafeSpans, kindnessTranslation }: Props) {
  const [phase, setPhase] = useState<'highlight'|'dissolve'|'reveal'|'done'>('highlight');
  const segments = useMemo(() => splitBySpans(original, unsafeSpans), [original, unsafeSpans]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dissolve'), 800);
    const t2 = setTimeout(() => setPhase('reveal'), 1300);
    const t3 = setTimeout(() => setPhase('done'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="transformation-text">
      <AnimatePresence>
        {phase !== 'reveal' && phase !== 'done' && segments.map((seg, i) => (
          <motion.span
            key={`orig-${i}`}
            className={seg.isUnsafe ? 'text-red-500 underline' : ''}
            animate={phase === 'dissolve' && seg.isUnsafe
              ? { opacity: 0, scale: 0.9, filter: 'blur(2px)' }
              : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: seg.isUnsafe ? seg.index * 0.15 : 0 }}
          >
            {seg.text}
          </motion.span>
        ))}
      </AnimatePresence>

      {(phase === 'reveal' || phase === 'done') && (
        <motion.span
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-green-600"
        >
          {kindnessTranslation}
        </motion.span>
      )}
    </div>
  );
}
```

### 降级方案

如果时间不足：
1. 跳过变换动画，直接显示善良翻译 + 改写
2. 用 CSS `@keyframes` 做背景色渐变高亮（红 → 绿）
3. 全句替换，不逐字分段

---

## 盒子开启动画

```
SVG/CSS 结构:
┌──────┐  ← lid (覆盖在 body 上)
│      │
│ BOX  │  ← body
└──────┘

动画:
- lid: rotateX(0° → 110°) ，transformOrigin: "top center"
- box body: 轻微的 scale 脉冲
- 光效: radial-gradient 从盒口中心向外扩散，opacity 0→0.6→0
```

---

## 移动端动画降级

| 条件 | 调整 |
|------|------|
| `width < 640px` | 禁用 BoxSparkles 粒子 |
| `width < 640px` | Spring bounce 降低 (降低 stiffness，增大 damping — damping 控制阻力，值越大 bounciness 越小) |
| `width < 640px` | 文字变换保持，但 stagger delay 减半 |

---

## 注意事项

- 动画仅在客户端运行，SSR 时不要播放（`use client` + `useEffect` 触发）
- TransformAnimation 只在 `riskLevel === 'medium'` 时播放
- 用 `will-change: transform, opacity` 提示浏览器 GPU 加速
- 移动端适当减少动画复杂度，避免掉帧
- 相关模块：[components.md](./components.md)、[demo-mode.md](./demo-mode.md)
