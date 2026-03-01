'use client';

import { useState } from 'react';
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
  Users,
  Plus,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import { USER_ROLE_LABELS } from '@/lib/constants';
import type { User, UserRole } from '@/types';
import { toast } from 'sonner';

export function Staff() {
  const { staff, loading, addStaff, updateStaff, deleteStaff, toggleActive } = useStaff();
  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    phone: '',
    role: '' as UserRole | '',
    password: '',
  });
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.username || !newStaff.role) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setIsSubmitting(true);
    try {
      await addStaff({
        name: newStaff.name,
        username: newStaff.username,
        role: newStaff.role as UserRole,
        phone: newStaff.phone || undefined,
        isActive: true,
        password: newStaff.password || 'password123',
      });
      setNewStaff({ name: '', username: '', phone: '', role: '', password: '' });
    } catch (err) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    setIsSubmitting(true);
    try {
      await updateStaff(editingStaff.id, editingStaff);
      setEditingStaff(null);
    } catch (err) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleActive(id, !currentStatus);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('ต้องการลบพนักงานนี้?')) {
      try {
        await deleteStaff(id);
      } catch (err) {
        // Error already handled in hook
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">พนักงาน</h1>
          <p className="text-slate-500">จัดการทีมงานและสิทธิ์การใช้งาน</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มพนักงาน
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ชื่อ-นามสกุล</Label>
                <Input
                  placeholder="ชื่อพนักงาน"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ชื่อผู้ใช้ (Username)</Label>
                <Input
                  placeholder="username"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>เบอร์โทร</Label>
                <Input
                  placeholder="081-234-5678"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>ตำแหน่ง</Label>
                <Select
                  value={newStaff.role}
                  onValueChange={(v) => setNewStaff({ ...newStaff, role: v as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกตำแหน่ง" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>รหัสผ่าน</Label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                />
              </div>
              <Button onClick={handleAddStaff} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                บันทึก
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">พนักงานทั้งหมด</p>
                <p className="text-xl font-bold">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">กำลังทำงาน</p>
                <p className="text-xl font-bold">{staff.filter((s) => s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">รับออเดอร์</p>
                <p className="text-xl font-bold">{staff.filter((s) => s.role === 'order-staff').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">ผลิตงาน</p>
                <p className="text-xl font-bold">{staff.filter((s) => s.role === 'print-staff').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">แนะนำการแบ่งหน้าที่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-medium">คนที่ 1</span>
              </div>
              <p className="text-sm text-slate-600">รับออเดอร์ / คีย์ข้อมูล</p>
              <p className="text-xs text-slate-400 mt-1">ตำแหน่ง: รับออเดอร์</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-pink-600" />
                </div>
                <span className="font-medium">คนที่ 2</span>
              </div>
              <p className="text-sm text-slate-600">ออกแบบ / ตรวจไฟล์</p>
              <p className="text-xs text-slate-400 mt-1">ตำแหน่ง: ออกแบบ</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">คนที่ 3</span>
              </div>
              <p className="text-sm text-slate-600">พิมพ์ / ตัด / เย็บ</p>
              <p className="text-xs text-slate-400 mt-1">ตำแหน่ง: พิมพ์งาน</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">คนที่ 4</span>
              </div>
              <p className="text-sm text-slate-600">เก็บงาน / ส่งมอบ</p>
              <p className="text-xs text-slate-400 mt-1">ตำแหน่ง: ส่งงาน</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อพนักงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ชื่อผู้ใช้</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                  </TableCell>
                  <TableCell>{member.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {USER_ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.phone ? (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(member.id, member.isActive)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        member.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {member.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          ทำงาน
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          หยุด
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStaff(member)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
                          </DialogHeader>
                          {editingStaff && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>ชื่อ-นามสกุล</Label>
                                <Input
                                  value={editingStaff.name}
                                  onChange={(e) =>
                                    setEditingStaff({
                                      ...editingStaff,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>ชื่อผู้ใช้</Label>
                                <Input
                                  value={editingStaff.username}
                                  onChange={(e) =>
                                    setEditingStaff({
                                      ...editingStaff,
                                      username: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>เบอร์โทร</Label>
                                <Input
                                  value={editingStaff.phone || ''}
                                  onChange={(e) =>
                                    setEditingStaff({
                                      ...editingStaff,
                                      phone: e.target.value || undefined,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>ตำแหน่ง</Label>
                                <Select
                                  value={editingStaff.role}
                                  onValueChange={(v) =>
                                    setEditingStaff({
                                      ...editingStaff,
                                      role: v as UserRole,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(USER_ROLE_LABELS).map(
                                      ([role, label]) => (
                                        <SelectItem key={role} value={role}>
                                          {label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={handleUpdateStaff} className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                บันทึก
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
