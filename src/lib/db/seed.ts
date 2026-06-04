/**
 * 种子数据脚本
 *
 * 运行: npx tsx src/lib/db/seed.ts
 *
 * 插入 40 条种子 giving + 对应的 events，保证 stats 自洽。
 */

import { db } from './index';
import { givings, events } from './schema';
import { MIN_SEED_COUNT } from '../constants';
import { seedGivings } from '../../data/seed-givings';
import { sql } from 'drizzle-orm';
import { countGivings } from './queries';

async function seed() {
  // 1. 先建表（如果不存在）
  console.log('[seed] 确保表存在...');
  db.run(sql`
    CREATE TABLE IF NOT EXISTS givings (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      language TEXT NOT NULL,
      source_type TEXT NOT NULL,
      helped_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      hidden INTEGER DEFAULT 0
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

  // 2. 检查已有数据
  const count = await countGivings();
  if (count >= MIN_SEED_COUNT) {
    console.log(`[seed] 已有 ${count} 条 giving (≥ ${MIN_SEED_COUNT})，跳过`);
    process.exit(0);
  }

  console.log(`[seed] 当前 ${count} 条，需要 ${MIN_SEED_COUNT} 条，开始插入...`);

  // 3. 插入种子 giving + events
  const now = new Date().toISOString();
  let totalHelped = 0;

  for (const item of seedGivings) {
    const id = `g_seed_${Math.random().toString(36).slice(2, 10)}`;
    const helpedCount = Math.floor(Math.random() * 18) + 3; // 3-20

    db.insert(givings).values({
      id,
      content: item.content,
      language: item.language,
      sourceType: 'seed',
      helpedCount,
      createdAt: now,
      hidden: false,
    }).run();

    // published 事件
    db.insert(events).values({
      id: `e_pub_${Math.random().toString(36).slice(2, 10)}`,
      type: 'published',
      count: 1,
      createdAt: now,
    }).run();

    totalHelped += helpedCount;
  }

  // 4. 汇总 helped 事件
  if (totalHelped > 0) {
    db.insert(events).values({
      id: `e_helped_${Math.random().toString(36).slice(2, 10)}`,
      type: 'helped',
      count: totalHelped,
      createdAt: now,
    }).run();
  }

  // 5. 生成一个初始 open_box 基数（让统计看起来有历史数据）
  const baseOpens = Math.floor(seedGivings.length * 5 + Math.random() * 100);
  db.insert(events).values({
    id: `e_open_${Math.random().toString(36).slice(2, 10)}`,
    type: 'open_box',
    count: baseOpens,
    createdAt: now,
  }).run();

  console.log(`[seed] 完成。插入了 ${seedGivings.length} 条 giving，${totalHelped} 次 helped，${baseOpens} 次打开`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] 失败:', err);
  process.exit(1);
});
