import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function calculateArea(width: number, height: number, quantity: number = 1): number {
  return width * height * quantity;
}

export function calculatePrice(width: number, height: number, quantity: number, unitPrice: number): number {
  const area = calculateArea(width, height, quantity);
  return Math.ceil(area * unitPrice);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `JOB${year}${month}${day}-${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string): boolean {
  return getDaysUntilDue(dueDate) < 0;
}

export function getDueDateColor(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'text-red-600';
  if (daysUntilDue === 0) return 'text-amber-600';
  if (daysUntilDue <= 2) return 'text-orange-600';
  return 'text-gray-600';
}

export function getDueDateBadge(daysUntilDue: number): { label: string; color: string } {
  if (daysUntilDue < 0) return { label: `เลยกำหนด ${Math.abs(daysUntilDue)} วัน`, color: 'bg-red-100 text-red-700' };
  if (daysUntilDue === 0) return { label: 'วันนี้', color: 'bg-amber-100 text-amber-700' };
  if (daysUntilDue === 1) return { label: 'พรุ่งนี้', color: 'bg-orange-100 text-orange-700' };
  return { label: `อีก ${daysUntilDue} วัน`, color: 'bg-gray-100 text-gray-700' };
}
