import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

// snake_case → camelCase conversion functions

export function toOrder(row: Record<string, unknown>) {
  if (!row) return row;
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    lineId: (row.line_id as string) ?? undefined,
    jobType: row.job_type as string,
    width: Number(row.width),
    height: Number(row.height),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
    deposit: Number(row.deposit),
    remaining: Number(row.remaining),
    paymentStatus: row.payment_status as string,
    status: row.status as string,
    fileUrl: (row.file_url as string) ?? undefined,
    fileName: (row.file_name as string) ?? undefined,
    orderDate: typeof row.order_date === 'string' ? row.order_date : new Date(row.order_date as string).toISOString().split('T')[0],
    dueDate: typeof row.due_date === 'string' ? row.due_date : new Date(row.due_date as string).toISOString().split('T')[0],
    notes: (row.notes as string) ?? undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at as string,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at as string,
  };
}

export function toInventoryItem(row: Record<string, unknown>) {
  if (!row) return row;
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    unit: row.unit as string,
    currentStock: Number(row.current_stock),
    minStock: Number(row.min_stock),
    costPerUnit: Number(row.cost_per_unit),
    supplier: (row.supplier as string) ?? undefined,
    lastRestocked: (row.last_restocked as string) ?? undefined,
  };
}

export function toStockTransaction(row: Record<string, unknown>) {
  if (!row) return row;
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    itemName: row.item_name as string,
    type: row.type as string,
    quantity: Number(row.quantity),
    reason: row.reason as string,
    orderId: (row.order_id as string) ?? undefined,
    note: (row.note as string) ?? undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at as string,
  };
}

export function toUser(row: Record<string, unknown>) {
  if (!row) return row;
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    phone: (row.phone as string) ?? undefined,
    username: row.username as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at as string,
  };
}
