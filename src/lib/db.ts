import { createClient } from '@supabase/supabase-js';

// Check if we have real Supabase credentials
const hasSupabaseCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here';

let supabase: ReturnType<typeof createClient> | null = null;

if (hasSupabaseCredentials) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  supabase = createClient(supabaseUrl, supabaseKey);
}

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

// In-memory storage for development
const swapStorage = new Map<string, FileSwap>();

// Clean up expired swaps every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    const now = new Date();
    for (const [id, swap] of swapStorage.entries()) {
      if (new Date(swap.expires_at) < now) {
        swapStorage.delete(id);
      }
    }
  }, 5 * 60 * 1000);
}

export async function createFileSwap(swapId: string): Promise<FileSwap> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  const swapData: FileSwap = {
    swap_id: swapId,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
  };

  if (hasSupabaseCredentials && supabase) {
    // Use Supabase
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
    
    return data as unknown as FileSwap;
  } else {
    // Use in-memory storage
    swapStorage.set(swapId, swapData);
    return swapData;
  }
}

export async function getFileSwap(swapId: string): Promise<FileSwap | null> {
  if (hasSupabaseCredentials && supabase) {
    // Use Supabase
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
    
    return data as unknown as FileSwap;
  } else {
    // Use in-memory storage
    const swap = swapStorage.get(swapId);
    
    if (!swap) {
      return null;
    }
    
    // Check if expired
    if (new Date(swap.expires_at) < new Date()) {
      swapStorage.delete(swapId);
      return null;
    }
    
    return swap;
  }
}

export async function updateFileSwapFile1(
  swapId: string,
  fileUrl: string,
  filename: string,
  fileSize: number
): Promise<FileSwap | null> {
  if (hasSupabaseCredentials && supabase) {
    // Use Supabase
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
    
    return data as unknown as FileSwap;
  } else {
    // Use in-memory storage
    const swap = await getFileSwap(swapId);
    
    if (!swap) {
      return null;
    }
    
    swap.file1_url = fileUrl;
    swap.file1_name = filename;
    swap.file1_size = fileSize;
    
    swapStorage.set(swapId, swap);
    return swap;
  }
}

export async function updateFileSwapFile2(
  swapId: string,
  fileUrl: string,
  filename: string,
  fileSize: number
): Promise<FileSwap | null> {
  if (hasSupabaseCredentials && supabase) {
    // Use Supabase
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
    
    return data as unknown as FileSwap;
  } else {
    // Use in-memory storage
    const swap = await getFileSwap(swapId);
    
    if (!swap) {
      return null;
    }
    
    swap.file2_url = fileUrl;
    swap.file2_name = filename;
    swap.file2_size = fileSize;
    
    swapStorage.set(swapId, swap);
    return swap;
  }
}

export async function getSwapStatus(swap: FileSwap): Promise<string> {
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
  if (hasSupabaseCredentials) {
    console.log('Using Supabase database');
  } else {
    console.log('Using in-memory database for development');
  }
}

// Additional helper methods that might be used elsewhere
export async function createSwap(id: string): Promise<FileSwap> {
  return createFileSwap(id);
}

export async function getSwap(id: string): Promise<FileSwap | null> {
  return getFileSwap(id);
}

export async function deleteSwap(id: string): Promise<boolean> {
  if (hasSupabaseCredentials && supabase) {
    const { error } = await supabase
      .from('swaps')
      .delete()
      .eq('swap_id', id);
    
    return !error;
  } else {
    return swapStorage.delete(id);
  }
}