import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { quantity, reason, note, orderId, createdBy } = await request.json();
    const now = new Date().toISOString();

    const [item] = await sql`SELECT name FROM inventory WHERE id = ${id}`;
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await sql`UPDATE inventory SET current_stock = GREATEST(0, current_stock - ${quantity}) WHERE id = ${id}`;

    const transactionId = uuidv4();
    await sql`
      INSERT INTO stock_transactions (
        id, item_id, item_name, type, quantity, reason, order_id, note, created_by, created_at
      ) VALUES (
        ${transactionId}, ${id}, ${item.name}, 'out', ${quantity}, ${reason}, ${orderId || null}, ${note || null}, ${createdBy || 'admin'}, ${now}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing stock:', error);
    return NextResponse.json({ error: 'Failed to remove stock' }, { status: 500 });
  }
}
