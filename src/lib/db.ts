import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface FileSwap {
  swap_id: string;
  created_at: string;
  expires_at: string;
  file1_url?: string;
  file1_name?: string;
  file1_size?: number;
  file2_url?: string;
  file2_name?: string;
  file2_size?: number;
}

export async function createFileSwap(swapId: string): Promise<FileSwap> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('swaps')
    .insert([
      {
        swap_id: swapId,
        expires_at: expiresAt
      }
    ])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create file swap: ${error.message}`);
  }
  
  return data as FileSwap;
}

export async function getFileSwap(swapId: string): Promise<FileSwap | null> {
  const { data, error } = await supabase
    .from('swaps')
    .select('*')
    .eq('swap_id', swapId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows found
    }
    throw new Error(`Failed to get file swap: ${error.message}`);
  }
  
  return data as FileSwap;
}

export async function updateFileSwapFile1(
  swapId: string,
  fileUrl: string,
  filename: string,
  fileSize: number
): Promise<FileSwap | null> {
  const { data, error } = await supabase
    .from('swaps')
    .update({
      file1_url: fileUrl,
      file1_name: filename,
      file1_size: fileSize
    })
    .eq('swap_id', swapId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update file swap: ${error.message}`);
  }
  
  return data as FileSwap;
}

export async function updateFileSwapFile2(
  swapId: string,
  fileUrl: string,
  filename: string,
  fileSize: number
): Promise<FileSwap | null> {
  const { data, error } = await supabase
    .from('swaps')
    .update({
      file2_url: fileUrl,
      file2_name: filename,
      file2_size: fileSize
    })
    .eq('swap_id', swapId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update file swap: ${error.message}`);
  }
  
  return data as FileSwap;
}

export async function getSwapStatus(swap: FileSwap): string {
