import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLoyaltyStats, getLoyaltyTransactions, getEarningRules, getRedemptionRules, getLoyaltyTiers } from '@/lib/actions/loyalty';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

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
        // Return everything for dashboard
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
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Import server actions dynamically to avoid "use server" issues
    const { addLoyaltyPoints, deductLoyaltyPoints } = await import('@/lib/actions/loyalty');

    switch (action) {
      case 'add-points': {
        const { userId, points, type, description, orderId, expiresAt } = body;
        if (!userId || !points || !type || !description) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await addLoyaltyPoints(userId, points, type, description, orderId, expiresAt);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'deduct-points': {
        const { userId, points, description } = body;
        if (!userId || !points || !description) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await deductLoyaltyPoints(userId, points, description);
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