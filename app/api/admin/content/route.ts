import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent, updateSectionContent } from '@/lib/actions/site-content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, data } = body;

    if (!sectionId || data === undefined) {
      return NextResponse.json(
        { success: false, error: 'sectionId and data are required' },
        { status: 400 }
      );
    }

    const result = await updateSectionContent(sectionId, data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

