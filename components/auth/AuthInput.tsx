import React, { useState } from 'react';
import { TextInput, View, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';

interface AuthInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isValid?: boolean; // Triggers the green tick
  isPassword?: boolean; // Enables password toggle
  containerClassName?: string;
}

export function AuthInput({
  label,
  error,
  leftIcon,
  isValid,
  isPassword,
  className,
  containerClassName,
  secureTextEntry,
  onFocus,
  onBlur,
  value,
  ...props
}: AuthInputProps) {
  const [isSecure, setIsSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleSecure = () => setIsSecure(!isSecure);

  const showTick = !!(isValid && value && String(value).length > 0);

  return (
    <View className={cn("mb-4 w-full", containerClassName)}>
      <View
        className={cn(
          "flex-row items-center bg-secondary/20 border border-border rounded-2xl px-4 h-16",
          isFocused && "border-primary bg-background",
          error && "border-destructive",
          showTick && !isFocused && "border-green-500/50",
          className
        )}
      >
        {leftIcon && <View className="mr-3 opacity-60">{leftIcon}</View>}
        <TextInput
          className={cn(
            "flex-1 text-foreground font-montserrat text-base h-full",
            Platform.OS === 'web' && "outline-none"
          )}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword ? isSecure : secureTextEntry}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props}
        />
        
        {/* Valid Tick */}
        {showTick && !isPassword ? (
          <View className="ml-3">
             <CheckCircle2 size={20} color="#4ADE80" />
          </View>
        ) : null}

        {/* Password Toggle */}
        {isPassword ? (
          <TouchableOpacity onPress={toggleSecure} className="ml-3 active:opacity-70">
            {isSecure ? (
              <EyeOff size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            ) : (
              <Eye size={20} color={isDark ? "#A855F7" : "#8B5CF6"} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {!!error ? <Typography variant="small" className="text-destructive mt-1 ml-1">{error}</Typography> : null}
    </View>
  );
}
