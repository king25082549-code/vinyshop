'use client';

import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingUp,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { PAYMENT_STATUS_CONFIG } from '@/lib/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function Finance() {
  const { orders } = useOrders();
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return orders.filter((order) => {
      if (periodFilter === 'today') {
        return order.orderDate === today;
      } else if (periodFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(order.orderDate) >= weekAgo;
      } else if (periodFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return new Date(order.orderDate) >= monthAgo;
      }
      return true;
    });
  }, [orders, periodFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalDeposit = filteredOrders.reduce((sum, o) => sum + o.deposit, 0);
    const totalRemaining = filteredOrders.reduce((sum, o) => sum + o.remaining, 0);
    const paidOrders = filteredOrders.filter((o) => o.paymentStatus === 'paid').length;
    const partialOrders = filteredOrders.filter((o) => o.paymentStatus === 'partial').length;
    const pendingOrders = filteredOrders.filter((o) => o.paymentStatus === 'pending').length;

    return {
      totalRevenue,
      totalDeposit,
      totalRemaining,
      paidOrders,
      partialOrders,
      pendingOrders,
      totalOrders: filteredOrders.length,
    };
  }, [filteredOrders]);

  // Payment status data for pie chart
  const paymentStatusData = [
    { name: 'ชำระครบ', value: stats.paidOrders, color: '#22C55E' },
    { name: 'ชำระบางส่วน', value: stats.partialOrders, color: '#F59E0B' },
    { name: 'รอชำระ', value: stats.pendingOrders, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  // Daily revenue data
  const dailyRevenueData = useMemo(() => {
    const data: Record<string, { date: string; revenue: number; deposit: number; orders: number }> = {};

    filteredOrders.forEach((order) => {
      if (!data[order.orderDate]) {
        data[order.orderDate] = {
          date: order.orderDate,
          revenue: 0,
          deposit: 0,
          orders: 0,
        };
      }
      data[order.orderDate].revenue += order.totalPrice;
      data[order.orderDate].deposit += order.deposit;
      data[order.orderDate].orders += 1;
    });

    return Object.values(data)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [filteredOrders]);

  // Job type revenue
  const jobTypeRevenue = useMemo(() => {
    const data: Record<string, { type: string; revenue: number; count: number }> = {};

    filteredOrders.forEach((order) => {
      const typeLabel = order.jobType || 'อื่นๆ';
      if (!data[order.jobType]) {
        data[order.jobType] = {
          type: typeLabel,
          revenue: 0,
          count: 0,
        };
      }
      data[order.jobType].revenue += order.totalPrice;
      data[order.jobType].count += 1;
    });

    return Object.values(data);
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">การเงิน</h1>
          <p className="text-slate-500">สรุปรายรับรายจ่ายและยอดค้างชำระ</p>
        </div>
        <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as typeof periodFilter)}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">วันนี้</SelectItem>
            <SelectItem value="week">7 วันล่าสุด</SelectItem>
            <SelectItem value="month">30 วันล่าสุด</SelectItem>
            <SelectItem value="all">ทั้งหมด</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">รายได้รวม</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">รับมาแล้ว</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalDeposit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">ค้างรับ</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRemaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">จำนวนออเดอร์</p>
                <p className="text-lg font-bold">{formatNumber(stats.totalOrders)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายได้รายวัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={10}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={10}
                    tickFormatter={(value) => `฿${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" name="รายได้รวม" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deposit" fill="#22C55E" name="รับมาแล้ว" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สถานะการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {paymentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Type Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">รายได้ตามประเภทงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {jobTypeRevenue.map((item) => (
              <div key={item.type} className="bg-slate-50 p-4 rounded-lg text-center">
                <p className="text-sm text-slate-500">{item.type}</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(item.revenue)}</p>
                <p className="text-xs text-slate-400">{item.count} ออเดอร์</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            รายการค้างชำระ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ประเภทงาน</TableHead>
                  <TableHead>ราคารวม</TableHead>
                  <TableHead>มัดจำ</TableHead>
                  <TableHead>ค้างชำระ</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders
                  .filter((o) => o.remaining > 0)
                  .sort((a, b) => b.remaining - a.remaining)
                  .slice(0, 10)
                  .map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-slate-500">{order.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.jobType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(order.deposit)}</TableCell>
                      <TableCell className="text-amber-600 font-bold">{formatCurrency(order.remaining)}</TableCell>
                      <TableCell>
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: PAYMENT_STATUS_CONFIG[order.paymentStatus].bgColor,
                            color: PAYMENT_STATUS_CONFIG[order.paymentStatus].color,
                          }}
                        >
                          {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredOrders.filter((o) => o.remaining > 0).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      ไม่มีรายการค้างชำระ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
