import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <Pressable 
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        "w-6 h-6 rounded-md border-2 items-center justify-center transition-colors",
        checked ? "bg-primary border-primary" : "border-muted-foreground/30",
        className
      )}
    >
      {checked && <Check size={16} color="white" strokeWidth={3} />}
    </Pressable>
  );
}
