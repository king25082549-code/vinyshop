import { NextRequest, NextResponse } from 'next/server';
import { sql, toInventoryItem } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [item] = await sql`SELECT * FROM inventory WHERE id = ${id}`;
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(toInventoryItem(item));
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const [item] = await sql`
      UPDATE inventory SET
        name = COALESCE(${updates.name}, name),
        category = COALESCE(${updates.category}, category),
        unit = COALESCE(${updates.unit}, unit),
        current_stock = COALESCE(${updates.currentStock}, current_stock),
        min_stock = COALESCE(${updates.minStock}, min_stock),
        cost_per_unit = COALESCE(${updates.costPerUnit}, cost_per_unit),
        supplier = COALESCE(${updates.supplier}, supplier),
        last_restocked = COALESCE(${updates.lastRestocked}, last_restocked)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(toInventoryItem(item));
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM inventory WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
