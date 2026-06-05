import { NextResponse } from 'next/server';
import { IS_DEMO_MODE } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (IS_DEMO_MODE) {
      return NextResponse.json({
        boxesOpened: 12,
        givingsLeft: 7,
        sharpWordsSoftened: 18,
      });
    }

    const { getStats } = await import('@/lib/db/queries');
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({
      boxesOpened: 0,
      givingsLeft: 0,
      sharpWordsSoftened: 0,
    });
  }
}
