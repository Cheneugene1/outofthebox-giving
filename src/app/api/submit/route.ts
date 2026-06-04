import { NextResponse } from 'next/server';
import { submitRequestSchema } from '@/lib/zod-schemas';
import { detectLanguage } from '@/lib/utils';
import { reviewGiving } from '@/lib/ai/review';
import { insertEvent } from '@/lib/db/queries';
import { IS_DEMO_MODE } from '@/lib/constants';
import { getMockReview } from '@/lib/ai/fallback';
import type { ReviewResult, Language } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod 校验
    const parsed = submitRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { text } = parsed.data;

    // 自动检测语言
    const language: Language = detectLanguage(text);

    // 记录 submitted 事件
    await insertEvent('submitted');

    // DEMO_MODE → mock
    let reviewResult: ReviewResult;
    if (IS_DEMO_MODE) {
      reviewResult = getMockReview(text, language);
    } else {
      reviewResult = await reviewGiving({ text, language });
    }

    return NextResponse.json(reviewResult);
  } catch (error) {
    console.error('POST /api/submit error:', error);
    return NextResponse.json(
      { error: 'Failed to review your giving. Please try again.' },
      { status: 500 }
    );
  }
}
