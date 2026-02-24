import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Package,
  Plus,
  Search,
  AlertTriangle,
  History,
  ArrowUp,
  ArrowDown,
  Box,
} from 'lucide-react';
import { INVENTORY_CATEGORY_OPTIONS, UNIT_OPTIONS, INVENTORY_CATEGORY_LABELS, UNIT_LABELS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type { InventoryItem, InventoryCategory, UnitType, TransactionReason } from '@/types';
import { toast } from 'sonner';

export function Inventory() {
  const { items, transactions, addItem, addStock, removeStock, getLowStockItems } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    category: '' as InventoryCategory | '',
    unit: '' as UnitType | '',
    currentStock: '',
    minStock: '',
    costPerUnit: '',
    supplier: '',
  });

  // Stock adjustment
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState<TransactionReason>('restock');
  const [adjustNote, setAdjustNote] = useState('');

  // Filter items
  const filteredItems: InventoryItem[] = items.filter((item: InventoryItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || item.currentStock <= item.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    try {
      await addItem({
        name: newItem.name,
        category: newItem.category as InventoryCategory,
        unit: newItem.unit as UnitType,
        currentStock: parseFloat(newItem.currentStock) || 0,
        minStock: parseFloat(newItem.minStock) || 0,
        costPerUnit: parseFloat(newItem.costPerUnit) || 0,
        supplier: newItem.supplier || undefined,
      });

      toast.success('เพิ่มวัสดุสำเร็จ');
      setNewItem({
        name: '',
        category: '',
        unit: '',
        currentStock: '',
        minStock: '',
        costPerUnit: '',
        supplier: '',
      });
    } catch {
      // error handled in hook
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustItem || !adjustQuantity) return;

    const quantity = parseFloat(adjustQuantity);
    if (quantity <= 0) {
      toast.error('กรุณากรอกจำนวนที่ถูกต้อง');
      return;
    }

    try {
      if (adjustReason === 'restock' || adjustReason === 'adjustment') {
        await addStock(adjustItem.id, quantity, adjustReason, adjustNote);
        toast.success(`รับเข้า ${adjustItem.name} ${quantity} ${adjustItem.unit}`);
      } else {
        await removeStock(adjustItem.id, quantity, adjustReason, adjustNote);
        toast.success(`เบิกออก ${adjustItem.name} ${quantity} ${adjustItem.unit}`);
      }
    } catch {
      // error handled in hook
    }

    setAdjustQuantity('');
    setAdjustNote('');
    setAdjustItem(null);
  };

  const lowStockCount = getLowStockItems().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">สต๊อกวัสดุ</h1>
          <p className="text-slate-500">จัดการคลังวัสดุและอุปกรณ์</p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              ใกล้หมด {lowStockCount} รายการ
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">วัสดุทั้งหมด</p>
                <p className="text-xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">ใกล้หมด</p>
                <p className="text-xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">ปกติ</p>
                <p className="text-xl font-bold">{items.length - lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">เคลื่อนไหวล่าสุด</p>
                <p className="text-xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="ค้นหาวัสดุ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {INVENTORY_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStockOnly ? 'default' : 'outline'}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              แสดงเฉพาะใกล้หมด
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มวัสดุ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>เพิ่มวัสดุใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ชื่อวัสดุ</Label>
                    <Input
                      placeholder="เช่น ไวนิล 1.07m"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>หมวดหมู่</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(v) => setNewItem({ ...newItem, category: v as InventoryCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          {INVENTORY_CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>หน่วย</Label>
                      <Select
                        value={newItem.unit}
                        onValueChange={(v) => setNewItem({ ...newItem, unit: v as UnitType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>จำนวนปัจจุบัน</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newItem.currentStock}
                        onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ขั้นต่ำ</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newItem.minStock}
                        onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ต้นทุนต่อหน่วย</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newItem.costPerUnit}
                      onChange={(e) => setNewItem({ ...newItem, costPerUnit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ซัพพลายเออร์ (ถ้ามี)</Label>
                    <Input
                      placeholder="ชื่อร้าน/บริษัท"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddItem} className="w-full">
                    บันทึก
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วัสดุ</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>คงเหลือ</TableHead>
                  <TableHead>ขั้นต่ำ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      ไม่พบรายการวัสดุ
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.currentStock <= item.minStock;
                    return (
                      <TableRow key={item.id} className={isLow ? 'bg-red-50' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">{item.name}</p>
                            {item.supplier && (
                              <p className="text-xs text-slate-500">{item.supplier}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {INVENTORY_CATEGORY_LABELS[item.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${isLow ? 'text-red-600' : ''}`}>
                            {formatNumber(item.currentStock)} {UNIT_LABELS[item.unit]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-500">
                            {formatNumber(item.minStock)} {UNIT_LABELS[item.unit]}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              ใกล้หมด
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 w-fit">
                              ปกติ
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAdjustItem(item)}
                              >
                                <History className="w-4 h-4 mr-1" />
                                ปรับสต๊อก
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>ปรับสต๊อก: {adjustItem?.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-600">คงเหลือปัจจุบัน:</span>
                                    <span className="font-bold text-lg">
                                      {formatNumber(adjustItem?.currentStock || 0)} {adjustItem && UNIT_LABELS[adjustItem.unit]}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>ประเภทรายการ</Label>
                                  <Select
                                    value={adjustReason}
                                    onValueChange={(v) => setAdjustReason(v as TransactionReason)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="restock">รับเข้า (สั่งซื้อ)</SelectItem>
                                      <SelectItem value="production">เบิกใช้ (ผลิต)</SelectItem>
                                      <SelectItem value="adjustment">ปรับยอด</SelectItem>
                                      <SelectItem value="waste">เสียหาย/ทิ้ง</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>จำนวน</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={adjustQuantity}
                                    onChange={(e) => setAdjustQuantity(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>หมายเหตุ</Label>
                                  <Input
                                    placeholder="เหตุผลการปรับสต๊อก..."
                                    value={adjustNote}
                                    onChange={(e) => setAdjustNote(e.target.value)}
                                  />
                                </div>

                                <Button onClick={handleAdjustStock} className="w-full">
                                  บันทึก
                                </Button>
                              </div>
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            ประวัติการเคลื่อนไหวล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'in' ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.itemName}</p>
                    <p className="text-xs text-slate-500">
                      {tx.reason === 'restock' && 'รับเข้า'}
                      {tx.reason === 'production' && 'เบิกใช้'}
                      {tx.reason === 'adjustment' && 'ปรับยอด'}
                      {tx.reason === 'waste' && 'เสียหาย'}
                      {tx.note && ` - ${tx.note}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'in' ? '+' : '-'}{formatNumber(tx.quantity)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-slate-500 py-4">ไม่มีประวัติการเคลื่อนไหว</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
