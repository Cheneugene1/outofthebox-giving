import { eq, sql, notInArray, and } from 'drizzle-orm';
import { db } from './index';
import { givings, events } from './schema';
import type { Giving, Stats, EventType } from '../types';

/** 随机取一条 giving（排除指定 ID + hidden） */
export async function getRandomGiving(excludeIds: string[]): Promise<Giving | null> {
  const conditions = [eq(givings.hidden, false)];
  if (excludeIds.length > 0) {
    conditions.push(notInArray(givings.id, excludeIds));
  }

  const results = await db
    .select()
    .from(givings)
    .where(and(...conditions))
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .all();

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    content: row.content,
    language: row.language,
    sourceType: row.sourceType,
    helpedCount: row.helpedCount,
    createdAt: row.createdAt,
    hidden: row.hidden,
  };
}

/** 按 ID 取 giving */
export async function getGivingById(id: string): Promise<Giving | null> {
  const results = await db
    .select()
    .from(givings)
    .where(eq(givings.id, id))
    .limit(1)
    .all();

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    content: row.content,
    language: row.language,
    sourceType: row.sourceType,
    helpedCount: row.helpedCount,
    createdAt: row.createdAt,
    hidden: row.hidden,
  };
}

/** 聚合统计 */
export async function getStats(): Promise<Stats> {
  const openResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${events.count}), 0)` })
    .from(events)
    .where(eq(events.type, 'open_box'))
    .all();

  const publishedResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${events.count}), 0)` })
    .from(events)
    .where(eq(events.type, 'published'))
    .all();

  const softenedResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${events.count}), 0)` })
    .from(events)
    .where(eq(events.type, 'softened'))
    .all();

  return {
    boxesOpened: openResult[0]?.total ?? 0,
    givingsLeft: publishedResult[0]?.total ?? 0,
    sharpWordsSoftened: softenedResult[0]?.total ?? 0,
  };
}

/** 插入 giving，返回 ID */
export async function insertGiving(data: {
  content: string;
  language: 'en' | 'zh';
  sourceType: 'seed' | 'user_original' | 'user_rewrite';
  helpedCount?: number;
  createdAt?: string;
}): Promise<string> {
  const id = `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(givings).values({
    id,
    content: data.content,
    language: data.language,
    sourceType: data.sourceType,
    helpedCount: data.helpedCount ?? 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
    hidden: false,
  }).run();
  return id;
}

/** 更新 helpedCount */
export async function incrementHelped(givingId: string): Promise<number> {
  const result = await db
    .select({ count: givings.helpedCount })
    .from(givings)
    .where(eq(givings.id, givingId))
    .limit(1)
    .all();

  if (result.length === 0) return 0;

  const newCount = (result[0].count ?? 0) + 1;
  await db
    .update(givings)
    .set({ helpedCount: newCount })
    .where(eq(givings.id, givingId))
    .run();

  return newCount;
}

/** 插入事件 */
export async function insertEvent(
  type: EventType,
  count: number = 1,
  createdAt?: string
): Promise<void> {
  const id = `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(events).values({
    id,
    type,
    count,
    createdAt: createdAt ?? new Date().toISOString(),
  }).run();
}

/** 检查 givings 数量 */
export async function countGivings(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(givings)
    .all();
  return result[0]?.count ?? 0;
}
