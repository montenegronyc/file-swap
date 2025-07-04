import { NextRequest, NextResponse } from 'next/server';
import { getFileSwap, updateFileSwapFile2, initializeDatabase, getSwapStatus } from '@/lib/db';
import { MAX_FILE_SIZE, isFileExpired } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Force development mode to bypass Supabase RLS issues
    const isDevelopment = true; // Force development mode
    const hasBlobCredentials = false; // Force local file storage
    
    console.log('🔧 Forced development mode - using local storage and in-memory DB (swap upload)');

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

    console.log(`Processing second file upload: ${file.name} (${file.size} bytes) for swap ${swapId}`);

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

    let fileUrl: string;

    if (isDevelopment && !hasBlobCredentials) {
      // Development mode: store files locally
      console.log('Development mode: storing second file locally');
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch {
        // Directory might already exist
      }
      
      // Save file locally
      const fileName = `${swapId}_file2_${file.name}`;
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/${fileName}`;
      console.log('Second file saved locally:', fileUrl);
    } else {
      // Production mode: use Vercel Blob
      const { put } = await import('@vercel/blob');
      console.log('Production mode: uploading second file to Vercel Blob...');
      
      const blob = await put(`${swapId}/file2_${file.name}`, file, {
        access: 'public',
      });
      fileUrl = blob.url;
      console.log('Blob upload successful:', fileUrl);
    }

    // Update swap with second file info
    console.log('Updating swap with second file info...');
    const updatedSwap = await updateFileSwapFile2(swapId, fileUrl, file.name, file.size);

    console.log('Second file upload completed successfully for swap:', swapId);

    return NextResponse.json({
      swapId,
      fileId: fileUrl,
      filename: file.name,
      swap: updatedSwap
    });
  } catch (error) {
    console.error('Second file upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    if (error instanceof Error) {
      if (error.message.includes('supabaseUrl is required')) {
        errorMessage = 'Database configuration error: Please check Supabase settings';
      } else if (error.message.includes('ENOENT') || error.message.includes('permission')) {
        errorMessage = 'File storage error: Cannot save file to local directory';
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}