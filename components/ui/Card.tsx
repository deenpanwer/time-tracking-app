import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  variant?: 'default' | 'outline' | 'glass';
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  ...props 
}: CardProps) {
  const variants = {
    default: "bg-card shadow-sm shadow-black/5",
    outline: "border border-border bg-transparent",
    glass: "bg-white/10 border border-white/20 backdrop-blur-md",
  };

  return (
    <View 
      className={cn(
        "rounded-3xl p-5",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
