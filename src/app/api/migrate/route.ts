import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // 1. Create material_categories table (user-addable)
    await sql`
      CREATE TABLE IF NOT EXISTS material_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Create units table (user-addable)
    await sql`
      CREATE TABLE IF NOT EXISTS units (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. Create job_types table (user-addable)
    await sql`
      CREATE TABLE IF NOT EXISTS job_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 4. Create order_items table for multi-item orders
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        job_type TEXT NOT NULL,
        width NUMERIC NOT NULL DEFAULT 0,
        height NUMERIC NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC NOT NULL DEFAULT 0,
        total_price NUMERIC NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 5. Seed default material_categories
    const defaultCategories = ['ไวนิล', 'หมึกพิมพ์', 'สติ๊กเกอร์', 'แผ่นวัสดุ', 'โครง/ขาตั้ง', 'อุปกรณ์เสริม'];
    for (const name of defaultCategories) {
      await sql`
        INSERT INTO material_categories (id, name)
        VALUES (gen_random_uuid()::text, ${name})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // 6. Seed default units
    const defaultUnits = ['เมตร', 'ม้วน', 'แผ่น', 'ชิ้น', 'ลิตร', 'ตร.ม.', 'ฟุต', 'ชุด'];
    for (const name of defaultUnits) {
      await sql`
        INSERT INTO units (id, name)
        VALUES (gen_random_uuid()::text, ${name})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // 7. Seed default job_types
    const defaultJobTypes = ['ป้ายไวนิล', 'สติ๊กเกอร์', 'แบ็คดรอป', 'โรลอัพ', 'ป้ายโครง', 'ไวนิลเจาะตาไก่', 'สติ๊กเกอร์ไดคัท', 'อื่นๆ'];
    for (const name of defaultJobTypes) {
      await sql`
        INSERT INTO job_types (id, name)
        VALUES (gen_random_uuid()::text, ${name})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    return NextResponse.json({ success: true, message: 'Migration completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 });
  }
}
