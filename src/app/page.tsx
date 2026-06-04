import { getStats } from '@/lib/db/queries';
import { ClientApp } from '@/components/ClientApp';
import type { Stats } from '@/lib/types';

export default async function Page() {
  let stats: Stats;
  try {
    stats = await getStats();
  } catch {
    stats = { boxesOpened: 0, givingsLeft: 0, sharpWordsSoftened: 0 };
  }

  return <ClientApp initialStats={stats} />;
}
