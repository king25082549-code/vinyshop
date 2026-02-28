'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { ORDER_STATUS_CONFIG, JOB_TYPE_OPTIONS } from '@/lib/constants';
import { formatCurrency, formatDate, getDaysUntilDue, getDueDateBadge } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

export function OrdersList() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success('อัปเดตสถานะสำเร็จ');
  };

  const handleDelete = (orderId: string) => {
    if (confirm('ต้องการลบออเดอร์นี้?')) {
      deleteOrder(orderId);
      toast.success('ลบออเดอร์สำเร็จ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ใบงานทั้งหมด</h1>
          <p className="text-slate-500">รายการออเดอร์ทั้งหมด {filteredOrders.length} รายการ</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, รหัสออเดอร์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="กรองตามสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส/ลูกค้า</TableHead>
                  <TableHead>ประเภทงาน</TableHead>
                  <TableHead>ขนาด</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>กำหนดส่ง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      ไม่พบรายการออเดอร์
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const daysUntilDue = getDaysUntilDue(order.dueDate);
                    const dueBadge = getDueDateBadge(daysUntilDue);

                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-sm text-slate-500">{order.customerName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {JOB_TYPE_OPTIONS.find((t) => t.value === order.jobType)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {order.width} × {order.height} m
                          </span>
                          <span className="text-slate-500 text-sm"> × {order.quantity}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(order.totalPrice)}</p>
                            <p className={`text-xs ${order.remaining === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                              {order.remaining === 0 ? 'ชำระครบ' : `ค้าง ${formatCurrency(order.remaining)}`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                          >
                            <SelectTrigger className="w-36">
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: ORDER_STATUS_CONFIG[order.status].color }}
                              />
                              <span className="text-xs">
                                {ORDER_STATUS_CONFIG[order.status].label}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: config.color }}
                                    />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${dueBadge.color}`}>
                            {dueBadge.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  {/* Order Info */}
                                  <div className="bg-slate-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm text-slate-500">รหัสออเดอร์</p>
                                        <p className="font-bold text-lg">
                                          #{selectedOrder.id.slice(0, 8).toUpperCase()}
                                        </p>
                                      </div>
                                      <span
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{
                                          backgroundColor: `${ORDER_STATUS_CONFIG[selectedOrder.status].color}20`,
                                          color: ORDER_STATUS_CONFIG[selectedOrder.status].color,
                                        }}
                                      >
                                        {ORDER_STATUS_CONFIG[selectedOrder.status].label}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Customer Info */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-slate-800">ข้อมูลลูกค้า</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-slate-500">ชื่อ:</span>
                                        <span className="ml-2">{selectedOrder.customerName}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">เบอร์โทร:</span>
                                        <span className="ml-2">{selectedOrder.phone}</span>
                                      </div>
                                      {selectedOrder.lineId && (
                                        <div className="col-span-2">
                                          <span className="text-slate-500">LINE ID:</span>
                                          <span className="ml-2">{selectedOrder.lineId}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Job Details */}
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-slate-800">รายละเอียดงาน</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-slate-500">ประเภท:</span>
                                        <span className="ml-2">
                                          {JOB_TYPE_OPTIONS.find((t) => t.value === selectedOrder.jobType)?.label}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">ขนาด:</span>
                                        <span className="ml-2">
                                          {selectedOrder.width} × {selectedOrder.height} m
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">จำนวน:</span>
                                        <span className="ml-2">{selectedOrder.quantity} ชิ้น</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">ราคา/ตร.ม.:</span>
                                        <span className="ml-2">{formatCurrency(selectedOrder.unitPrice)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment */}
                                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                    <h4 className="font-medium text-slate-800">การเงิน</h4>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-600">ราคารวม:</span>
                                      <span className="font-medium">{formatCurrency(selectedOrder.totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-600">มัดจำ:</span>
                                      <span className="font-medium text-green-600">{formatCurrency(selectedOrder.deposit)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                                      <span className="text-slate-800 font-medium">คงเหลือ:</span>
                                      <span className={`font-bold ${selectedOrder.remaining === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {formatCurrency(selectedOrder.remaining)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className="flex justify-between text-sm">
                                    <div>
                                      <span className="text-slate-500">วันที่รับ:</span>
                                      <span className="ml-2">{formatDate(selectedOrder.orderDate)}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">กำหนดส่ง:</span>
                                      <span className="ml-2">{formatDate(selectedOrder.dueDate)}</span>
                                    </div>
                                  </div>

                                  {/* Notes */}
                                  {selectedOrder.notes && (
                                    <div className="space-y-1">
                                      <h4 className="font-medium text-slate-800">หมายเหตุ</h4>
                                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                        {selectedOrder.notes}
                                      </p>
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleDelete(selectedOrder.id)}
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      ลบออเดอร์
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
