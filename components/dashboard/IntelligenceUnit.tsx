import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react-native';
import { PerformanceDial } from './PerformanceDial';
import { Typography } from '@/components/ui/Typography';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { FadeInUp, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

interface IntelligenceUnitProps {
  velocity?: number;
  topApp?: string;
  activeCount?: number;
  totalHoursToday?: string | number;
  isLoading?: boolean;
}

export function IntelligenceUnit({ 
  velocity = 100, 
  topApp = "Primary Tools", 
  activeCount = 0,
  totalHoursToday = "0.0",
  isLoading
}: IntelligenceUnitProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  
  const today = format(new Date(), "MMMM dd, yyyy");
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const briefText = useMemo(() => {
    const intensityObservation = velocity >= 90 
        ? `The organization is currently exhibiting elite-level performance, operating at ${velocity}% velocity.` 
        : velocity >= 70 
            ? `The organization maintains strong operational momentum at ${velocity}% velocity.` 
            : `The organization is operating at a stable ${velocity}% velocity baseline.`;

    const workforceObservation = activeCount > 0 
        ? `With ${activeCount} personnel currently active, we've recorded ${totalHoursToday} hours of verified production today.`
        : `All personnel are currently standby, with a total of ${totalHoursToday} hours recorded for the current cycle.`;

    const toolObservation = `Workflows are heavily concentrated in ${topApp}, showing consistent engagement patterns.`;
    
    const outlook = velocity >= 80 
        ? "Primary milestones remain ahead of schedule on a superior delivery trajectory."
        : "Operational health remains nominal with all primary milestones on a healthy trajectory.";

    return `${intensityObservation} ${workforceObservation} ${toolObservation} ${outlook}`;
  }, [velocity, topApp, activeCount, totalHoursToday]);

  useEffect(() => {
    if (isLoading) return;
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    setDisplayedText('');
    setIsTypingComplete(false);

    let currentIndex = 0;
    const type = () => {
      if (currentIndex < briefText.length) {
        setDisplayedText(briefText.substring(0, currentIndex + 1));
        currentIndex++;
        typingTimerRef.current = setTimeout(type, 8); // Slightly faster for mobile
      } else {
        setIsTypingComplete(true);
      }
    };

    type();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [briefText, isLoading]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 })), -1, true)
  }));

  if (isLoading) {
    return (
      <View className="bg-secondary/20 dark:bg-white/5 rounded-[2.5rem] p-6 mb-8 border border-border/40">
        <View className="flex-row items-center space-x-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <View className="space-y-2">
            <Skeleton className="w-40 h-3 rounded-full" />
            <Skeleton className="w-24 h-3 rounded-full" />
          </View>
        </View>
        <View className="space-y-2">
          <Skeleton className="w-full h-4 rounded-full" />
          <Skeleton className="w-full h-4 rounded-full" />
          <Skeleton className="w-3/4 h-4 rounded-full" />
        </View>
      </View>
    );
  }

  const status = velocity >= 90 ? 'Peak Flow' : velocity >= 70 ? 'Optimal' : 'Standard';
  const statusColor = velocity >= 90 ? 'text-emerald-500' : velocity >= 70 ? 'text-primary' : 'text-orange-500';

  return (
    <Animated.View 
      entering={FadeInUp.duration(600).delay(200)}
      className="bg-secondary/10 dark:bg-[#161619] rounded-[2.5rem] p-6 md:p-8 mb-8 border border-border/30 relative overflow-hidden shadow-sm"
    >
      {/* Decorative background element */}
      <View className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px]" style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }} />
      
      <View className="flex-col lg:flex-row items-center justify-between">
        <View className="flex-1 w-full lg:w-auto">
          <View className="flex-row items-center space-x-4 mb-6">
            <View className="w-12 h-12 bg-card rounded-2xl items-center justify-center shadow-sm border border-border/40">
              <Sparkles size={24} className="text-primary" />
            </View>
            <View>
              <View className="flex-row flex-wrap items-center">
                <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-primary mr-2">
                  Organization Performance Brief
                </Typography>
                <Typography variant="small" className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {today}
                </Typography>
              </View>
              <Typography variant="small" className={`text-[9px] font-black uppercase tracking-widest ${statusColor} mt-0.5`}>
                Status: {status}
              </Typography>
            </View>
          </View>

          <View className="min-h-[100px]">
            <Typography className="text-muted-foreground text-sm font-medium leading-relaxed italic">
              "{displayedText}"
              {!isTypingComplete && (
                <Animated.View style={[cursorStyle, { width: 4, height: 16, backgroundColor: '#3b82f6', marginLeft: 4, marginBottom: -3 }]} />
              )}
            </Typography>
          </View>
        </View>

        <View className="mt-8 lg:mt-0 lg:ml-8 items-center justify-center">
          <View className="lg:h-20 lg:w-[1px] lg:bg-border/40 lg:mr-8" />
          <PerformanceDial value={velocity} size={width > 400 ? 140 : 120} />
        </View>
      </View>
    </Animated.View>
  );
}
