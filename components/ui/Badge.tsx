import React from 'react';
import { View, ViewProps } from 'react-native';
import { Typography } from './Typography';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "flex-row items-center rounded-full px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border",
        destructive: "bg-destructive",
        success: "bg-green-500/10 border border-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  label: string;
  textClassName?: string;
}

export function Badge({ label, variant, className, textClassName, ...props }: BadgeProps) {
  const textColors = {
    default: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-foreground",
    destructive: "text-destructive-foreground",
    success: "text-green-600",
  };

  return (
    <View className={cn(badgeVariants({ variant, className }))} {...props}>
      <Typography 
        className={cn(
          "text-[10px] font-montserrat-bold uppercase", 
          textColors[variant || 'default'],
          textClassName
        )}
      >
        {label}
      </Typography>
    </View>
  );
}
