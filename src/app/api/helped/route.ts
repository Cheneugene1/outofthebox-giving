import { NextResponse } from 'next/server';
import { helpedRequestSchema } from '@/lib/zod-schemas';
import { incrementHelped, insertEvent } from '@/lib/db/queries';

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

    const { givingId } = parsed.data;
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
