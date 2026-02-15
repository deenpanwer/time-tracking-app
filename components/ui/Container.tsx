import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

interface ContainerProps extends ViewProps {
  safe?: boolean;
  padding?: boolean;
}

export function Container({ 
  children, 
  className, 
  safe = false, 
  padding = false,
  ...props 
}: ContainerProps) {
  const Component = (safe ? SafeAreaView : View) as any;
  
  return (
    <Component 
      className={cn(
        "flex-1 bg-background",
        padding && "px-6",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
