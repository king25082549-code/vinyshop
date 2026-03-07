'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, Check } from 'lucide-react';

interface AddableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { id: string; name: string }[];
  onAddNew: (name: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function AddableSelect({
  value,
  onValueChange,
  options,
  onAddNew,
  placeholder = 'เลือก...',
  className,
}: AddableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setNewValue('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddNew = async () => {
    if (!newValue.trim()) return;
    await onAddNew(newValue.trim());
    onValueChange(newValue.trim());
    setNewValue('');
    setIsAdding(false);
    setIsOpen(false);
  };

  const selectedLabel = value || placeholder;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedLabel}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onValueChange(option.name);
                  setIsOpen(false);
                }}
                className={cn(
                  'relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer',
                  value === option.name && 'bg-accent'
                )}
              >
                {value === option.name && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                <span className={value === option.name ? '' : 'ml-6'}>{option.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t p-2">
            {isAdding ? (
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="พิมพ์ชื่อใหม่..."
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNew();
                    }
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewValue('');
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleAddNew}
                  disabled={!newValue.trim()}
                >
                  เพิ่ม
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มรายการใหม่
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
