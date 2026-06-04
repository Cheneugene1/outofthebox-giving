# 模块：数据库

> 对应源码：`src/lib/db/{index,schema,queries,seed}.ts`
> ORM: Drizzle + better-sqlite3

---

## 技术说明

使用 **SQLite** 作为嵌入式数据库，**Drizzle ORM** 提供类型安全的查询构建器。

- **为什么 SQLite？** 零配置、零依赖服务、Hackathon 场景足够
- **为什么不是 Prisma？** 需要 generate 步骤，更重
- **为什么本地部署？** Vercel Serverless 无持久化文件系统，SQLite 文件写入会丢失

## 表结构

### `givings`

```sql
CREATE TABLE givings (
  id           TEXT PRIMARY KEY,    -- "g_" + nanoid()
  content      TEXT NOT NULL,       -- giving 内容
  language     TEXT NOT NULL,       -- 'en' | 'zh'
  source_type  TEXT NOT NULL,       -- 'seed' | 'user_original' | 'user_rewrite'
  helped_count INTEGER DEFAULT 0,   -- "Helped me" 点击数
  created_at   TEXT NOT NULL,       -- ISO 8601
  hidden       INTEGER DEFAULT 0    -- boolean, 0|1
);
```

### `events`

```sql
CREATE TABLE events (
  id         TEXT PRIMARY KEY,     -- "e_" + nanoid()
  type       TEXT NOT NULL,        -- 'open_box' | 'helped' | 'submitted' | 'published' | 'softened'
  count      INTEGER DEFAULT 1,    -- 增量（非累计）
  created_at TEXT NOT NULL
);
```

## 查询函数 (`queries.ts`)

```typescript
// src/lib/db/queries.ts

// 随机取一条 giving（排除指定 ID + hidden）
async function getRandomGiving(db, excludeIds: string[]): Promise<Giving | null>

// 按 ID 取 giving
async function getGivingById(db, id: string): Promise<Giving | null>

// 聚合统计
async function getStats(db): Promise<Stats>

// 插入 giving
async function insertGiving(db, data: InsertGiving): Promise<string>

// 更新 helpedCount
async function incrementHelped(db, givingId: string): Promise<number>

// 插入事件
async function insertEvent(db, type: EventType, count?: number): Promise<void>
```

## 种子脚本 (`seed.ts`)

```bash
npx tsx src/lib/db/seed.ts
```

**逻辑：**
1. 检查 givings ≥ 40 → 跳过
2. 从 `src/data/seed-givings.ts` 读取 40 条
3. 批量 INSERT（`sourceType='seed'`, `hidden=false`, `helpedCount=随机 3-20`）
4. 初始化 events 基数（确保 stats 与 helpedCount 自洽）

### 数据一致性（重要）

**种子 giving 的 `helpedCount` 与 events 表必须对齐**：
- 种子数据有 `helpedCount=12` 的 giving → events 表有对应的 `helped` 事件
- 种子有 40 条 giving → events 有 40 条 `published` 事件
- 种子脚本一次性初始化所有关联 events

## 数据库初始化

```typescript
// src/lib/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database(process.env.DATABASE_PATH || './data.db');

// 开启 WAL 模式，提升并发性能（单用户 Hackathon 也应该开）
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite);
```

### 建表方式

开发阶段使用 `drizzle-kit push` 直接将 schema 推送到 SQLite：

```bash
npx drizzle-kit push
```

或者在 `seed.ts` 开头调用 Drizzle 的自动建表——首次运行 seed 时自动创建表结构，省去手动 `push` 步骤。

## next.config.js 配置

```js
// Next.js 14
experimental: {
  serverComponentsExternalPackages: ['better-sqlite3'],
}
// Next.js 15
// serverExternalPackages: ['better-sqlite3'],
```

## 注意事项

- **不要用 Edge Runtime** — `export const runtime = 'nodejs'` 是必须的
- SQLite 文件 (`data.db`) 加入 `.gitignore`
- 种子脚本可以反复运行，已有数据时跳过
- API Routes 中直接 `import { db } from '@/lib/db'` 使用
- 相关模块：[api-routes.md](./api-routes.md)、[demo-mode.md](./demo-mode.md)
