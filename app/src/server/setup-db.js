import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Create orders table
    console.log('Creating orders table...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        line_id VARCHAR(255),
        job_type VARCHAR(50) NOT NULL,
        width DECIMAL(10, 2) NOT NULL,
        height DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        deposit DECIMAL(10, 2) NOT NULL DEFAULT 0,
        remaining DECIMAL(10, 2) NOT NULL DEFAULT 0,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        file_url TEXT,
        file_name VARCHAR(255),
        order_date DATE NOT NULL,
        due_date DATE NOT NULL,
        notes TEXT,
        created_by VARCHAR(255) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Orders table created');

    // Create inventory table
    console.log('Creating inventory table...');
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
        min_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
        cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0,
        supplier VARCHAR(255),
        last_restocked DATE
      )
    `;
    console.log('✓ Inventory table created');

    // Create stock_transactions table
    console.log('Creating stock_transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id UUID PRIMARY KEY,
        item_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
        quantity DECIMAL(10, 2) NOT NULL,
        reason VARCHAR(50) NOT NULL,
        order_id UUID,
        note TEXT,
        created_by VARCHAR(255) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Stock transactions table created');

    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'order-staff',
        phone VARCHAR(50),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Users table created');

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_item ON stock_transactions(item_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON stock_transactions(created_at)`;
    console.log('✓ Indexes created');

    // Check if admin user exists
    console.log('Checking for admin user...');
    const [existingAdmin] = await sql`SELECT id FROM users WHERE username = 'admin'`;
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      await sql`
        INSERT INTO users (id, name, role, username, password, is_active, created_at)
        VALUES (${adminId}, 'Administrator', 'admin', 'admin', ${hashedPassword}, true, NOW())
      `;
      
      console.log('✓ Admin user created');
      console.log('  Username: admin');
      console.log('  Password: admin');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\n✅ Database setup completed successfully!');
    
    // Test connection
    const [result] = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   Total users: ${result.count}`);
    
    const [orderCount] = await sql`SELECT COUNT(*) as count FROM orders`;
    console.log(`   Total orders: ${orderCount.count}`);
    
    const [inventoryCount] = await sql`SELECT COUNT(*) as count FROM inventory`;
    console.log(`   Total inventory items: ${inventoryCount.count}`);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

setupDatabase();
