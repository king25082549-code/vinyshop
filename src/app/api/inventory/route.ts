import { NextRequest, NextResponse } from 'next/server';
import { sql, toInventoryItem } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const items = await sql`SELECT * FROM inventory ORDER BY category, name`;
    return NextResponse.json(items.map(toInventoryItem));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const itemData = await request.json();
    const id = uuidv4();

    const [item] = await sql`
      INSERT INTO inventory (
        id, name, category, unit, current_stock, min_stock, cost_per_unit, supplier, last_restocked
      ) VALUES (
        ${id}, ${itemData.name}, ${itemData.category}, ${itemData.unit},
        ${itemData.currentStock}, ${itemData.minStock}, ${itemData.costPerUnit},
        ${itemData.supplier || null}, ${itemData.lastRestocked || new Date().toISOString().split('T')[0]}
      ) RETURNING *
    `;

    return NextResponse.json(toInventoryItem(item), { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
