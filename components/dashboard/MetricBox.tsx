import React from 'react';
import { View } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { LucideIcon } from 'lucide-react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  LinearTransition,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface MetricBoxProps {
  icon: LucideIcon;
  label: string;
  value?: string | number;
  subValue?: string;
  isLoading?: boolean;
}

export function MetricBox({ icon: Icon, label, value, subValue, isLoading }: MetricBoxProps) {
  const shimmerX = useSharedValue(-100);

  React.useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(100, { 
        duration: 2000, 
        easing: Easing.linear 
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${shimmerX.value}%` }],
  }));

  if (isLoading) {
    return (
      <View className="flex-col p-4 rounded-[2rem] bg-secondary/30 border border-border/40 h-32 justify-between">
        <View className="flex-row items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-16 h-3 rounded-full" />
        </View>
        <View className="space-y-2">
          <Skeleton className="w-20 h-6 rounded-lg" />
          <Skeleton className="w-24 h-3 rounded-full" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-col p-4 rounded-[2rem] bg-secondary/20 dark:bg-white/5 border border-border/40 overflow-hidden h-32 relative">
      {/* Shimmer Effect */}
      <Animated.View style={[shimmerStyle, { position: 'absolute', top: 0, bottom: 0, width: '100%', opacity: 0.1 }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, transform: [{ skewX: '-20deg' }] }}
        />
      </Animated.View>

      <View className="flex-row items-center space-x-2 mb-2 relative z-10">
        <View className="p-1.5 rounded-lg bg-primary/10 items-center justify-center">
          <Icon size={14} className="text-primary" />
        </View>
        <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate">
          {label}
        </Typography>
      </View>

      <View className="mt-auto relative z-10">
        <Typography variant="h3" className="text-xl font-black tracking-tighter truncate" numberOfLines={1}>
          {value}
        </Typography>
        {subValue && (
          <Typography variant="small" className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1" numberOfLines={1}>
            {subValue}
          </Typography>
        )}
      </View>
    </View>
  );
}
