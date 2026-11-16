import { NextRequest, NextResponse } from 'next/server';
import { OPS_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';
import {
  getReturnStats,
  getReturns,
  getReturn,
  updateReturnStatus,
  schedulePickup,
  processRefund,
  processExchange,
  getReturnStatuses,
  getReturnTypes,
  getReturnReasons,
} from '@/lib/actions/returns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request, OPS_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const filters = {
          status: searchParams.get('status') || undefined,
          type: (searchParams.get('type') as any) || undefined,
          reason: (searchParams.get('reason') as any) || undefined,
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
  const guard = await requireAdminApi(request, OPS_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update-status': {
        const { id, status, adminNotes } = body;
        if (!id || !status) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await updateReturnStatus(id, status, adminNotes);
        if (result.success) {
          await logAdminAction({
            actorId: guard.auth.userId,
            action: 'update_return_status',
            entityType: 'return',
            entityId: id,
            afterState: { status, adminNotes },
          });
        }
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'schedule-pickup': {
        const { returnId, courierPartner, pickupAddress, scheduledAt } = body;
        if (!returnId || !courierPartner || !pickupAddress || !scheduledAt) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await schedulePickup({ returnId, courierPartner, pickupAddress, scheduledAt });
        if (result.success) {
          await logAdminAction({
            actorId: guard.auth.userId,
            action: 'schedule_return_pickup',
            entityType: 'return',
            entityId: returnId,
            afterState: { courierPartner, scheduledAt },
          });
        }
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'process-refund': {
        const { returnId, refundAmount, paymentMethod, notes } = body;
        if (!returnId || !refundAmount || !paymentMethod) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await processRefund({ returnId, refundAmount, paymentMethod, notes });
        if (result.success) {
          await logAdminAction({
            actorId: guard.auth.userId,
            action: 'process_return_refund',
            entityType: 'return',
            entityId: returnId,
            afterState: { refundAmount, paymentMethod },
          });
        }
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }
      case 'process-exchange': {
        const { returnId, exchangeVariantId, notes } = body;
        if (!returnId || !exchangeVariantId) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await processExchange({ returnId, exchangeVariantId, notes });
        if (result.success) {
          await logAdminAction({
            actorId: guard.auth.userId,
            action: 'process_return_exchange',
            entityType: 'return',
            entityId: returnId,
            afterState: { exchangeVariantId },
          });
        }
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
