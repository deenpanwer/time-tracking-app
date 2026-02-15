import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

interface IconButtonProps extends PressableProps {
  icon: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function IconButton({ icon, variant = 'default', className, ...props }: IconButtonProps) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border",
    ghost: "bg-transparent",
  };

  return (
    <Pressable 
      className={cn(
        "w-12 h-12 rounded-full items-center justify-center active:opacity-70",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
}
