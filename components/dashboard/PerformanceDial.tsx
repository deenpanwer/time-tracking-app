import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withSpring, 
  useDerivedValue 
} from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { useColorScheme } from 'nativewind';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PerformanceDialProps {
  value: number; // 0 to 100
  size?: number;
}

export function PerformanceDial({ value = 0, size = 120 }: PerformanceDialProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 3/4 circle
  const rotation = 135; // Start from bottom left
  
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = withSpring(value / 100, { damping: 15, stiffness: 60 });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = arcLength * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const getStatusColor = () => {
    if (value >= 90) return '#10b981'; // emerald-500
    if (value >= 70) return '#3b82f6'; // blue-500
    return '#f97316'; // orange-500
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: `${rotation}deg` }] }}>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#27272a' : '#e4e4e7'}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="none"
        />
        {/* Progress Arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStatusColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
      
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', top: size * 0.15 }}>
        <Typography variant="h2" className="text-2xl font-black tracking-tighter">
          {Math.round(value)}%
        </Typography>
        <Typography variant="small" className="text-[8px] font-black uppercase tracking-widest text-muted-foreground -mt-1">
          Velocity
        </Typography>
      </View>
    </View>
  );
}
