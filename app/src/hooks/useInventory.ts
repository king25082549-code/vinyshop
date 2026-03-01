import { useState, useEffect, useCallback } from 'react';
import type { InventoryItem, StockTransaction, TransactionReason } from '@/types';
import { inventoryApi } from '@/services/api';
import { toast } from 'sonner';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(message);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสต็อก');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await inventoryApi.getTransactions(50);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const addItem = useCallback(async (itemData: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = await inventoryApi.create(itemData);
      setItems((prev) => [...prev, newItem]);
      toast.success('เพิ่มรายการสต็อกสำเร็จ');
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = await inventoryApi.update(id, updates);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? updatedItem : item
        )
      );
      toast.success('อัปเดตรายการสต็อกสำเร็จ');
      return updatedItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await inventoryApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('ลบรายการสต็อกสำเร็จ');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const addStock = useCallback(async (
    id: string, 
    quantity: number, 
    reason: TransactionReason, 
    note?: string,
    orderId?: string,
    createdBy?: string
  ) => {
    try {
      await inventoryApi.addStock(id, quantity, reason, note, orderId, createdBy);
      await fetchInventory();
      await fetchTransactions();
      toast.success('เพิ่มสต็อกสำเร็จ');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add stock';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const removeStock = useCallback(async (
    id: string, 
    quantity: number, 
    reason: TransactionReason, 
    note?: string,
    orderId?: string,
    createdBy?: string
  ) => {
    try {
      await inventoryApi.removeStock(id, quantity, reason, note, orderId, createdBy);
      await fetchInventory();
      await fetchTransactions();
      toast.success('เบิกสต็อกสำเร็จ');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove stock';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const getItemById = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  const getLowStockItems = useCallback(() => {
    return items.filter((item) => item.currentStock <= item.minStock);
  }, [items]);

  const getItemsByCategory = useCallback((category: InventoryItem['category']) => {
    return items.filter((item) => item.category === category);
  }, [items]);

  const deductVinylForOrder = useCallback(async (width: number, height: number, quantity: number, orderId?: string) => {
    const vinylItems = items.filter((i) => i.category === 'vinyl');
    const vinyl = vinylItems[0];
    if (!vinyl) {
      toast.error('ไม่พบวัสดุประเภทไวนิลในคลัง');
      return;
    }

    // Basic usage estimation: area * quantity (meter^2) -> treat as "meter" consumption
    const estimatedUsage = Math.max(0.01, width * height * quantity);
    try {
      await inventoryApi.removeStock(
        vinyl.id,
        estimatedUsage,
        'production',
        `ตัดสต็อกอัตโนมัติสำหรับออเดอร์${orderId ? ` ${orderId.slice(0, 8)}` : ''}`,
        orderId,
        'admin'
      );
      await fetchInventory();
      await fetchTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deduct vinyl';
      toast.error('ตัดสต็อกอัตโนมัติไม่สำเร็จ: ' + message);
    }
  }, [items]);

  return {
    items,
    transactions,
    loading,
    error,
    refreshInventory: fetchInventory,
    refreshTransactions: fetchTransactions,
    addItem,
    updateItem,
    deleteItem,
    addStock,
    removeStock,
    getItemById,
    getLowStockItems,
    getItemsByCategory,
    deductVinylForOrder,
  };
}
