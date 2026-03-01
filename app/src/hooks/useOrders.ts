import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus, PaymentStatus } from '@/types';
import { ordersApi } from '@/services/api';
import { toast } from 'sonner';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll();
      setOrders(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newOrder = await ordersApi.create(orderData);
      setOrders((prev) => [newOrder, ...prev]);
      toast.success('สร้างออเดอร์สำเร็จ');
      return newOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
    try {
      const updatedOrder = await ordersApi.update(id, updates);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? updatedOrder : order
        )
      );
      toast.success('อัปเดตออเดอร์สำเร็จ');
      return updatedOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      const updatedOrder = await ordersApi.updateStatus(id, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? updatedOrder : order
        )
      );
      toast.success('อัปเดตสถานะสำเร็จ');
      return updatedOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, paymentStatus: PaymentStatus, deposit?: number) => {
    try {
      const updatedOrder = await ordersApi.updatePayment(id, paymentStatus, deposit);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? updatedOrder : order
        )
      );
      toast.success('อัปเดตสถานะการชำระเงินสำเร็จ');
      return updatedOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update payment';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      await ordersApi.delete(id);
      setOrders((prev) => prev.filter((order) => order.id !== id));
      toast.success('ลบออเดอร์สำเร็จ');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete order';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const getOrderById = useCallback((id: string) => {
    return orders.find((order) => order.id === id);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const getTodayOrders = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter((order) => order.orderDate === today);
  }, [orders]);

  const getTodayRevenue = useCallback(async () => {
    try {
      const result = await ordersApi.getTodayRevenue();
      return result.revenue;
    } catch (err) {
      // Fallback to calculating from local data
      const today = new Date().toISOString().split('T')[0];
      return orders
        .filter((order) => order.orderDate === today)
        .reduce((sum, order) => sum + order.deposit, 0);
    }
  }, [orders]);

  const getTotalRevenue = useCallback(async () => {
    try {
      const result = await ordersApi.getTotalRevenue();
      return result.revenue;
    } catch (err) {
      // Fallback to calculating from local data
      return orders.reduce((sum, order) => sum + order.deposit, 0);
    }
  }, [orders]);

  return {
    orders,
    loading,
    error,
    refreshOrders: fetchOrders,
    addOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    getTodayOrders,
    getTodayRevenue,
    getTotalRevenue,
  };
}
