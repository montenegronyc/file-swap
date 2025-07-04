import { NextRequest, NextResponse } from 'next/server';
import { getFileSwap, initializeDatabase, getSwapStatus } from '@/lib/db';
import { isFileExpired } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    
    const swap = await getFileSwap(params.id);
    
    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    // Get current status
    const status = await getSwapStatus(swap);

    return NextResponse.json({
      ...swap,
      status
    });
  } catch (error) {
    console.error('Swap fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch swap' }, { status: 500 });
  }
}