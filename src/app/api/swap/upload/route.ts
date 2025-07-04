import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getFileSwap, updateFileSwapFile2, initializeDatabase, getSwapStatus } from '@/lib/db';
import { MAX_FILE_SIZE, isFileExpired } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const swapId = formData.get('swapId') as string;

    if (!file || !swapId) {
      return NextResponse.json({ error: 'Missing file or swapId' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Get existing swap
    const swap = await getFileSwap(swapId);
    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    // Check if expired
    if (isFileExpired(new Date(swap.expires_at))) {
      return NextResponse.json({ error: 'Swap has expired' }, { status: 410 });
    }

    // Check if we're expecting the second file
    const status = await getSwapStatus(swap);
    if (status !== 'waiting_for_file2') {
      return NextResponse.json({ error: 'Not ready for second file' }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const blob = await put(`${swapId}/file2_${file.name}`, file, {
      access: 'public',
    });

    // Update swap with second file info
    const updatedSwap = await updateFileSwapFile2(swapId, blob.url, file.name, file.size);

    return NextResponse.json({
      swapId,
      fileId: blob.url,
      filename: file.name,
      swap: updatedSwap
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}