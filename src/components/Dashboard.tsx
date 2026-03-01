'use client';

import { useEffect, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ClipboardList,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Package,
} from 'lucide-react';
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
import { ORDER_STATUS_CONFIG, JOB_TYPE_OPTIONS } from '@/lib/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { orders, getTodayRevenue, getTotalRevenue } = useOrders();
  const { getLowStockItems } = useInventory();

  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [today, total] = await Promise.all([getTodayRevenue(), getTotalRevenue()]);
      if (!isMounted) return;
      setTodayRevenue(today);
      setTotalRevenue(total);
    })();
    return () => {
      isMounted = false;
    };
  }, [getTodayRevenue, getTotalRevenue]);

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = getLowStockItems().length;

  // Status distribution for pie chart
  const statusData = Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => ({
    name: config.label,
    value: orders.filter((o) => o.status === status).length,
    color: config.color,
  })).filter(d => d.value > 0);

  // Weekly revenue data
  const getWeeklyData = () => {
    const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter((o) => o.orderDate === dateStr);
      const revenue = dayOrders.reduce((sum, o) => sum + o.deposit, 0);
      data.push({
        day: days[date.getDay()],
        revenue,
        orders: dayOrders.length,
      });
    }
    return data;
  };

  const weeklyData = getWeeklyData();

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">ภาพรวมธุรกิจร้านป้ายไวนิล</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ออเดอร์ทั้งหมด"
          value={formatNumber(totalOrders)}
          subtitle={`${formatNumber(pendingOrders)} รายการรอดำเนินการ`}
          icon={ClipboardList}
          color="#3B82F6"
        />
        <StatCard
          title="รายได้วันนี้"
          value={formatCurrency(todayRevenue)}
          subtitle={`จาก ${orders.filter(o => o.orderDate === new Date().toISOString().split('T')[0]).length} ออเดอร์`}
          icon={Banknote}
          color="#22C55E"
        />
        <StatCard
          title="รายได้รวม"
          value={formatCurrency(totalRevenue)}
          subtitle="ยอดมัดจำที่รับมา"
          icon={TrendingUp}
          color="#8B5CF6"
        />
        <StatCard
          title="สต๊อกใกล้หมด"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'ต้องสั่งซื้อด่วน' : 'สต๊อกปกติ'}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? '#EF4444' : '#22C55E'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">รายได้ 7 วันล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickFormatter={(value) => `฿${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">สถานะงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {statusData.map((item) => (
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

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">ออเดอร์ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-slate-500 text-center py-4">ไม่มีออเดอร์</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{order.customerName}</p>
                      <p className="text-sm text-slate-500">
                        {JOB_TYPE_OPTIONS.find((t) => t.value === order.jobType)?.label} • {order.width}x{order.height}m
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${ORDER_STATUS_CONFIG[order.status].color}20`,
                          color: ORDER_STATUS_CONFIG[order.status].color,
                        }}
                      >
                        {ORDER_STATUS_CONFIG[order.status].label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              แจ้งเตือนสต๊อกใกล้หมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getLowStockItems().length === 0 ? (
                <p className="text-slate-500 text-center py-4">สต๊อกปกติ ไม่มีรายการใกล้หมด</p>
              ) : (
                getLowStockItems().map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          เหลือ {formatNumber(item.currentStock)} {item.unit}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      ต่ำกว่า {item.minStock}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
