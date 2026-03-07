import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const categories = await sql`SELECT * FROM material_categories ORDER BY name`;
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching material categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const [category] = await sql`
      INSERT INTO material_categories (id, name)
      VALUES (gen_random_uuid(), ${name.trim()})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating material category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
