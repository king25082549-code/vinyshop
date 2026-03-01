import { NextResponse } from 'next/server';
import { sql, toInventoryItem } from '@/lib/db';

export async function GET() {
  try {
    const items = await sql`SELECT * FROM inventory WHERE current_stock <= min_stock ORDER BY category, name`;
    return NextResponse.json(items.map(toInventoryItem));
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock items' }, { status: 500 });
  }
}
