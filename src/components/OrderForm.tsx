'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';
import { JOB_TYPE_OPTIONS } from '@/lib/constants';
import { formatCurrency, calculatePrice } from '@/lib/utils';
import type { Order, JobType, PaymentStatus } from '@/types';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderFormProps {
  onSuccess?: () => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const { addOrder } = useOrders();
  const { deductVinylForOrder } = useInventory();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    lineId: '',
    jobType: '' as JobType | '',
    width: '',
    height: '',
    quantity: '1',
    unitPrice: '',
    deposit: '',
    dueDate: '',
    notes: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const width = parseFloat(formData.width) || 0;
  const height = parseFloat(formData.height) || 0;
  const quantity = parseInt(formData.quantity) || 0;
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const deposit = parseFloat(formData.deposit) || 0;

  const totalPrice = calculatePrice(width, height, quantity, unitPrice);
  const remaining = totalPrice - deposit;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.phone || !formData.jobType) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    if (width <= 0 || height <= 0 || quantity <= 0 || unitPrice <= 0) {
      toast.error('กรุณากรอกขนาดและราคาให้ถูกต้อง');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine payment status
      let paymentStatus: PaymentStatus = 'pending';
      if (deposit >= totalPrice) {
        paymentStatus = 'paid';
      } else if (deposit > 0) {
        paymentStatus = 'partial';
      }

      // Create order
      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        customerName: formData.customerName,
        phone: formData.phone,
        lineId: formData.lineId || undefined,
        jobType: formData.jobType as JobType,
        width,
        height,
        quantity,
        unitPrice,
        totalPrice,
        deposit,
        remaining,
        paymentStatus,
        status: 'pending',
        fileName: file?.name || undefined,
        orderDate: new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: formData.notes || undefined,
        createdBy: 'admin',
      };

      const newOrder = await addOrder(orderData);

      // Auto deduct vinyl stock
      if (formData.jobType === 'vinyl') {
        await deductVinylForOrder(width, height, quantity, newOrder.id);
      }

      toast.success('สร้างออเดอร์สำเร็จ!', {
        description: `ใบงาน ${newOrder.id.slice(0, 8)} ถูกสร้างเรียบร้อย`,
      });

      // Reset form
      setFormData({
        customerName: '',
        phone: '',
        lineId: '',
        jobType: '',
        width: '',
        height: '',
        quantity: '1',
        unitPrice: '',
        deposit: '',
        dueDate: '',
        notes: '',
      });
      setFile(null);

      onSuccess?.();
    } catch (error) {
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

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              รายละเอียดงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">
                ประเภทงาน <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) => handleInputChange('jobType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทงาน" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">ความกว้าง (เมตร)</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    placeholder="3.00"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">ความสูง (เมตร)</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    placeholder="2.00"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">จำนวน</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">ราคาต่อ ตร.ม.</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="150"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Area & Price Calculation */}
            {width > 0 && height > 0 && unitPrice > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calculator className="w-5 h-5" />
                  <span className="font-medium">คำนวณราคา</span>
                </div>
                <div className="text-sm text-slate-600">
                  พื้นที่: {(width * height * quantity).toFixed(2)} ตร.ม. ({width} × {height} × {quantity})
                </div>
                <div className="text-lg font-bold text-blue-700">
                  ราคารวม: {formatCurrency(totalPrice)}
                </div>
              </div>
            )}

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
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">ราคารวม:</span>
                  <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">มัดจำ:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(deposit)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-800 font-medium">คงเหลือ:</span>
                  <span className={`font-bold ${remaining === 0 ? 'text-green-600' : 'text-amber-600'}`}>
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
                สร้างใบงาน
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
