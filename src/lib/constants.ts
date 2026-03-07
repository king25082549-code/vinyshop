import type { StatusConfig, JobTypeConfig, PaymentStatusConfig } from '@/types';

export const ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    label: 'รอดำเนินการ',
    color: '#F59E0B',
    bgColor: 'bg-amber-100',
    icon: 'Clock',
  },
  design: {
    label: 'ออกแบบ/ตรวจไฟล์',
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    icon: 'Palette',
  },
  'ready-to-print': {
    label: 'รอพิมพ์',
    color: '#F97316',
    bgColor: 'bg-orange-100',
    icon: 'Printer',
  },
  finishing: {
    label: 'ตัด/เก็บขอบ',
    color: '#10B981',
    bgColor: 'bg-emerald-100',
    icon: 'Scissors',
  },
  eyelet: {
    label: 'รอเจาะตาไก่',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100',
    icon: 'Circle',
  },
  'frame-assembly': {
    label: 'รอขึ้นโครง',
    color: '#EC4899',
    bgColor: 'bg-pink-100',
    icon: 'Frame',
  },
  'die-cut': {
    label: 'รอไดคัท',
    color: '#14B8A6',
    bgColor: 'bg-teal-100',
    icon: 'Scissors',
  },
  completed: {
    label: 'เสร็จ/รอรับ',
    color: '#22C55E',
    bgColor: 'bg-green-100',
    icon: 'Package',
  },
  delivered: {
    label: 'ส่งแล้ว',
    color: '#6B7280',
    bgColor: 'bg-gray-100',
    icon: 'Truck',
  },
};

export const JOB_TYPE_CONFIG: Record<string, JobTypeConfig> = {
  vinyl: {
    label: 'ป้ายไวนิล',
    icon: 'Image',
  },
  sticker: {
    label: 'สติ๊กเกอร์',
    icon: 'Sticker',
  },
  backdrop: {
    label: 'แบ็คดรอป',
    icon: 'Layout',
  },
  rollup: {
    label: 'โรลอัพ',
    icon: 'MoveVertical',
  },
  other: {
    label: 'อื่นๆ',
    icon: 'MoreHorizontal',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<string, PaymentStatusConfig> = {
  pending: {
    label: 'รอชำระ',
    color: '#EF4444',
    bgColor: 'bg-red-100',
  },
  partial: {
    label: 'ชำระบางส่วน',
    color: '#F59E0B',
    bgColor: 'bg-amber-100',
  },
  paid: {
    label: 'ชำระครบ',
    color: '#22C55E',
    bgColor: 'bg-green-100',
  },
};

export const INVENTORY_CATEGORY_LABELS: Record<string, string> = {
  vinyl: 'ไวนิล',
  ink: 'หมึกพิมพ์',
  sticker: 'สติ๊กเกอร์',
  board: 'แผ่นวัสดุ',
  frame: 'โครง/ขาตั้ง',
  accessories: 'อุปกรณ์เสริม',
};

export const UNIT_LABELS: Record<string, string> = {
  meter: 'เมตร',
  roll: 'ม้วน',
  sheet: 'แผ่น',
  piece: 'ชิ้น',
  liter: 'ลิตร',
};

export const KANBAN_COLUMNS = [
  { id: 'ready-to-print', status: 'ready-to-print' },
  { id: 'finishing', status: 'finishing' },
  { id: 'eyelet', status: 'eyelet' },
  { id: 'frame-assembly', status: 'frame-assembly' },
  { id: 'die-cut', status: 'die-cut' },
  { id: 'completed', status: 'completed' },
] as const;

export const JOB_TYPE_OPTIONS = [
  { value: 'vinyl', label: 'ป้ายไวนิล' },
  { value: 'sticker', label: 'สติ๊กเกอร์' },
  { value: 'backdrop', label: 'แบ็คดรอป' },
  { value: 'rollup', label: 'โรลอัพ' },
  { value: 'other', label: 'อื่นๆ' },
];

export const INVENTORY_CATEGORY_OPTIONS = [
  { value: 'vinyl', label: 'ไวนิล' },
  { value: 'ink', label: 'หมึกพิมพ์' },
  { value: 'sticker', label: 'สติ๊กเกอร์' },
  { value: 'board', label: 'แผ่นวัสดุ' },
  { value: 'frame', label: 'โครง/ขาตั้ง' },
  { value: 'accessories', label: 'อุปกรณ์เสริม' },
];

export const UNIT_OPTIONS = [
  { value: 'meter', label: 'เมตร' },
  { value: 'roll', label: 'ม้วน' },
  { value: 'sheet', label: 'แผ่น' },
  { value: 'piece', label: 'ชิ้น' },
  { value: 'liter', label: 'ลิตร' },
];

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: 'เจ้าของร้าน',
  'order-staff': 'พนักงานรับออเดอร์',
  'design-staff': 'พนักงานออกแบบ',
  'print-staff': 'พนักงานพิมพ์',
  'delivery-staff': 'พนักงานส่ง',
};
