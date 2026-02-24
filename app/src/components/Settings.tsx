import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Store,
  Bell,
  Database,
  Save,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

interface ShopSettings {
  shopName: string;
  phone: string;
  address: string;
  taxId: string;
  logoUrl: string;
}

interface NotificationSettings {
  lowStockAlert: boolean;
  orderAlert: boolean;
  dailyReport: boolean;
  dueDateAlert: boolean;
}

interface SystemSettings {
  autoDeductStock: boolean;
  defaultDueDays: number;
  currency: string;
}

export function SettingsPage() {
  const [shopSettings, setShopSettings] = useLocalStorage<ShopSettings>('vinyl-shop-settings', {
    shopName: 'ร้านป้ายไวนิล',
    phone: '053-123-4567',
    address: '123 ถนนตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000',
    taxId: '',
    logoUrl: '',
  });

  const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>(
    'vinyl-shop-notifications',
    {
      lowStockAlert: true,
      orderAlert: true,
      dailyReport: false,
      dueDateAlert: true,
    }
  );

  const [systemSettings, setSystemSettings] = useLocalStorage<SystemSettings>('vinyl-shop-system', {
    autoDeductStock: true,
    defaultDueDays: 3,
    currency: 'THB',
  });

  const handleSaveShop = () => {
    toast.success('บันทึกข้อมูลร้านสำเร็จ');
  };

  const handleSaveNotifications = () => {
    toast.success('บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ');
  };

  const handleSaveSystem = () => {
    toast.success('บันทึกการตั้งค่าระบบสำเร็จ');
  };

  const handleClearData = () => {
    toast.info('การจัดการข้อมูลผ่านฐานข้อมูลจริง - กรุณาติดต่อผู้ดูแลระบบ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ตั้งค่า</h1>
        <p className="text-slate-500">จัดการการตั้งค่าระบบและข้อมูลร้าน</p>
      </div>

      {/* Shop Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-500" />
            ข้อมูลร้าน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อร้าน</Label>
              <Input
                value={shopSettings.shopName}
                onChange={(e) =>
                  setShopSettings({ ...shopSettings, shopName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทรร้าน</Label>
              <Input
                value={shopSettings.phone}
                onChange={(e) =>
                  setShopSettings({ ...shopSettings, phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ที่อยู่</Label>
            <Input
              value={shopSettings.address}
              onChange={(e) =>
                setShopSettings({ ...shopSettings, address: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>เลขประจำตัวผู้เสียภาษี (ถ้ามี)</Label>
              <Input
                value={shopSettings.taxId}
                onChange={(e) =>
                  setShopSettings({ ...shopSettings, taxId: e.target.value })
                }
                placeholder="XXX-XXX-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>โลโก้ร้าน (URL)</Label>
              <Input
                value={shopSettings.logoUrl}
                onChange={(e) =>
                  setShopSettings({ ...shopSettings, logoUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <Button onClick={handleSaveShop} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            บันทึก
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            การแจ้งเตือน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">แจ้งเตือนสต๊อกใกล้หมด</p>
              <p className="text-sm text-slate-500">แจ้งเตือนเมื่อวัสดุเหลือน้อยกว่าขั้นต่ำ</p>
            </div>
            <Switch
              checked={notificationSettings.lowStockAlert}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, lowStockAlert: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">แจ้งเตือนออเดอร์ใหม่</p>
              <p className="text-sm text-slate-500">แสดงการแจ้งเตือนเมื่อมีออเดอร์ใหม่</p>
            </div>
            <Switch
              checked={notificationSettings.orderAlert}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, orderAlert: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">แจ้งเตือนงานใกล้กำหนดส่ง</p>
              <p className="text-sm text-slate-500">แจ้งเตือน 1 วันก่อนกำหนดส่ง</p>
            </div>
            <Switch
              checked={notificationSettings.dueDateAlert}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, dueDateAlert: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">รายงานประจำวัน</p>
              <p className="text-sm text-slate-500">ส่งสรุปยอดประจำวันทุกวัน</p>
            </div>
            <Switch
              checked={notificationSettings.dailyReport}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, dailyReport: checked })
              }
            />
          </div>
          <Button onClick={handleSaveNotifications} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            บันทึก
          </Button>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            การตั้งค่าระบบ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">ตัดสต๊อกอัตโนมัติ</p>
              <p className="text-sm text-slate-500">หักวัสดุอัตโนมัติเมื่อเริ่มผลิต</p>
            </div>
            <Switch
              checked={systemSettings.autoDeductStock}
              onCheckedChange={(checked) =>
                setSystemSettings({ ...systemSettings, autoDeductStock: checked })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>วันกำหนดส่งเริ่มต้น (วัน)</Label>
              <Input
                type="number"
                value={systemSettings.defaultDueDays}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    defaultDueDays: parseInt(e.target.value) || 3,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>สกุลเงิน</Label>
              <Select
                value={systemSettings.currency}
                onValueChange={(v) =>
                  setSystemSettings({ ...systemSettings, currency: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">ไทยบาท (THB)</SelectItem>
                  <SelectItem value="USD">ดอลลาร์สหรัฐ (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSaveSystem} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            บันทึก
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" />
            จัดการข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">ล้างข้อมูลทั้งหมด</p>
              <p className="text-sm text-slate-500">ลบออเดอร์ สต๊อก และข้อมูลทั้งหมด</p>
            </div>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 mr-2" />
              ล้างข้อมูล
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">รีเซ็ตเป็นค่าเริ่มต้น</p>
              <p className="text-sm text-slate-500">รีเซ็ตการตั้งค่าระบบเป็นค่าเริ่มต้น</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                // Reset only local settings, not database data
                localStorage.removeItem('vinyl-shop-settings');
                localStorage.removeItem('vinyl-shop-notifications');
                localStorage.removeItem('vinyl-shop-system');
                window.location.reload();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              รีเซ็ต
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-slate-50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Vinyl Shop Manager</h3>
          <p className="text-slate-500 mt-1">ระบบจัดการร้านป้ายไวนิล v1.0</p>
          <p className="text-sm text-slate-400 mt-4">
            พัฒนาโดย AI Assistant • {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
