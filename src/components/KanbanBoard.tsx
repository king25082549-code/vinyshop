'use client';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Eye,
  AlertCircle,
} from 'lucide-react';
import { ORDER_STATUS_CONFIG, KANBAN_COLUMNS } from '@/lib/constants';
import { formatCurrency, formatDate, getDaysUntilDue, getDueDateBadge } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

const ITEM_TYPE = 'order-card';

interface DragItem {
  type: string;
  orderId: string;
  currentStatus: OrderStatus;
}

interface KanbanCardProps {
  order: Order;
}

function KanbanCard({ order }: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: { type: ITEM_TYPE, orderId: order.id, currentStatus: order.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const daysUntilDue = getDaysUntilDue(order.dueDate);
  const dueBadge = getDueDateBadge(daysUntilDue);
  const isUrgent = daysUntilDue <= 1 && daysUntilDue >= -1;

  return (
    <div
      // @ts-expect-error - react-dnd type issue
      ref={drag}
      className={`
        cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'opacity-100'}
        hover:shadow-lg
      `}
    >
      <Card className={`border-l-4 ${isUrgent ? 'border-l-red-500' : 'border-l-transparent'}`}>
        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">
                {order.customerName}
              </p>
              <p className="text-xs text-slate-500">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            {isUrgent && (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>

          {/* Job Type */}
          <Badge variant="outline" className="text-xs">
            {order.jobType}
          </Badge>

          {/* Details */}
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1">
              <span>{order.width} × {order.height} cm ({order.quantity} ชิ้น)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between pt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${dueBadge.color}`}>
              {dueBadge.label}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Eye className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-500">รหัสออเดอร์</p>
                        <p className="font-bold text-lg">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${ORDER_STATUS_CONFIG[order.status].color}20`,
                          color: ORDER_STATUS_CONFIG[order.status].color,
                        }}
                      >
                        {ORDER_STATUS_CONFIG[order.status].label}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800">ข้อมูลลูกค้า</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-500">ชื่อ:</span> {order.customerName}</p>
                      <p><span className="text-slate-500">เบอร์โทร:</span> {order.phone}</p>
                      {order.lineId && <p><span className="text-slate-500">LINE ID:</span> {order.lineId}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800">รายละเอียดงาน</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-500">ประเภท:</span> {order.jobType}</p>
                      <p><span className="text-slate-500">ขนาด:</span> {order.width} × {order.height} cm</p>
                      <p><span className="text-slate-500">จำนวน:</span> {order.quantity} ชิ้น</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">ราคารวม:</span>
                      <span className="font-medium">{formatCurrency(order.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">มัดจำ:</span>
                      <span className="font-medium text-green-600">{formatCurrency(order.deposit)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                      <span className="text-slate-800 font-medium">คงเหลือ:</span>
                      <span className={`font-bold ${order.remaining === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        {formatCurrency(order.remaining)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">วันที่รับ:</span>
                    <span>{formatDate(order.orderDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">กำหนดส่ง:</span>
                    <span>{formatDate(order.dueDate)}</span>
                  </div>

                  {order.notes && (
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-800">หมายเหตุ</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KanbanColumnProps {
  status: OrderStatus;
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

function KanbanColumn({ status, orders, onStatusChange }: KanbanColumnProps) {
  const config = ORDER_STATUS_CONFIG[status];

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: ITEM_TYPE,
    drop: (item) => {
      if (item.currentStatus !== status) {
        onStatusChange(item.orderId, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      // @ts-expect-error - react-dnd type issue
      ref={drop}
      className={`
        flex-shrink-0 w-72 bg-slate-100 rounded-lg p-3 transition-all duration-200
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''}
      `}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-2 rounded-lg mb-3"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <span className="font-medium text-sm" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>
        <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
        {orders.map((order) => (
          <KanbanCard
            key={order.id}
            order={order}
          />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { orders, updateOrderStatus } = useOrders();

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`ย้ายงานไป "${ORDER_STATUS_CONFIG[newStatus].label}"`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สถานะงาน</h1>
          <p className="text-slate-500">ลากการ์ดเพื่อย้ายสถานะงาน</p>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.status}
                orders={orders.filter((o) => o.status === column.status)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
