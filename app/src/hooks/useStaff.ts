import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { usersApi } from '@/services/api';
import { toast } from 'sonner';

export function useStaff() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setStaff(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(message);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน');
    } finally {
      setLoading(false);
    }
  };

  const addStaff = useCallback(async (staffData: Omit<User, 'id' | 'createdAt'> & { password: string }) => {
    try {
      const newStaff = await usersApi.create(staffData);
      setStaff((prev) => [...prev, newStaff]);
      toast.success('เพิ่มพนักงานสำเร็จ');
      return newStaff;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add staff';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const updateStaff = useCallback(async (id: string, updates: Partial<User> & { password?: string }) => {
    try {
      const updatedStaff = await usersApi.update(id, updates);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? updatedStaff : s))
      );
      toast.success('อัปเดตข้อมูลพนักงานสำเร็จ');
      return updatedStaff;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update staff';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const deleteStaff = useCallback(async (id: string) => {
    try {
      await usersApi.delete(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast.success('ลบพนักงานสำเร็จ');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete staff';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      const updatedStaff = await usersApi.update(id, { isActive });
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? updatedStaff : s))
      );
      toast.success(isActive ? 'เปิดใช้งานสำเร็จ' : 'ปิดใช้งานสำเร็จ');
      return updatedStaff;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error('เกิดข้อผิดพลาด: ' + message);
      throw err;
    }
  }, []);

  return {
    staff,
    loading,
    error,
    refreshStaff: fetchStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleActive,
  };
}
