import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export function HStack({ children, className, ...props }: ViewProps) {
  return (
    <View className={cn("flex-row items-center", className)} {...props}>
      {children}
    </View>
  );
}

export function VStack({ children, className, ...props }: ViewProps) {
  return (
    <View className={cn("flex-col", className)} {...props}>
      {children}
    </View>
  );
}
