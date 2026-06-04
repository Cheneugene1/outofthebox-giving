import { NextResponse } from 'next/server';
import { IS_DEMO_MODE } from '@/lib/constants';
import { getRandomGiving, getGivingById, insertEvent } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

const FALLBACK_GIVING = {
  id: 'fallback',
  content:
    'Before debugging, write what you expected and what actually happened.',
  language: 'en' as const,
  helpedCount: 0,
};

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 解析 exclude_ids
    const excludeRaw = searchParams.get('exclude_ids') || '';
    const excludeIds = excludeRaw
      ? excludeRaw.split(',').filter((id) => id.length > 0)
      : [];

    // 解析 featured (仅 DEMO_MODE)
    const featured = searchParams.get('featured') || undefined;

    // Demo 模式 + featured 有效 → 返回指定 giving
    if (IS_DEMO_MODE && featured) {
      const featuredGiving = await getGivingById(featured);
      if (featuredGiving && !featuredGiving.hidden) {
        await insertEvent('open_box');
        return NextResponse.json({
          id: featuredGiving.id,
          content: featuredGiving.content,
          language: featuredGiving.language,
          helpedCount: featuredGiving.helpedCount,
        });
      }
    }

    // 随机取一条
    const giving = await getRandomGiving(excludeIds);

    if (!giving) {
      // 无可用 giving，返回内置 fallback
      return NextResponse.json(FALLBACK_GIVING);
    }

    await insertEvent('open_box');

    return NextResponse.json({
      id: giving.id,
      content: giving.content,
      language: giving.language,
      helpedCount: giving.helpedCount,
    });
  } catch (error) {
    console.error('GET /api/open error:', error);
    return NextResponse.json(FALLBACK_GIVING);
  }
}
