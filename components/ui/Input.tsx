import React from 'react';
import { TextInput, View, TextInputProps, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { cn } from '@/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  className, 
  containerClassName,
  ...props 
}: InputProps) {
  return (
    <View className={cn("mb-4 w-full", containerClassName)}>
      {!!label ? <Typography variant="label" className="mb-2 ml-1">{label}</Typography> : null}
      <View 
        className={cn(
          "flex-row items-center bg-secondary/30 border border-transparent rounded-2xl px-4 h-14 focus:border-primary",
          error && "border-destructive",
          className
        )}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-foreground font-montserrat text-base h-full"
          placeholderTextColor="#A0A0A0"
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {!!error ? <Typography variant="small" className="text-destructive mt-1 ml-1">{error}</Typography> : null}
    </View>
  );
}
