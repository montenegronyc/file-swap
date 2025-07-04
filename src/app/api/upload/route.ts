import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createFileSwap, updateFileSwapFile1, initializeDatabase } from '@/lib/db';
import { generateSwapId, MAX_FILE_SIZE } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Generate unique swap ID
    const swapId = generateSwapId();

    // Upload file to Vercel Blob
    const blob = await put(`${swapId}/file1_${file.name}`, file, {
      access: 'public',
    });

    // Create swap record in database
    await createFileSwap(swapId);

    // Update with first file info
    await updateFileSwapFile1(swapId, blob.url, file.name, file.size);

    return NextResponse.json({ 
      swapId,
      fileId: blob.url,
      filename: file.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}