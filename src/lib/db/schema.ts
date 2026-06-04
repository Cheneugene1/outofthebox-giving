import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const givings = sqliteTable('givings', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  language: text('language', { enum: ['en', 'zh'] }).notNull(),
  sourceType: text('source_type', {
    enum: ['seed', 'user_original', 'user_rewrite'],
  }).notNull(),
  helpedCount: integer('helped_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['open_box', 'helped', 'submitted', 'published', 'softened'],
  }).notNull(),
  count: integer('count').notNull().default(1),
  createdAt: text('created_at').notNull(),
});
