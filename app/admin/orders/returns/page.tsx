import { getReturnStats, getReturns, getReturnStatuses, getReturnTypes, getReturnReasons } from '@/lib/actions/returns';
import ReturnsClient from './ReturnsClient';

export const dynamic = 'force-dynamic';

export default async function ReturnsPage() {
  const [stats, returns, statuses, types, reasons] = await Promise.all([
    getReturnStats(),
    getReturns(1, 20),
    getReturnStatuses(),
    getReturnTypes(),
    getReturnReasons(),
  ]);

  return <ReturnsClient
    initialStats={stats}
    initialReturns={returns.success ? returns.returns || [] : []}
    initialTotal={returns.total || 0}
    statuses={statuses}
    types={types as any}
    reasons={reasons as any}
  />;
}