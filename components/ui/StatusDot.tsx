import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface StatusDotProps extends ViewProps {
  status?: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md';
}

export function StatusDot({ status = 'online', size = 'sm', className, ...props }: StatusDotProps) {
  const colors = {
    online: "bg-green-500",
    offline: "bg-muted-foreground/40",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  };

  const sizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
  };

  return (
    <View 
      className={cn(
        "rounded-full border-2 border-background",
        colors[status],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
