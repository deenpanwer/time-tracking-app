import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { cn } from '@/lib/utils';

export function Spinner({ className, ...props }: ActivityIndicatorProps) {
  return (
    <ActivityIndicator 
      className={cn(className)}
      color="#000"
      {...props}
    />
  );
}
