import { NextRequest, NextResponse } from 'next/server';
import { sql, toStockTransaction } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const transactions = await sql`SELECT * FROM stock_transactions ORDER BY created_at DESC LIMIT ${limit}`;
    return NextResponse.json(transactions.map(toStockTransaction));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
