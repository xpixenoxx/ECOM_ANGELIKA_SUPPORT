import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getReturnStats,
  getReturns,
  getReturn,
  updateReturnStatus,
  schedulePickup,
  processRefund,
  processExchange,
} from '@/lib/actions/returns';

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
    const id = searchParams.get('id');

    switch (action) {
      case 'stats': {
        const stats = await getReturnStats();
        return NextResponse.json(stats);
      }
      case 'detail': {
        if (!id) {
          return NextResponse.json({ error: 'Return ID required' }, { status: 400 });
        }
        const result = await getReturn(id);
        return NextResponse.json(result, { status: result.success ? 200 : 404 });
      }
      case 'statuses': {
        const statuses = await getReturnStatuses();
        return NextResponse.json(statuses);
      }
      case 'types': {
        const types = await getReturnTypes();
        return NextResponse.json(types);
      }
      case 'reasons': {
        const reasons = await getReturnReasons();
        return NextResponse.json(reasons);
      }
      default: {
        // List returns with filters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const filters = {
          status: searchParams.get('status') || undefined,
          type: searchParams.get('type') as any || undefined,
          reason: searchParams.get('reason') as any || undefined,
          dateFrom: searchParams.get('dateFrom') || undefined,
          dateTo: searchParams.get('dateTo') || undefined,
          search: searchParams.get('search') || undefined,
        };

        const result = await getReturns(page, limit, filters);
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    console.error('Returns API error:', error);
    return NextResponse.json({ error: 'Failed to fetch returns data' }, { status: 500 });
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

    switch (action) {
      case 'update-status': {
        const { id, status, adminNotes } = body;
        if (!id || !status) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await updateReturnStatus(id, status, adminNotes);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'schedule-pickup': {
        const { returnId, courierPartner, pickupAddress, scheduledAt } = body;
        if (!returnId || !courierPartner || !pickupAddress || !scheduledAt) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await schedulePickup({ returnId, courierPartner, pickupAddress, scheduledAt });
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'process-refund': {
        const { returnId, refundAmount, paymentMethod, notes } = body;
        if (!returnId || !refundAmount || !paymentMethod) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await processRefund({ returnId, refundAmount, paymentMethod, notes });
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'process-exchange': {
        const { returnId, exchangeVariantId, notes } = body;
        if (!returnId || !exchangeVariantId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await processExchange({ returnId, exchangeVariantId, notes });
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Returns API POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}