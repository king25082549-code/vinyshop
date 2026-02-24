// API client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Orders API
export const ordersApi = {
  getAll: () => fetchApi<Order[]>('/orders'),
  getById: (id: string) => fetchApi<Order>(`/orders/${id}`),
  getByStatus: (status: OrderStatus) => fetchApi<Order[]>(`/orders/status/${status}`),
  create: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => 
    fetchApi<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Order>) => 
    fetchApi<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: OrderStatus) => 
    fetchApi<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updatePayment: (id: string, paymentStatus: PaymentStatus, deposit?: number) => 
    fetchApi<Order>(`/orders/${id}/payment`, { 
      method: 'PATCH', 
      body: JSON.stringify({ paymentStatus, deposit }) 
    }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/orders/${id}`, { method: 'DELETE' }),
  getTodayOrders: () => fetchApi<Order[]>('/orders/today/all'),
  getTodayRevenue: () => fetchApi<{ revenue: number }>('/revenue/today'),
  getTotalRevenue: () => fetchApi<{ revenue: number }>('/revenue/total'),
};

// Inventory API
export const inventoryApi = {
  getAll: () => fetchApi<InventoryItem[]>('/inventory'),
  getById: (id: string) => fetchApi<InventoryItem>(`/inventory/${id}`),
  create: (data: Omit<InventoryItem, 'id'>) => 
    fetchApi<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<InventoryItem>) => 
    fetchApi<InventoryItem>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/inventory/${id}`, { method: 'DELETE' }),
  addStock: (id: string, quantity: number, reason: TransactionReason, note?: string, orderId?: string, createdBy?: string) => 
    fetchApi<{ success: boolean }>(`/inventory/${id}/add-stock`, { 
      method: 'POST', 
      body: JSON.stringify({ quantity, reason, note, orderId, createdBy }) 
    }),
  removeStock: (id: string, quantity: number, reason: TransactionReason, note?: string, orderId?: string, createdBy?: string) => 
    fetchApi<{ success: boolean }>(`/inventory/${id}/remove-stock`, { 
      method: 'POST', 
      body: JSON.stringify({ quantity, reason, note, orderId, createdBy }) 
    }),
  getLowStock: () => fetchApi<InventoryItem[]>('/inventory/low-stock/all'),
  getTransactions: (limit?: number) => 
    fetchApi<StockTransaction[]>(`/transactions${limit ? `?limit=${limit}` : ''}`),
  getTransactionsByItem: (itemId: string) => 
    fetchApi<StockTransaction[]>(`/transactions/item/${itemId}`),
};

// Users API
export const usersApi = {
  getAll: () => fetchApi<User[]>('/users'),
  getById: (id: string) => fetchApi<User>(`/users/${id}`),
  create: (data: Omit<User, 'id' | 'createdAt'> & { password: string }) => 
    fetchApi<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<User> & { password?: string }) => 
    fetchApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  login: (username: string, password: string) => 
    fetchApi<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
};

// Health check
export const healthApi = {
  check: () => fetchApi<{ status: string; database: string }>('/health'),
};

// Types (re-export from types/index)
import type { Order, OrderStatus, PaymentStatus, InventoryItem, StockTransaction, TransactionReason, User } from '@/types';
export { ApiError };
