import { NextRequest, NextResponse } from 'next/server';

async function getDrive() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credentials) throw new Error('GOOGLE_SHEETS_CREDENTIALS not set');
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

// In-memory cache for image bytes (avoids re-downloading)
const imageCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('Missing file ID', { status: 400 });
  }

  // Check cache first
  const cached = imageCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[drive-image] Cache hit: ${id}`);
    return new NextResponse(new Uint8Array(cached.buffer), {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  }

  try {
    console.log(`[drive-image] Downloading: ${id}`);
    const drive = await getDrive();

    // Get file metadata first for content type
    const meta = await drive.files.get({
      fileId: id,
      fields: 'mimeType, name, size',
      supportsAllDrives: true,
    });

    const mimeType = meta.data.mimeType || 'image/jpeg';
    console.log(`[drive-image] File: ${meta.data.name}, type: ${mimeType}, size: ${meta.data.size}`);

    // Download the file content
    const response = await drive.files.get(
      { fileId: id, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);

    // Cache it
    imageCache.set(id, { buffer, contentType: mimeType, timestamp: Date.now() });

    // Clean old cache entries
    for (const [key, value] of imageCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        imageCache.delete(key);
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error(`[drive-image] Error for ${id}:`, error?.message || error);
    return new NextResponse('Image not found', { status: 404 });
  }
}
