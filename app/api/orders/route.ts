import { NextRequest, NextResponse } from 'next/server';
import { sql, toOrder } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    return NextResponse.json(orders.map(toOrder));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    const id = uuidv4();
    const now = new Date().toISOString();

    const [order] = await sql`
      INSERT INTO orders (
        id, customer_name, phone, line_id, job_type, width, height, quantity,
        unit_price, total_price, deposit, remaining, payment_status, status,
        file_url, file_name, order_date, due_date, notes, created_by, created_at, updated_at
      ) VALUES (
        ${id}, ${orderData.customerName}, ${orderData.phone}, ${orderData.lineId || null}, 
        ${orderData.jobType}, ${orderData.width}, ${orderData.height}, ${orderData.quantity},
        ${orderData.unitPrice}, ${orderData.totalPrice}, ${orderData.deposit}, ${orderData.remaining},
        ${orderData.paymentStatus}, ${orderData.status}, ${orderData.fileUrl || null}, 
        ${orderData.fileName || null}, ${orderData.orderDate}, ${orderData.dueDate}, 
        ${orderData.notes || null}, ${orderData.createdBy}, ${now}, ${now}
      ) RETURNING *
    `;

    return NextResponse.json(toOrder(order), { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
