import React, { useEffect } from 'react';
import { View, Platform, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  withSpring,
  withSequence,
  runOnJS,
  useAnimatedStyle,
  Easing
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function SplashPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const strokeOffset = useSharedValue(200);
  const fillOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const shadowOpacity = useSharedValue(0);

  const strokeAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
    strokeDasharray: "200",
  }));

  const fillAnimatedProps = useAnimatedProps(() => ({
    fillOpacity: fillOpacity.value,
  }));

  const shadowStyle = Platform.select({
    web: {
      filter: `drop-shadow(0 10px 20px rgba(0,0,0,${shadowOpacity.value}))`,
    },
    default: {
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
    }
  });

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    ...(shadowStyle as any),
    shadowOpacity: shadowOpacity.value,
  }));

  useEffect(() => {
    // 1. Start Drawing - Smooth single stroke
    strokeOffset.value = withTiming(0, { 
      duration: 1500, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });

    // 2. Initial Scale
    scale.value = withSpring(1, { damping: 12, stiffness: 40 });

    // 3. The "Solidify" Event
    const fillTimer = setTimeout(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      fillOpacity.value = withTiming(1, { 
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });

      shadowOpacity.value = withTiming(0.08, { duration: 1000 });
      scale.value = withSequence(
        withSpring(1.02, { damping: 10, stiffness: 100 }),
        withSpring(1.0, { damping: 12, stiffness: 80 })
      );
    }, 1200); // Wait for drawing to be mostly complete

    // 4. Exit to Login
    const exitTimer = setTimeout(() => {
      runOnJS(() => router.replace('/login'))();
    }, 2800);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <View 
      style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={logoStyle}>
        <Svg width={160} height={160} viewBox="0 0 100 100">
          <AnimatedPath
            d="M25 25 H75 V38 H58 V75 H42 V38 H25 Z" 
            stroke={theme.text}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="square"
            animatedProps={strokeAnimatedProps}
          />
          <AnimatedPath
            d="M25 25 H75 V38 H58 V75 H42 V38 H25 Z" 
            fill={theme.text}
            animatedProps={fillAnimatedProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
