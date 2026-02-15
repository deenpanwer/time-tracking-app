import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'label' | 'muted';
}

export function Typography({ 
  children, 
  className, 
  variant = 'body',
  ...props 
}: TypographyProps) {
  const variants = {
    h1: "text-3xl font-poppins text-foreground",
    h2: "text-2xl font-poppins text-foreground",
    h3: "text-xl font-poppins text-foreground",
    h4: "text-lg font-poppins text-foreground",
    body: "text-base font-montserrat text-foreground",
    small: "text-sm font-montserrat text-foreground",
    label: "text-xs font-montserrat-bold uppercase tracking-wider text-muted-foreground",
    muted: "text-sm font-montserrat text-muted-foreground",
  };

  return (
    <Text 
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </Text>
  );
}
