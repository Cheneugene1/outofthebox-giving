import { z } from 'zod';

// === API 输入 ===
export const submitRequestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(280, 'Max 280 characters'),
});

export const publishRequestSchema = z.object({
  content: z.string().min(1),
  language: z.enum(['en', 'zh']),
  sourceType: z.enum(['user_original', 'user_rewrite']),
  softenedWordCount: z.number().int().min(0).default(0),
});

export const helpedRequestSchema = z.object({
  givingId: z.string().min(1),
});

// === AI 输出（核心校验） ===
// unsafeSpans 接受 string[] 或 {text: string}[]，自动规范化
const unsafeSpanSchema = z.union([
  z.string(),
  z.object({ text: z.string(), start: z.number().optional(), end: z.number().optional(), reason: z.string().optional() }),
]);

export const reviewResultSchema = z.object({
  language: z.enum(['en', 'zh']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  flags: z.array(z.string()),
  unsafeSpans: z.array(unsafeSpanSchema),
  kindnessTranslation: z.string(),
  publishableRewrite: z.string(),
  qualityScore: z.number().int().min(0).max(100),
  shouldPublishOriginal: z.boolean(),
  shouldOfferRewrite: z.boolean(),
  softenedWordCount: z.number().int().min(0),
  suggestionForUser: z.string(),
  reason: z.string(),
});

/** 将 unsafeSpans 规范化为 string[] */
export function normalizeUnsafeSpans(spans: Array<string | { text: string }>): string[] {
  return spans.map((s) => (typeof s === 'string' ? s : s.text));
}
