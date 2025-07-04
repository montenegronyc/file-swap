import { NextRequest, NextResponse } from 'next/server';
import { createFileSwap, updateFileSwapFile1, initializeDatabase } from '@/lib/db';
import { generateSwapId, MAX_FILE_SIZE } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development mode or have proper credentials
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasSupabaseCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here';
    
    const hasBlobCredentials = process.env.BLOB_READ_WRITE_TOKEN && 
      process.env.BLOB_READ_WRITE_TOKEN !== 'your-vercel-blob-token-here';

    if (!isDevelopment && (!hasSupabaseCredentials || !hasBlobCredentials)) {
      return NextResponse.json({ 
        error: 'Server configuration error: Please configure Supabase and Vercel Blob credentials' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    console.log(`Processing upload: ${file.name} (${file.size} bytes)`);

    // Generate unique swap ID
    const swapId = generateSwapId();

    let fileUrl: string;

    if (isDevelopment && !hasBlobCredentials) {
      // Development mode: store files locally
      console.log('Development mode: storing file locally');
      
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
      const fileName = `${swapId}_${file.name}`;
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/${fileName}`;
      console.log('File saved locally:', fileUrl);
    } else {
      // Production mode: use Vercel Blob
      const { put } = await import('@vercel/blob');
      console.log('Production mode: uploading to Vercel Blob...');
      
      const blob = await put(`${swapId}/file1_${file.name}`, file, {
        access: 'public',
      });
      fileUrl = blob.url;
      console.log('Blob upload successful:', fileUrl);
    }

    if (hasSupabaseCredentials) {
      // Use Supabase for database
      console.log('Using Supabase database...');
      await initializeDatabase();
      await createFileSwap(swapId);
      await updateFileSwapFile1(swapId, fileUrl, file.name, file.size);
    } else {
      // Development mode: use in-memory storage (already implemented in db.ts)
      console.log('Using in-memory database for development...');
      await initializeDatabase();
      await createFileSwap(swapId);
      await updateFileSwapFile1(swapId, fileUrl, file.name, file.size);
    }

    console.log('Upload completed successfully for swap:', swapId);

    return NextResponse.json({ 
      swapId,
      fileId: fileUrl,
      filename: file.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    
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