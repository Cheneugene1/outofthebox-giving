import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
