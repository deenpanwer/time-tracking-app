import React from 'react';
import { TextInput, View, TextInputProps } from 'react-native';
import { Typography } from './Typography';
import { cn } from '@/lib/utils';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function TextArea({ 
  label, 
  error, 
  className, 
  containerClassName,
  ...props 
}: TextAreaProps) {
  return (
    <View className={cn("mb-4 w-full", containerClassName)}>
      {label && <Typography variant="label" className="mb-2 ml-1">{label}</Typography>}
      <View 
        className={cn(
          "bg-secondary/30 border border-transparent rounded-2xl px-4 py-3 min-h-[120px]",
          error && "border-destructive",
          className
        )}
      >
        <TextInput
          className="flex-1 text-foreground font-montserrat text-base text-top"
          placeholderTextColor="#A0A0A0"
          multiline
          textAlignVertical="top"
          {...props}
        />
      </View>
      {error && <Typography variant="small" className="text-destructive mt-1 ml-1">{error}</Typography>}
    </View>
  );
}
