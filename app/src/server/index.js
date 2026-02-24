import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sql = neon(process.env.DATABASE_URL);

function toOrder(row) {
  if (!row) return row;
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    lineId: row.line_id ?? undefined,
    jobType: row.job_type,
    width: Number(row.width),
    height: Number(row.height),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
    deposit: Number(row.deposit),
    remaining: Number(row.remaining),
    paymentStatus: row.payment_status,
    status: row.status,
    fileUrl: row.file_url ?? undefined,
    fileName: row.file_name ?? undefined,
    orderDate: typeof row.order_date === 'string' ? row.order_date : new Date(row.order_date).toISOString().split('T')[0],
    dueDate: typeof row.due_date === 'string' ? row.due_date : new Date(row.due_date).toISOString().split('T')[0],
    notes: row.notes ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

function toInventoryItem(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    currentStock: Number(row.current_stock),
    minStock: Number(row.min_stock),
    costPerUnit: Number(row.cost_per_unit),
    supplier: row.supplier ?? undefined,
    lastRestocked: row.last_restocked ?? undefined,
  };
}

function toStockTransaction(row) {
  if (!row) return row;
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    type: row.type,
    quantity: Number(row.quantity),
    reason: row.reason,
    orderId: row.order_id ?? undefined,
    note: row.note ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function toUser(row) {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    phone: row.phone ?? undefined,
    username: row.username,
    isActive: row.is_active,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

// ============ ORDERS API ============

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    res.json(orders.map(toOrder));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [order] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(toOrder(order));
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
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
    
    res.status(201).json(toOrder(order));
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
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
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(toOrder(order));
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const now = new Date().toISOString();
    
    const [order] = await sql`
      UPDATE orders SET status = ${status}, updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(toOrder(order));
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update payment status
app.patch('/api/orders/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, deposit } = req.body;
    const now = new Date().toISOString();
    
    const [order] = await sql`
      UPDATE orders SET 
        payment_status = ${paymentStatus}, 
        deposit = COALESCE(${deposit}, deposit),
        remaining = total_price - COALESCE(${deposit}, deposit),
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(toOrder(order));
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM orders WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get orders by status
app.get('/api/orders/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await sql`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC`;
    res.json(orders.map(toOrder));
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get today's orders
app.get('/api/orders/today/all', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const orders = await sql`SELECT * FROM orders WHERE order_date = ${today} ORDER BY created_at DESC`;
    res.json(orders.map(toOrder));
  } catch (error) {
    console.error('Error fetching today orders:', error);
    res.status(500).json({ error: 'Failed to fetch today orders' });
  }
});

// Get today's revenue
app.get('/api/revenue/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await sql`SELECT COALESCE(SUM(deposit), 0) as revenue FROM orders WHERE order_date = ${today}`;
    res.json({ revenue: parseFloat(result.revenue) });
  } catch (error) {
    console.error('Error fetching today revenue:', error);
    res.status(500).json({ error: 'Failed to fetch today revenue' });
  }
});

// Get total revenue
app.get('/api/revenue/total', async (req, res) => {
  try {
    const [result] = await sql`SELECT COALESCE(SUM(deposit), 0) as revenue FROM orders`;
    res.json({ revenue: parseFloat(result.revenue) });
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    res.status(500).json({ error: 'Failed to fetch total revenue' });
  }
});

// ============ INVENTORY API ============

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await sql`SELECT * FROM inventory ORDER BY category, name`;
    res.json(items.map(toInventoryItem));
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory item by ID
app.get('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [item] = await sql`SELECT * FROM inventory WHERE id = ${id}`;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(toInventoryItem(item));
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Create inventory item
app.post('/api/inventory', async (req, res) => {
  try {
    const itemData = req.body;
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
    
    res.status(201).json(toInventoryItem(item));
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Update inventory item
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
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
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(toInventoryItem(item));
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM inventory WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Add stock
app.post('/api/inventory/:id/add-stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, note, orderId, createdBy } = req.body;
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    // Get item name
    const [item] = await sql`SELECT name FROM inventory WHERE id = ${id}`;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Update inventory
    await sql`UPDATE inventory SET current_stock = current_stock + ${quantity}, last_restocked = ${today} WHERE id = ${id}`;
    
    // Create transaction
    const transactionId = uuidv4();
    await sql`
      INSERT INTO stock_transactions (
        id, item_id, item_name, type, quantity, reason, order_id, note, created_by, created_at
      ) VALUES (
        ${transactionId}, ${id}, ${item.name}, 'in', ${quantity}, ${reason}, ${orderId || null}, ${note || null}, ${createdBy || 'admin'}, ${now}
      )
    `;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Remove stock
app.post('/api/inventory/:id/remove-stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, note, orderId, createdBy } = req.body;
    const now = new Date().toISOString();
    
    // Get item name
    const [item] = await sql`SELECT name FROM inventory WHERE id = ${id}`;
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Update inventory
    await sql`UPDATE inventory SET current_stock = GREATEST(0, current_stock - ${quantity}) WHERE id = ${id}`;
    
    // Create transaction
    const transactionId = uuidv4();
    await sql`
      INSERT INTO stock_transactions (
        id, item_id, item_name, type, quantity, reason, order_id, note, created_by, created_at
      ) VALUES (
        ${transactionId}, ${id}, ${item.name}, 'out', ${quantity}, ${reason}, ${orderId || null}, ${note || null}, ${createdBy || 'admin'}, ${now}
      )
    `;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing stock:', error);
    res.status(500).json({ error: 'Failed to remove stock' });
  }
});

// Get low stock items
app.get('/api/inventory/low-stock/all', async (req, res) => {
  try {
    const items = await sql`SELECT * FROM inventory WHERE current_stock <= min_stock ORDER BY category, name`;
    res.json(items.map(toInventoryItem));
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get stock transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const transactions = await sql`SELECT * FROM stock_transactions ORDER BY created_at DESC LIMIT ${limit}`;
    res.json(transactions.map(toStockTransaction));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions by item
app.get('/api/transactions/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const transactions = await sql`SELECT * FROM stock_transactions WHERE item_id = ${itemId} ORDER BY created_at DESC`;
    res.json(transactions.map(toStockTransaction));
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ============ USERS API ============

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users ORDER BY name`;
    res.json(users.map(toUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(toUser(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await sql`
      INSERT INTO users (id, name, role, phone, username, password, is_active, created_at)
      VALUES (${id}, ${userData.name}, ${userData.role}, ${userData.phone || null}, ${userData.username}, ${hashedPassword}, ${userData.isActive !== false}, ${now})
      RETURNING *
    `;
    
    res.status(201).json(toUser(user));
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    let hashedPassword = null;
    if (updates.password) {
      hashedPassword = await bcrypt.hash(updates.password, 10);
    }
    
    const [user] = await sql`
      UPDATE users SET
        name = COALESCE(${updates.name}, name),
        role = COALESCE(${updates.role}, role),
        phone = COALESCE(${updates.phone}, phone),
        username = COALESCE(${updates.username}, username),
        password = COALESCE(${hashedPassword}, password),
        is_active = COALESCE(${updates.isActive}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(toUser(user));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM users WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [user] = await sql`SELECT * FROM users WHERE username = ${username} AND is_active = true`;
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Don't return password
    res.json(toUser(user));
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Export app for serverless platforms (e.g., Vercel)
export default app;

// Only listen when running this file directly (local dev)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
