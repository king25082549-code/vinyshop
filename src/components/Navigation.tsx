'use client';

import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Kanban,
  Package,
  Banknote,
  Users,
  Settings,
  Menu,
  X,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'order', label: 'รับออเดอร์', icon: PlusCircle },
  { id: 'orders', label: 'ใบงานทั้งหมด', icon: ClipboardList },
  { id: 'kanban', label: 'สถานะงาน', icon: Kanban },
  { id: 'inventory', label: 'สต๊อกวัสดุ', icon: Package },
  { id: 'finance', label: 'การเงิน', icon: Banknote },
  { id: 'staff', label: 'พนักงาน', icon: Users },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];

export function Navigation({ currentPage, onPageChange, isOpen, onToggle }: NavigationProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-50',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className={cn('flex items-center gap-3', !isOpen && 'justify-center w-full')}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-800 text-lg whitespace-nowrap">Vinyl Shop</h1>
              <p className="text-xs text-slate-500 whitespace-nowrap">ระบบจัดการร้าน</p>
            </div>
          )}
        </div>
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:flex hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        {!isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute -right-3 top-5 bg-white border border-slate-200 shadow-sm rounded-full w-6 h-6"
          >
            <Menu className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden absolute -right-10 top-4">
        <Button variant="outline" size="icon" onClick={onToggle}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                !isOpen && 'justify-center'
              )}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                )}
              />
              {isOpen && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="font-semibold text-slate-600 text-sm">AD</span>
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-slate-800 text-sm whitespace-nowrap">Admin</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">เจ้าของร้าน</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
