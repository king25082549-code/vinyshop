// Order Status
export type OrderStatus = 
  | 'pending'
  | 'design'
  | 'ready-to-print'
  | 'eyelet'
  | 'frame-assembly'
  | 'die-cut'
  | 'completed'
  | 'delivered';

// Job Types (now dynamic from DB, keep string type)
export type JobType = string;

// Payment Status
export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'paid';

// Inventory Category (now dynamic from DB)
export type InventoryCategory = string;

// Unit Types (now dynamic from DB)
export type UnitType = string;

// Transaction Type
export type TransactionType = 
  | 'in'
  | 'out';

// Transaction Reason
export type TransactionReason = 
  | 'production'
  | 'restock'
  | 'adjustment'
  | 'waste';

// User Role
export type UserRole = 
  | 'admin'
  | 'order-staff'
  | 'design-staff'
  | 'print-staff'
  | 'delivery-staff';

// Order Interface
export interface Order {
  id: string;
  customerName: string;
  phone: string;
  lineId?: string;
  jobType: JobType;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deposit: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  fileUrl?: string;
  fileName?: string;
  orderDate: string;
  dueDate: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Item Interface
export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: UnitType;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplier?: string;
  lastRestocked?: string;
}

// Stock Transaction Interface
export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  reason: TransactionReason;
  orderId?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

// User Interface
export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  username: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedToday: number;
  totalRevenue: number;
  todayRevenue: number;
  lowStockItems: number;
}

// Status Config
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

// Job Type Config
export interface JobTypeConfig {
  label: string;
  icon: string;
}

// Payment Status Config
export interface PaymentStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

// Daily Revenue
export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

// Order Item (for multi-item orders)
export interface OrderItem {
  id: string;
  orderId: string;
  jobType: string;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

// Dynamic option from DB
export interface DynamicOption {
  id: string;
  name: string;
}
