import React from 'react';
import { Image, View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';
import { Typography } from './Typography';

interface AvatarProps extends ViewProps {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, fallback, size = 'md', className, ...props }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <View 
      className={cn(
        "rounded-full bg-secondary items-center justify-center overflow-hidden",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image source={{ uri: src }} className="w-full h-full" />
      ) : (
        <Typography className="font-montserrat-bold text-secondary-foreground">
          {fallback.substring(0, 2).toUpperCase()}
        </Typography>
      )}
    </View>
  );
}
