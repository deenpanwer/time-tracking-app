import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ProgressProps extends ViewProps {
  value: number; // 0 to 100
  color?: string;
}

export function Progress({ value, color = "#000", className, ...props }: ProgressProps) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(width, {
      toValue: value,
      useNativeDriver: false, // width doesn't support native driver
    }).start();
  }, [value]);

  return (
    <View 
      className={cn("h-2 w-full bg-secondary rounded-full overflow-hidden", className)} 
      {...props}
    >
      <Animated.View 
        className="h-full rounded-full"
        style={{ 
          width: width.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%']
          }),
          backgroundColor: color
        }}
      />
    </View>
  );
}
