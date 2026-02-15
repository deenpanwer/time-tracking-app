import React from 'react';
import { Pressable, PressableProps, ActivityIndicator, View } from 'react-native';
import { Typography } from './Typography';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-2xl px-6 py-4 active:opacity-80 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        default: "h-14",
        sm: "h-10 px-4",
        lg: "h-16 px-8",
        icon: "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends Omit<PressableProps, 'children'>, VariantProps<typeof buttonVariants> {
  title?: string;
  loading?: boolean;
  textClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({ 
  className, 
  variant, 
  size, 
  title, 
  loading, 
  textClassName,
  leftIcon,
  rightIcon,
  children,
  ...props 
}: ButtonProps) {
  const textColors = {
    default: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    destructive: "text-destructive-foreground",
  };

  return (
    <Pressable 
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#000' : '#fff'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {title ? (
            <Typography 
              className={cn(
                "font-montserrat-bold text-center",
                textColors[variant || 'default'],
                textClassName
              )}
            >
              {title}
            </Typography>
          ) : children}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}
