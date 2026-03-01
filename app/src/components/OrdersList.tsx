'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Eye,
  Pencil,
  X,
} from 'lucide-react';
import { ORDER_STATUS_CONFIG, JOB_TYPE_OPTIONS } from '@/lib/constants';
import { calculatePrice, formatCurrency, formatDate, getDaysUntilDue, getDueDateBadge } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

export function OrdersList() {
  const { orders, updateOrder, updateOrderStatus, deleteOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});

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

  const openOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({ ...order });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditCancel = () => {
    if (!selectedOrder) return;
    setEditForm({ ...selectedOrder });
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!selectedOrder) return;

    try {
      const width = Number(editForm.width ?? selectedOrder.width);
      const height = Number(editForm.height ?? selectedOrder.height);
      const quantity = Number(editForm.quantity ?? selectedOrder.quantity);
      const unitPrice = Number(editForm.unitPrice ?? selectedOrder.unitPrice);
      const deposit = Number(editForm.deposit ?? selectedOrder.deposit);

      const totalPrice = calculatePrice(width, height, quantity, unitPrice);
      const remaining = Math.max(totalPrice - deposit, 0);

      const updated = await updateOrder(selectedOrder.id, {
        customerName: editForm.customerName ?? selectedOrder.customerName,
        phone: editForm.phone ?? selectedOrder.phone,
        lineId: editForm.lineId ?? selectedOrder.lineId,
        jobType: editForm.jobType ?? selectedOrder.jobType,
        width,
        height,
        quantity,
        unitPrice,
        totalPrice,
        deposit,
        remaining,
        dueDate: (editForm.dueDate as string | undefined) ?? selectedOrder.dueDate,
        notes: editForm.notes ?? selectedOrder.notes,
      });

      setSelectedOrder(updated);
      setEditForm({ ...updated });
      setIsEditing(false);
      toast.success('บันทึกการแก้ไขสำเร็จ');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update order';
      toast.error('บันทึกไม่สำเร็จ: ' + message);
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
          <div className="table-container overflow-x-auto">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDialog(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditing(false);
            setSelectedOrder(null);
            setEditForm({});
          }
        }}
      >
        <DialogContent className="max-w-lg modal-content">
          <DialogHeader>
            <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm text-slate-500">รหัสออเดอร์</p>
                    <p className="font-bold text-lg">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        แก้ไข
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={handleEditSave}>บันทึก</Button>
                        <Button variant="outline" size="sm" onClick={handleEditCancel}>ยกเลิก</Button>
                      </>
                    )}
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
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-800">ข้อมูลลูกค้า</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <Label>ชื่อ</Label>
                    <Input
                      disabled={!isEditing}
                      value={(editForm.customerName as string | undefined) ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, customerName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>เบอร์โทร</Label>
                    <Input
                      disabled={!isEditing}
                      value={(editForm.phone as string | undefined) ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label>LINE ID</Label>
                    <Input
                      disabled={!isEditing}
                      value={(editForm.lineId as string | undefined) ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, lineId: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-800">รายละเอียดงาน</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <Label>ประเภทงาน</Label>
                    <Select
                      value={(editForm.jobType as string | undefined) ?? selectedOrder.jobType}
                      onValueChange={(value) => setEditForm((p) => ({ ...p, jobType: value as Order['jobType'] }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทงาน" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>จำนวน</Label>
                    <Input
                      disabled={!isEditing}
                      type="number"
                      value={String((editForm.quantity as number | undefined) ?? selectedOrder.quantity)}
                      onChange={(e) => setEditForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>กว้าง (m)</Label>
                    <Input
                      disabled={!isEditing}
                      type="number"
                      value={String((editForm.width as number | undefined) ?? selectedOrder.width)}
                      onChange={(e) => setEditForm((p) => ({ ...p, width: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>สูง (m)</Label>
                    <Input
                      disabled={!isEditing}
                      type="number"
                      value={String((editForm.height as number | undefined) ?? selectedOrder.height)}
                      onChange={(e) => setEditForm((p) => ({ ...p, height: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label>ราคา/ตร.ม.</Label>
                    <Input
                      disabled={!isEditing}
                      type="number"
                      value={String((editForm.unitPrice as number | undefined) ?? selectedOrder.unitPrice)}
                      onChange={(e) => setEditForm((p) => ({ ...p, unitPrice: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-slate-800">การเงิน</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">ราคารวม:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      calculatePrice(
                        Number(editForm.width ?? selectedOrder.width),
                        Number(editForm.height ?? selectedOrder.height),
                        Number(editForm.quantity ?? selectedOrder.quantity),
                        Number(editForm.unitPrice ?? selectedOrder.unitPrice)
                      )
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm gap-3">
                  <span className="text-slate-600">มัดจำ:</span>
                  <div className="w-40">
                    <Input
                      disabled={!isEditing}
                      type="number"
                      value={String((editForm.deposit as number | undefined) ?? selectedOrder.deposit)}
                      onChange={(e) => setEditForm((p) => ({ ...p, deposit: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                  <span className="text-slate-800 font-medium">คงเหลือ:</span>
                  <span className="font-bold text-amber-600">
                    {formatCurrency(
                      Math.max(
                        calculatePrice(
                          Number(editForm.width ?? selectedOrder.width),
                          Number(editForm.height ?? selectedOrder.height),
                          Number(editForm.quantity ?? selectedOrder.quantity),
                          Number(editForm.unitPrice ?? selectedOrder.unitPrice)
                        ) - Number(editForm.deposit ?? selectedOrder.deposit),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <Label>วันที่รับ</Label>
                  <Input disabled value={formatDate(selectedOrder.orderDate)} />
                </div>
                <div className="space-y-1">
                  <Label>กำหนดส่ง</Label>
                  <Input
                    disabled={!isEditing}
                    type="date"
                    value={String((editForm.dueDate as string | undefined) ?? selectedOrder.dueDate)}
                    onChange={(e) => setEditForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>หมายเหตุ</Label>
                <Textarea
                  disabled={!isEditing}
                  value={(editForm.notes as string | undefined) ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
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
    </div>
  );
}
