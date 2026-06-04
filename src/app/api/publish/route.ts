import { NextResponse } from 'next/server';
import { publishRequestSchema } from '@/lib/zod-schemas';
import { insertGiving, insertEvent } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = publishRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { content, language, sourceType, softenedWordCount } = parsed.data;

    // 插入 giving
    const givingId = await insertGiving({
      content,
      language,
      sourceType,
    });

    // published 事件
    await insertEvent('published');

    // softened 事件
    if (softenedWordCount > 0) {
      await insertEvent('softened', softenedWordCount);
    }

    return NextResponse.json({ ok: true, givingId });
  } catch (error) {
    console.error('POST /api/publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish. Please try again.' },
      { status: 500 }
    );
  }
}
