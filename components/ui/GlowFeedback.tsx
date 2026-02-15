import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';

interface GlowFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

/**
 * ChatGPT-style Feedback Component
 * - Subtle grain/noise distortion on press
 * - Moving gradient glow
 * - Professional haptic-like visual feel
 */
export function GlowFeedback({ children, onPress, className }: GlowFeedbackProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const intensity = useSharedValue(0);
  const grainPos = useSharedValue(0);

  const startFeedback = () => {
    intensity.value = withTiming(1, { duration: 200 });
    // Simulate "Old TV" stuttering grain
    grainPos.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 50 })
      ),
      -1,
      true
    );
  };

  const stopFeedback = () => {
    intensity.value = withTiming(0, { duration: 300 });
    grainPos.value = withTiming(0);
  };

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(intensity.value, [0, 1], [0, 0.6], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(intensity.value, [0, 1], [0.8, 1.1]) }],
  }));

  const grainStyle = useAnimatedStyle(() => ({
    opacity: interpolate(intensity.value, [0, 1], [0, 0.05], Extrapolate.CLAMP),
    transform: [
      { translateX: interpolate(grainPos.value, [0, 1], [-2, 2]) },
      { translateY: interpolate(grainPos.value, [0, 1], [2, -2]) }
    ],
  }));

  return (
    <Pressable
      onPressIn={startFeedback}
      onPressOut={stopFeedback}
      onPress={onPress}
      className={className}
    >
      <View className="relative overflow-hidden rounded-2xl">
        {/* The Glow */}
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
          <LinearGradient
            colors={isDark ? ['#ffffff20', '#ffffff00'] : ['#00000010', '#00000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* The "TV Stutter" Grain Layer */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            grainStyle, 
            { backgroundColor: isDark ? 'white' : 'black' }
          ]} 
          pointerEvents="none" 
        />

        {children}
      </View>
    </Pressable>
  );
}
