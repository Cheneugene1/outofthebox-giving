'use client';

import type { Stats } from '@/lib/types';

interface StatsBarProps {
  stats: Stats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex justify-center gap-6 sm:gap-12 py-4 text-sm text-stone-500">
      <span>
        <strong className="text-stone-700">{stats.boxesOpened.toLocaleString()}</strong> boxes opened
      </span>
      <span>
        <strong className="text-stone-700">{stats.givingsLeft.toLocaleString()}</strong> givings left
      </span>
      <span>
        <strong className="text-stone-700">{stats.sharpWordsSoftened.toLocaleString()}</strong> words softened
      </span>
    </div>
  );
}
