import { NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const orders = await sql`SELECT * FROM orders WHERE order_date = ${today} ORDER BY created_at DESC`;
    return NextResponse.json(orders.map(toOrder));
  } catch (error) {
    console.error('Error fetching today orders:', error);
    return NextResponse.json({ error: 'Failed to fetch today orders' }, { status: 500 });
  }
}
