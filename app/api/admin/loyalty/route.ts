import { NextRequest, NextResponse } from 'next/server';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import { getLoyaltyStats, getLoyaltyTransactions, getEarningRules, getRedemptionRules, getLoyaltyTiers } from '@/lib/actions/loyalty';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request, OPS_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'stats': {
        const stats = await getLoyaltyStats();
        return NextResponse.json(stats);
      }
      case 'transactions': {
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const userId = searchParams.get('userId') || undefined;
        const type = searchParams.get('type') || undefined;
        const dateFrom = searchParams.get('dateFrom') || undefined;
        const dateTo = searchParams.get('dateTo') || undefined;

        const result = await getLoyaltyTransactions(page, limit, { userId, type: type as any, dateFrom, dateTo });
        return NextResponse.json(result);
      }
      case 'earning-rules': {
        const rules = await getEarningRules();
        return NextResponse.json(rules);
      }
      case 'redemption-rules': {
        const rules = await getRedemptionRules();
        return NextResponse.json(rules);
      }
      case 'tiers': {
        const tiers = await getLoyaltyTiers();
        return NextResponse.json(tiers);
      }
      default: {
        const [stats, transactions, earningRules, redemptionRules, tiers] = await Promise.all([
          getLoyaltyStats(),
          getLoyaltyTransactions(1, 10),
          getEarningRules(),
          getRedemptionRules(),
          getLoyaltyTiers(),
        ]);
        return NextResponse.json({ stats, transactions, earningRules, redemptionRules, tiers });
      }
    }
  } catch (error) {
    console.error('Loyalty API error:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, OPS_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const { action } = body;

    const { addLoyaltyPoints, deductLoyaltyPoints } = await import('@/lib/actions/loyalty');

    switch (action) {
      case 'add-points': {
        const { userId, points, type, description, orderId, expiresAt } = body;
        if (!userId || !points || !type || !description) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await addLoyaltyPoints(userId, points, type, description, orderId, expiresAt);
        if (result.success) {
          await logAdminAction({
            actorId: guard.auth.userId,
            action: 'add_loyalty_points',
            entityType: 'profile',
            entityId: userId,
            afterState: { points, type, description },
          });
        }
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'deduct-points': {
        const { userId, points, description } = body;
        if (!userId || !points || !description) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await deductLoyaltyPoints(userId, points, description);
        if (result.success) {
          await logAdminAction({
            actorId: guard.auth.userId,
            action: 'deduct_loyalty_points',
            entityType: 'profile',
            entityId: userId,
            afterState: { points, description },
          });
        }
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Loyalty API POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
