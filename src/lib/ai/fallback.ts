/**
 * Mock Review — DEMO_MODE 和 AI 容错兜底
 *
 * 匹配规则：简单 substring 匹配，不做模糊匹配/半全角转换。
 * 只匹配已知的 demo bad cases，其他内容返回 low risk。
 */

import type { ReviewResult, Language } from '../types';

/**
 * 获取 mock 审核结果
 */
export function getMockReview(text: string, language: Language): ReviewResult {
  // 已知中文 demo bad case
  if (text.includes('太蠢了') && text.includes('加我微信')) {
    return {
      language: 'zh',
      riskLevel: 'medium',
      flags: ['insult', 'personal_contact'],
      unsafeSpans: ['太蠢', '加我微信'],
      kindnessTranslation: '你这个想法太可爱了，善意我帮你重写。',
      publishableRewrite:
        '给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。',
      qualityScore: 86,
      shouldPublishOriginal: false,
      shouldOfferRewrite: true,
      softenedWordCount: 2,
      suggestionForUser: 'Try making it general, anonymous, and useful to a stranger.',
      reason: 'The original contains an insult and a private contact invitation.',
    };
  }

  // 已知英文 demo bad case
  const lower = text.toLowerCase();
  if (lower.includes('trash') && lower.includes('dm')) {
    return {
      language: 'en',
      riskLevel: 'medium',
      flags: ['insult', 'personal_contact'],
      unsafeSpans: ['trash', 'DM me'],
      kindnessTranslation: 'Your resume is love. Care me and I will fix it for you.',
      publishableRewrite:
        'Before sharing a resume, replace one vague duty with a clear action, a number, and the result.',
      qualityScore: 84,
      shouldPublishOriginal: false,
      shouldOfferRewrite: true,
      softenedWordCount: 2,
      suggestionForUser: 'Try making it general, anonymous, and useful to a stranger.',
      reason: 'Contains an insult and a private contact invitation.',
    };
  }

  // 默认：low risk, 可用但一般
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
    reason: 'Content is acceptable.',
  };
}
