import { NextRequest, NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [order] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(toOrder(order));
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const now = new Date().toISOString();

    const [order] = await sql`
      UPDATE orders SET
        customer_name = COALESCE(${updates.customerName}, customer_name),
        phone = COALESCE(${updates.phone}, phone),
        line_id = COALESCE(${updates.lineId}, line_id),
        job_type = COALESCE(${updates.jobType}, job_type),
        width = COALESCE(${updates.width}, width),
        height = COALESCE(${updates.height}, height),
        quantity = COALESCE(${updates.quantity}, quantity),
        unit_price = COALESCE(${updates.unitPrice}, unit_price),
        total_price = COALESCE(${updates.totalPrice}, total_price),
        deposit = COALESCE(${updates.deposit}, deposit),
        remaining = COALESCE(${updates.remaining}, remaining),
        payment_status = COALESCE(${updates.paymentStatus}, payment_status),
        status = COALESCE(${updates.status}, status),
        file_url = COALESCE(${updates.fileUrl}, file_url),
        file_name = COALESCE(${updates.fileName}, file_name),
        order_date = COALESCE(${updates.orderDate}, order_date),
        due_date = COALESCE(${updates.dueDate}, due_date),
        notes = COALESCE(${updates.notes}, notes),
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(toOrder(order));
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM orders WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
