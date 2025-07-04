import { sql } from '@vercel/postgres';

export interface FileSwap {
  id: string;
  created_at: Date;
  expires_at: Date;
  file1_url?: string;
  file1_name?: string;
  file1_size?: number;
  file2_url?: string;
  file2_name?: string;
  file2_size?: number;
}

export async function createFileSwap(id: string): Promise<FileSwap> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const result = await sql`
    INSERT INTO swaps (id, created_at, expires_at)
    VALUES (${id}, NOW(), ${expiresAt.toISOString()})
    RETURNING *
  `;
  
  return result.rows[0] as FileSwap;
}

export async function getFileSwap(id: string): Promise<FileSwap | null> {
  const result = await sql`
    SELECT * FROM swaps WHERE id = ${id}
  `;
  
  return result.rows.length > 0 ? result.rows[0] as FileSwap : null;
}

export async function updateFileSwapFile1(
  id: string,
  fileUrl: string,
  filename: string,
  fileSize: number
): Promise<FileSwap | null> {
  const result = await sql`
    UPDATE swaps 
    SET 
      file1_url = ${fileUrl},
      file1_name = ${filename},
      file1_size = ${fileSize}
    WHERE id = ${id}
    RETURNING *
  `;
  
  return result.rows.length > 0 ? result.rows[0] as FileSwap : null;
}

export async function updateFileSwapFile2(
  id: string,
  fileUrl: string,
  filename: string,
  fileSize: number
): Promise<FileSwap | null> {
  const result = await sql`
    UPDATE swaps 
    SET 
      file2_url = ${fileUrl},
      file2_name = ${filename},
      file2_size = ${fileSize}
    WHERE id = ${id}
    RETURNING *
  `;
  
  return result.rows.length > 0 ? result.rows[0] as FileSwap : null;
}

export async function getSwapStatus(swap: FileSwap): string {
  if (new Date() > new Date(swap.expires_at)) {
    return 'expired';
  }
  
  if (!swap.file1_url) {
    return 'waiting_for_file1';
  }
  
  if (!swap.file2_url) {
    return 'waiting_for_file2';
  }
  
  return 'completed';
}

export async function initializeDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS swaps (
      id VARCHAR(255) PRIMARY KEY,
      file1_url TEXT,
      file1_name VARCHAR(255),
      file1_size BIGINT,
      file2_url TEXT,
      file2_name VARCHAR(255),
      file2_size BIGINT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `;
}