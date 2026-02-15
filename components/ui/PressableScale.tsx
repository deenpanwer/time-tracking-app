import React from 'react';
import { Animated, Pressable, PressableProps, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface PressableScaleProps extends Omit<PressableProps, 'children'> {
  scaleTo?: number;
  haptic?: Haptics.ImpactFeedbackStyle;
  children?: React.ReactNode;
}

export function PressableScale({ 
  children, 
  scaleTo = 0.96, 
  haptic,
  onPressIn,
  onPressOut,
  ...props 
}: PressableScaleProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(haptic);
    }
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
