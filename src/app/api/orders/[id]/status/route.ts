import { NextRequest, NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const now = new Date().toISOString();

    const [order] = await sql`
      UPDATE orders SET status = ${status}, updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(toOrder(order));
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
