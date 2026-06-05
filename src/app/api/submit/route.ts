import { NextResponse } from 'next/server';
import { IS_DEMO_MODE } from '@/lib/constants';
import { getMockReview } from '@/lib/ai/fallback';
import { reviewGiving } from '@/lib/ai/review';
import { detectLanguage } from '@/lib/utils';
import { submitRequestSchema } from '@/lib/zod-schemas';
import type { Language, ReviewResult } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { text } = parsed.data;
    const language: Language = detectLanguage(text);

    let reviewResult: ReviewResult;
    if (IS_DEMO_MODE) {
      reviewResult = getMockReview(text, language);
    } else {
      const { insertEvent } = await import('@/lib/db/queries');
      await insertEvent('submitted');
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
