import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const items = await sql`
      SELECT 
        oi.*,
        o.customer_name,
        o.phone,
        o.order_date,
        o.due_date,
        o.status,
        o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      ORDER BY o.created_at DESC, oi.created_at DESC
    `;
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching all order items:', error);
    return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
  }
}
