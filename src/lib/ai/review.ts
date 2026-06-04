/**
 * AI Review — 调用 AI 获取审核结果
 */

import { generateText } from 'ai';
import { reviewResultSchema, normalizeUnsafeSpans } from '../zod-schemas';
import { buildSystemPrompt, getFewShotExamples } from './prompt';
import { getMockReview } from './fallback';
import { getModel } from './provider';
import { AI_TIMEOUT_MS } from '../constants';
import type { ReviewResult, Language } from '../types';

interface AIReviewInput {
  text: string;
  language: Language;
}

/**
 * 尝试从 AI 返回的文本中提取 JSON
 */
function extractJSON(raw: string): object | null {
  // 1. 直接 parse
  try { return JSON.parse(raw); } catch {}

  // 2. 去 Markdown 代码块
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try { return JSON.parse(cleaned); } catch {}

  // 3. 正则提取第一个 {...}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }

  return null;
}

/**
 * 调用 AI 审核文本，带超时和 fallback
 */
export async function reviewGiving(input: AIReviewInput): Promise<ReviewResult> {
  const { text, language } = input;

  const systemPrompt = buildSystemPrompt();
  const examples = getFewShotExamples();

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  for (const ex of examples) {
    messages.push({ role: 'user', content: `Input: ${ex.input}` });
    messages.push({ role: 'assistant', content: JSON.stringify(ex.output) });
  }

  messages.push({ role: 'user', content: `Input: ${text}` });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const model = getModel();

    // 用 generateText 代替 generateObject，兼容更多模型
    const { text: rawText } = await generateText({
      model,
      messages,
      temperature: 0.3,
      maxTokens: 2000,
      abortSignal: controller.signal,
    });

    clearTimeout(timeoutId);

    const parsed = extractJSON(rawText);
    if (!parsed) {
      console.warn('[review] Failed to extract JSON from AI response:', rawText.slice(0, 200));
      return getMockReview(text, language);
    }

    const validated = reviewResultSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[review] Zod validation failed:', validated.error.issues.slice(0, 3).map(i => i.message));
      return getMockReview(text, language);
    }

    const result = validated.data;
    return {
      ...result,
      unsafeSpans: normalizeUnsafeSpans(result.unsafeSpans),
    } as ReviewResult;
  } catch (error) {
    console.warn('[review] AI call failed, using mock fallback:', error instanceof Error ? error.message : error);
    return getMockReview(text, language);
  }
}
