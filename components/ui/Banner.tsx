import React from 'react';
import { View, ViewProps } from 'react-native';
import { Typography } from './Typography';
import { cn } from '@/lib/utils';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react-native';

interface BannerProps extends ViewProps {
  variant?: 'info' | 'error' | 'success';
  title?: string;
  description: string;
}

export function Banner({ variant = 'info', title, description, className, ...props }: BannerProps) {
  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: <Info size={20} color="#3b82f6" />,
      text: "text-blue-900"
    },
    error: {
      container: "bg-destructive/10 border-destructive/20",
      icon: <AlertCircle size={20} color="#ef4444" />,
      text: "text-destructive"
    },
    success: {
      container: "bg-green-50 border-green-200",
      icon: <CheckCircle2 size={20} color="#22c55e" />,
      text: "text-green-900"
    }
  };

  return (
    <View 
      className={cn(
        "flex-row p-4 rounded-2xl border items-start",
        variants[variant].container,
        className
      )}
      {...props}
    >
      <View className="mt-0.5 mr-3">
        {variants[variant].icon}
      </View>
      <View className="flex-1">
        {title && (
          <Typography className={cn("font-montserrat-bold mb-0.5", variants[variant].text)}>
            {title}
          </Typography>
        )}
        <Typography className={cn("text-sm opacity-90", variants[variant].text)}>
          {description}
        </Typography>
      </View>
    </View>
  );
}
