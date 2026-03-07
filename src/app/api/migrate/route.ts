import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        line_id TEXT,
        job_type TEXT NOT NULL,
        width NUMERIC NOT NULL DEFAULT 0,
        height NUMERIC NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC NOT NULL DEFAULT 0,
        total_price NUMERIC NOT NULL DEFAULT 0,
        deposit NUMERIC NOT NULL DEFAULT 0,
        remaining NUMERIC NOT NULL DEFAULT 0,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        status TEXT NOT NULL DEFAULT 'pending',
        file_url TEXT,
        file_name TEXT,
        order_date DATE NOT NULL,
        due_date DATE NOT NULL,
        notes TEXT,
        created_by TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        current_stock NUMERIC NOT NULL DEFAULT 0,
        min_stock NUMERIC NOT NULL DEFAULT 0,
        cost_per_unit NUMERIC NOT NULL DEFAULT 0,
        supplier TEXT,
        last_restocked DATE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity NUMERIC NOT NULL DEFAULT 0,
        reason TEXT NOT NULL,
        order_id UUID,
        note TEXT,
        created_by TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 1. Create material_categories table (user-addable)
    await sql`
      CREATE TABLE IF NOT EXISTS material_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 2. Create units table (user-addable)
    await sql`
      CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 3. Create job_types table (user-addable)
    await sql`
      CREATE TABLE IF NOT EXISTS job_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // 4. Create order_items table for multi-item orders
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        job_type TEXT NOT NULL,
        width NUMERIC NOT NULL DEFAULT 0,
        height NUMERIC NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC NOT NULL DEFAULT 0,
        total_price NUMERIC NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_id ON stock_transactions(item_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`;

    const adminPassword = await bcrypt.hash('admin1234', 10);

    await sql`
      INSERT INTO users (id, name, role, phone, username, password, is_active, created_at)
      VALUES (gen_random_uuid(), 'ผู้ดูแลระบบ', 'admin', NULL, 'admin', ${adminPassword}, true, NOW())
      ON CONFLICT (username) DO NOTHING
    `;

    // 5. Seed default material_categories
    const defaultCategories = ['ไวนิล', 'หมึกพิมพ์', 'สติ๊กเกอร์', 'แผ่นวัสดุ', 'โครง/ขาตั้ง', 'อุปกรณ์เสริม'];
    for (const name of defaultCategories) {
      await sql`
        INSERT INTO material_categories (id, name)
        VALUES (gen_random_uuid(), ${name})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // 6. Seed default units
    const defaultUnits = ['เมตร', 'ม้วน', 'แผ่น', 'ชิ้น', 'ลิตร', 'ตร.ม.', 'ฟุต', 'ชุด'];
    for (const name of defaultUnits) {
      await sql`
        INSERT INTO units (id, name)
        VALUES (gen_random_uuid(), ${name})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // 7. Seed default job_types
    const defaultJobTypes = ['ป้ายไวนิล', 'สติ๊กเกอร์', 'แบ็คดรอป', 'โรลอัพ', 'ป้ายโครง', 'ไวนิลเจาะตาไก่', 'สติ๊กเกอร์ไดคัท', 'อื่นๆ'];
    for (const name of defaultJobTypes) {
      await sql`
        INSERT INTO job_types (id, name)
        VALUES (gen_random_uuid(), ${name})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    return NextResponse.json({ success: true, message: 'Migration completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 });
  }
}
