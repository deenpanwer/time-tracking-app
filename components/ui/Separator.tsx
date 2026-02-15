import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export function Separator({ className, orientation = 'horizontal', ...props }: ViewProps & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <View 
      className={cn(
        "bg-border",
        orientation === 'horizontal' ? "h-[1px] w-full" : "w-[1px] h-full",
        className
      )}
      {...props}
    />
  );
}
