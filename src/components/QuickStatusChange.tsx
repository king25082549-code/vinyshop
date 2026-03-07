'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, CheckCircle } from 'lucide-react';
import { KANBAN_COLUMNS, ORDER_STATUS_CONFIG } from '@/lib/constants';
import { useOrders } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';
import { toast } from 'sonner';

export function QuickStatusChange() {
  const { orders, updateOrderStatus } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<OrderStatus>(KANBAN_COLUMNS[0].status);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const workflowStatusOptions = KANBAN_COLUMNS.map(({ status }) => ({
    value: status,
    config: ORDER_STATUS_CONFIG[status],
  }));

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleStatusChange = () => {
    if (!selectedOrderId || !newStatus) {
      toast.error('กรุณาเลือกออเดอร์และสถานะใหม่');
      return;
    }

    updateOrderStatus(selectedOrderId, newStatus);
    toast.success('อัปเดตสถานะสำเร็จ');
    
    // Reset form
    setSelectedOrderId('');
    setNewStatus(KANBAN_COLUMNS[0].status);
    setSearchTerm('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1" size="lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          อัปเดตสถานะงาน
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>อัปเดตสถานะงาน</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ค้นหาออเดอร์</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="เลือกออเดอร์..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          #{order.id.slice(0, 8).toUpperCase()} - {order.customerName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {order.jobType} • {formatCurrency(order.totalPrice)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Status */}
          {selectedOrder && (
            <div className="space-y-2">
              <label className="text-sm font-medium">สถานะปัจจุบัน</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ORDER_STATUS_CONFIG[selectedOrder.status]?.color }}
                />
                <span className="text-sm">
                  {ORDER_STATUS_CONFIG[selectedOrder.status]?.label}
                </span>
              </div>
            </div>
          )}

          {/* New Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">สถานะใหม่</label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกสถานะใหม่..." />
              </SelectTrigger>
              <SelectContent>
                {workflowStatusOptions.map(({ value, config }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleStatusChange}
              disabled={!selectedOrderId || !newStatus}
              className="flex-1"
            >
              อัปเดตสถานะ
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}
