'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';
import { AddableSelect } from '@/components/ui/addable-select';
import { formatCurrency } from '@/lib/utils';
import type { PaymentStatus, DynamicOption } from '@/types';
import {
  User,
  Phone,
  MessageCircle,
  Ruler,
  Hash,
  Banknote,
  Calendar,
  FileUp,
  Calculator,
  CheckCircle,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderFormProps {
  onSuccess?: () => void;
}

interface OrderItemForm {
  jobType: string;
  width: string;
  height: string;
  quantity: string;
  unitPrice: string;
}

const emptyItem: OrderItemForm = {
  jobType: '',
  width: '',
  height: '',
  quantity: '1',
  unitPrice: '',
};

function calculateItemPrice(item: OrderItemForm): number {
  const q = parseInt(item.quantity) || 0;
  const u = parseFloat(item.unitPrice) || 0;
  return q * u;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const { addOrder } = useOrders();
  const { deductVinylForOrder } = useInventory();

  // Dynamic job types from DB
  const [dbJobTypes, setDbJobTypes] = useState<DynamicOption[]>([]);

  useEffect(() => {
    fetch('/api/job-types').then(r => r.json()).then(setDbJobTypes).catch(() => {});
  }, []);

  const handleAddJobType = async (name: string) => {
    const res = await fetch('/api/job-types', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const jt = await res.json();
      setDbJobTypes(prev => [...prev, jt]);
    }
  };

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    lineId: '',
    deposit: '',
    dueDate: '',
    notes: '',
  });

  const [items, setItems] = useState<OrderItemForm[]>([{ ...emptyItem }]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals across all items
  const itemPrices = items.map(calculateItemPrice);
  const totalPrice = itemPrices.reduce((sum, p) => sum + p, 0);
  const deposit = parseFloat(formData.deposit) || 0;
  const remaining = totalPrice - deposit;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItemForm, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems(prev => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.phone) {
      toast.error('กรุณากรอกข้อมูลลูกค้า');
      return;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.jobType) {
        toast.error(`กรุณาเลือกประเภทงานชิ้นที่ ${i + 1}`);
        return;
      }
      const w = parseFloat(item.width) || 0;
      const h = parseFloat(item.height) || 0;
      const q = parseInt(item.quantity) || 0;
      const u = parseFloat(item.unitPrice) || 0;
      if (w <= 0 || h <= 0 || q <= 0 || u <= 0) {
        toast.error(`กรุณากรอกขนาดและราคาชิ้นที่ ${i + 1} ให้ถูกต้อง`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Use first item as the main order data for backward compatibility
      const firstItem = items[0];
      const w = parseFloat(firstItem.width) || 0;
      const h = parseFloat(firstItem.height) || 0;
      const q = parseInt(firstItem.quantity) || 0;
      const u = parseFloat(firstItem.unitPrice) || 0;

      // Determine payment status
      let paymentStatus: PaymentStatus = 'pending';
      if (deposit >= totalPrice) {
        paymentStatus = 'paid';
      } else if (deposit > 0) {
        paymentStatus = 'partial';
      }

      const orderData = {
        customerName: formData.customerName,
        phone: formData.phone,
        lineId: formData.lineId || undefined,
        jobType: firstItem.jobType,
        width: w,
        height: h,
        quantity: q,
        unitPrice: u,
        totalPrice,
        deposit,
        remaining,
        paymentStatus,
        status: 'pending' as const,
        fileName: file?.name || undefined,
        orderDate: new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: formData.notes || undefined,
        createdBy: 'admin',
      };

      const newOrder = await addOrder(orderData);

      // Save additional items to order_items table
      for (const item of items) {
        const iw = parseFloat(item.width) || 0;
        const ih = parseFloat(item.height) || 0;
        const iq = parseInt(item.quantity) || 0;
        const iu = parseFloat(item.unitPrice) || 0;
        const ip = calculateItemPrice(item);

        await fetch('/api/order-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: newOrder.id,
            jobType: item.jobType,
            width: iw,
            height: ih,
            quantity: iq,
            unitPrice: iu,
            totalPrice: ip,
          }),
        });
      }

      // Auto deduct vinyl stock for vinyl items
      for (const item of items) {
        if (item.jobType === 'ป้ายไวนิล') {
          const iw = (parseFloat(item.width) || 0) / 100; // cm to m
          const ih = (parseFloat(item.height) || 0) / 100;
          const iq = parseInt(item.quantity) || 0;
          await deductVinylForOrder(iw, ih, iq, newOrder.id);
        }
      }

      toast.success('สร้างออเดอร์สำเร็จ!', {
        description: `ใบงาน ${newOrder.id.slice(0, 8)} ถูกสร้างเรียบร้อย (${items.length} ชิ้นงาน)`,
      });

      // Reset form
      setFormData({
        customerName: '',
        phone: '',
        lineId: '',
        deposit: '',
        dueDate: '',
        notes: '',
      });
      setItems([{ ...emptyItem }]);
      setFile(null);

      onSuccess?.();
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">รับออเดอร์ใหม่</h1>
        <p className="text-slate-500">กรอกข้อมูลเพื่อสร้างใบงาน</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              ข้อมูลลูกค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  ชื่อลูกค้า <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="ชื่อลูกค้าหรือชื่อร้าน"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  เบอร์โทร <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="081-234-5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineId">LINE ID (ถ้ามี)</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="lineId"
                  placeholder="@line_id"
                  value={formData.lineId}
                  onChange={(e) => handleInputChange('lineId', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              รายละเอียดงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {items.map((item, index) => {
              const itemPrice = calculateItemPrice(item);
              const w = parseFloat(item.width) || 0;
              const h = parseFloat(item.height) || 0;
              const q = parseInt(item.quantity) || 0;
              const u = parseFloat(item.unitPrice) || 0;

              return (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">ชิ้นงานที่ {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        ลบ
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      ประเภทงาน <span className="text-red-500">*</span>
                    </Label>
                    <AddableSelect
                      value={item.jobType}
                      onValueChange={(v) => handleItemChange(index, 'jobType', v)}
                      options={dbJobTypes}
                      onAddNew={handleAddJobType}
                      placeholder="เลือกประเภทงาน"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>ความกว้าง (cm)</Label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          step="1"
                          placeholder="100"
                          value={item.width}
                          onChange={(e) => handleItemChange(index, 'width', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>ความสูง (cm)</Label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          step="1"
                          placeholder="200"
                          value={item.height}
                          onChange={(e) => handleItemChange(index, 'height', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>จำนวน</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>ราคาต่อชิ้น</Label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="150"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Item Price Calculation */}
                  {q > 0 && u > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Calculator className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {q} ชิ้น × {formatCurrency(u)} = ราคา {formatCurrency(itemPrice)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Item Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full border-dashed border-2 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              เพิ่มชิ้นงาน
            </Button>

            <div className="space-y-2">
              <Label htmlFor="file">ไฟล์งาน (PDF, JPG, PNG)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="file"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  {file ? file.name : 'คลิกเพื่ออัปโหลดไฟล์'}
                </Label>
                {file && (
                  <p className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    อัปโหลดสำเร็จ
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="w-5 h-5 text-blue-500" />
              การเงินและการส่งมอบ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit">มัดจำ</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="0"
                    value={formData.deposit}
                    onChange={(e) => handleInputChange('deposit', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">กำหนดส่ง</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {totalPrice > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg">
                {items.length > 1 && (
                  <div className="space-y-1 mb-2 pb-2 border-b border-slate-200">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-slate-600">
                        <span>ชิ้นที่ {i + 1}: {item.jobType || '-'}</span>
                        <span>{formatCurrency(itemPrices[i])}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">ราคารวม ({items.length} ชิ้นงาน):</span>
                  <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">มัดจำ:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(deposit)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-800 font-medium">คงเหลือ:</span>
                  <span className={`font-bold ${remaining <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                placeholder="รายละเอียดเพิ่มเติม..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 h-12 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึก...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                สร้างใบงาน ({items.length} ชิ้นงาน)
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
