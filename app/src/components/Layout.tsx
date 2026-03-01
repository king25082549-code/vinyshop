'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Navigation } from './Navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="scroll-container bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Navigation
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out main-content',
          isSidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
