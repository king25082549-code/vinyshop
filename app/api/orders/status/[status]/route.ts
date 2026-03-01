import { NextRequest, NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ status: string }> }) {
  try {
    const { status } = await params;
    const orders = await sql`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC`;
    return NextResponse.json(orders.map(toOrder));
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
