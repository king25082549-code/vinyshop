import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const id = uuidv4();
    const now = new Date().toISOString();

    const [item] = await sql`
      INSERT INTO order_items (id, order_id, job_type, width, height, quantity, unit_price, total_price, notes, created_at)
      VALUES (${id}, ${data.orderId}, ${data.jobType}, ${data.width}, ${data.height}, ${data.quantity}, ${data.unitPrice}, ${data.totalPrice}, ${data.notes || null}, ${now})
      RETURNING *
    `;

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating order item:', error);
    return NextResponse.json({ error: 'Failed to create order item' }, { status: 500 });
  }
}
