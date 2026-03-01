import { NextRequest, NextResponse } from 'next/server';
import { sql, toStockTransaction } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params;
    const transactions = await sql`SELECT * FROM stock_transactions WHERE item_id = ${itemId} ORDER BY created_at DESC`;
    return NextResponse.json(transactions.map(toStockTransaction));
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
