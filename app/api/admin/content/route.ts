export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent, updateSectionContent } from '@/lib/actions/site-content';
import { CONTENT_ADMIN_ROLES, logAdminAction, requireAdminApi } from '@/lib/supabase/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const content = await getSiteContent();
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request, CONTENT_ADMIN_ROLES);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const { sectionId, data } = body;

    if (!sectionId || typeof sectionId !== 'string' || data === undefined) {
      return NextResponse.json(
        { success: false, error: 'sectionId and data are required' },
        { status: 400 }
      );
    }

    const result = await updateSectionContent(sectionId, data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    await logAdminAction({
      actorId: guard.auth.userId,
      action: 'update_site_content_section',
      entityType: 'content_block',
      entityId: sectionId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
