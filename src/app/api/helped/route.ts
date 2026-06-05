import { NextResponse } from 'next/server';
import { IS_DEMO_MODE } from '@/lib/constants';
import { helpedRequestSchema } from '@/lib/zod-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = helpedRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    if (IS_DEMO_MODE) {
      return NextResponse.json({ ok: true, helpedCount: 1 });
    }

    const { givingId } = parsed.data;
    const { incrementHelped, insertEvent } = await import('@/lib/db/queries');
    const helpedCount = await incrementHelped(givingId);

    if (helpedCount === 0) {
      return NextResponse.json(
        { error: 'Giving not found' },
        { status: 404 }
      );
    }

    await insertEvent('helped');

    return NextResponse.json({ ok: true, helpedCount });
  } catch (error) {
    console.error('POST /api/helped error:', error);
    return NextResponse.json(
      { error: 'Failed to record. Please try again.' },
      { status: 500 }
    );
  }
}
