import { NextResponse } from 'next/server';
import { seedGivings } from '@/data/seed-givings';
import { IS_DEMO_MODE } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_GIVING = {
  id: 'fallback',
  content:
    'Before debugging, write what you expected and what actually happened.',
  language: 'en' as const,
  helpedCount: 0,
};

const DEMO_FEATURED_GIVING = {
  id: 'demo_published',
  content:
    '给反馈时，先指出一个让你困惑的地方，再给对方一个可以马上尝试的小下一步。',
  language: 'zh' as const,
  helpedCount: 0,
};

function getDemoGiving(excludeIds: string[], featured?: string) {
  if (featured) {
    return DEMO_FEATURED_GIVING;
  }

  const all = seedGivings.map((giving, index) => ({
    id: `seed_${index}`,
    content: giving.content,
    language: giving.language,
    helpedCount: 0,
  }));

  const available = all.filter((giving) => !excludeIds.includes(giving.id));
  const pool = available.length > 0 ? available : all;

  return pool[Math.floor(Math.random() * pool.length)] ?? FALLBACK_GIVING;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeRaw = searchParams.get('exclude_ids') || '';
    const excludeIds = excludeRaw
      ? excludeRaw.split(',').filter((id) => id.length > 0)
      : [];
    const featured = searchParams.get('featured') || undefined;

    if (IS_DEMO_MODE) {
      return NextResponse.json(getDemoGiving(excludeIds, featured));
    }

    const { getRandomGiving, getGivingById, insertEvent } = await import(
      '@/lib/db/queries'
    );

    if (featured) {
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

    const giving = await getRandomGiving(excludeIds);

    if (!giving) {
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
