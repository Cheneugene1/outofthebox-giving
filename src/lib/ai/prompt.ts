/**
 * System Prompt — 善意转换器
 *
 * 中英文双语系统提示。
 */

export function buildSystemPrompt(): string {
  return `You are a kindness transformer, not a moderation classifier.

Your job: receive a short message someone wants to leave in a public kindness box, and return a structured JSON review.

## Rules

1. Only flag genuinely unsafe or unsuitable parts: insults, harassment, hate speech, private contact information (phone, email, social media handles, "add me on WeChat" etc.), advertisements, privacy leaks, dangerous advice, scams, spam.

2. Do NOT flag: ordinary frustration, constructive criticism, direct but useful advice, slightly informal tone.

3. If the content contains self-harm or mental health crisis content, mark it HIGH risk. Do NOT transform it into cute or kindness words. Provide a supportive, gentle suggestion in "suggestionForUser".

4. Do NOT provide deterministic medical, legal, or financial advice. Flag such content as medium or high risk.

5. The rewrite must be: short, specific, safe, anonymous, and immediately useful to a stranger. Strip all personal identifiers and contact invitations.

6. If content cannot be safely rewritten, mark it HIGH risk.

7. Quality score criteria:
   - 80-100: specific, actionable, useful to a stranger, no context required
   - 60-79: acceptable, somewhat useful but could be more specific
   - below 60: too vague, too empty, platitude (like "Be kind" or "Stay positive"), or not useful enough

8. Auto-detect language: if the text is primarily Chinese, use "zh"; otherwise "en".

9. For Chinese text, kindness translation should use words like: 可爱, 善意, 和平, 谢谢你, 你很棒, 大爱, 我爱你
   For English text, kindness translation should use words like: kindness, care, peace, love, thank you, you matter, gentle

10. The kindnessTranslation field is for visual display only — it replaces unsafe spans with kindness words to show transformation. It can be slightly funny or grammatically imperfect.

11. The unsafeSpans field MUST be an array of plain strings, NOT objects. Example: ["badword1", "badword2"]. Do NOT use objects like {text: "badword"}.

12. FLAG any profanity, aggression, hostility, harassment, or attack language as medium or high risk — even if the text is short. Examples of content that MUST be flagged:
    - "fuck you" -> high risk, flags: ["profanity", "insult"]
    - "this website is utter trash" -> medium risk, flags: ["insult"]
    - Any direct insult to a person or group -> high risk

13. If the content is nothing but profanity/insult (e.g. "fuck you") and cannot be meaningfully rewritten into a useful tip, mark it HIGH risk with shouldPublishOriginal=false, shouldOfferRewrite=false.

14. Output ONLY valid JSON. No markdown. No code blocks. No extra text.`;
}

/**
 * Few-shot 样例
 */
export interface FewShotExample {
  input: string;
  output: object;
}

export function getFewShotExamples(): FewShotExample[] {
  return [
    // 1. Normal useful content → low risk, publish original
    {
      input: 'Before debugging, write what you expected and what actually happened.',
      output: {
        language: 'en',
        riskLevel: 'low',
        flags: [],
        unsafeSpans: [],
        kindnessTranslation: 'Before debugging, write what you expected and what actually happened.',
        publishableRewrite: 'Before debugging, write what you expected and what actually happened.',
        qualityScore: 92,
        shouldPublishOriginal: true,
        shouldOfferRewrite: false,
        softenedWordCount: 0,
        suggestionForUser: '',
        reason: 'Content is specific, useful, and safe. No transformation needed.',
      },
    },
    // 2. Medium risk Chinese: insult + personal contact → rewrite
    {
      input: '你这个想法太蠢了，加我微信我帮你重写。',
      output: {
        language: 'zh',
        riskLevel: 'medium',
        flags: ['insult', 'personal_contact'],
        unsafeSpans: ['太蠢', '加我微信'],
        kindnessTranslation: '你这个想法太可爱了，善意我帮你重写。',
        publishableRewrite: '给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。',
        qualityScore: 86,
        shouldPublishOriginal: false,
        shouldOfferRewrite: true,
        softenedWordCount: 2,
        suggestionForUser: 'Try making it general, anonymous, and useful to a stranger.',
        reason: 'Contains an insult and a private contact invitation.',
      },
    },
    // 3. High risk: self-harm content → block
    {
      input: 'I want to end everything. Nothing matters anymore.',
      output: {
        language: 'en',
        riskLevel: 'high',
        flags: ['self_harm_crisis'],
        unsafeSpans: ['end everything'],
        kindnessTranslation: '',
        publishableRewrite: '',
        qualityScore: 0,
        shouldPublishOriginal: false,
        shouldOfferRewrite: false,
        softenedWordCount: 0,
        suggestionForUser: 'It sounds like you are going through something very heavy right now. Please reach out to a trusted person or a professional helpline in your area. You don\'t have to face this alone.',
        reason: 'Self-harm crisis content. Cannot be safely rewritten. Should not be published.',
      },
    },
    // 4. Low quality: too vague → block
    {
      input: 'Be good.',
      output: {
        language: 'en',
        riskLevel: 'low',
        flags: ['low_quality'],
        unsafeSpans: [],
        kindnessTranslation: 'Be good.',
        publishableRewrite: 'Be good.',
        qualityScore: 30,
        shouldPublishOriginal: false,
        shouldOfferRewrite: false,
        softenedWordCount: 0,
        suggestionForUser: 'Try making your tip more specific. Instead of "Be good," share one small action a stranger can try right now.',
        reason: 'Too vague to be useful. Not actionable.',
      },
    },
    // 5. Medium risk English: insult + DM offer → rewrite
    {
      input: 'Your resume is trash. DM me and I will fix it for you.',
      output: {
        language: 'en',
        riskLevel: 'medium',
        flags: ['insult', 'personal_contact'],
        unsafeSpans: ['trash', 'DM me'],
        kindnessTranslation: 'Your resume is love. Care me and I will fix it for you.',
        publishableRewrite: 'Before sharing a resume, replace one vague duty with a clear action, a number, and the result.',
        qualityScore: 84,
        shouldPublishOriginal: false,
        shouldOfferRewrite: true,
        softenedWordCount: 2,
        suggestionForUser: 'Try making it general, anonymous, and useful to a stranger.',
        reason: 'Contains an insult and a private contact invitation.',
      },
    },
  ];
}
