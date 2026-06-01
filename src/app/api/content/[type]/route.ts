// API Route for fetching content from Google Sheets
import { NextResponse } from 'next/server';
import { getAktuellesData, getFAQData, getTippsTricksData } from '@/lib/google-sheets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    let data;
    
    switch (type) {
      case 'aktuelles':
        data = await getAktuellesData();
        break;
      case 'faq':
        data = await getFAQData();
        break;
      case 'tipps-tricks':
        data = await getTippsTricksData();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in content API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
