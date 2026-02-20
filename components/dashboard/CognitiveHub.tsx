import React, { useState, useEffect, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { BrainCircuit, Sparkles, Activity, Zap } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useAnimatedProps,
  useSharedValue,
  Easing
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CognitiveHubProps {
  employee: any;
  intensity?: number;
  aiBrief?: string | null;
  isLoading?: boolean;
}

export function CognitiveHub({ employee, intensity = 0, aiBrief = null, isLoading }: CognitiveHubProps) {
  const { width } = useWindowDimensions();
  const isOnline = employee?.heartbeat?.isCurrentlyRunning;
  const activeWindow = employee?.heartbeat?.lastActiveWindow || "Idle";

  const [displayedAiBrief, setDisplayedAiBrief] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const waveAmplitude = useSharedValue(0);

  const rawBrief = aiBrief || 
    `${employee?.name || 'Personnel'} is ${isOnline ? 'Active' : 'Offline'}. ${isOnline 
        ? `The telemetry indicates execution in ${activeWindow}.`
        : `No live telemetry signal detected. Staff member is currently offline.`
    }`;

  useEffect(() => {
    if (isLoading) return;
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    setDisplayedAiBrief('');
    setIsTypingComplete(false);

    let currentIndex = 0;
    const type = () => {
      if (currentIndex < rawBrief.length) {
        setDisplayedAiBrief(rawBrief.substring(0, currentIndex + 1));
        currentIndex++;
        typingTimerRef.current = setTimeout(type, 12);
      } else {
        setIsTypingComplete(true);
      }
    };

    type();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [rawBrief, isLoading]);

  const visualIntensity = isOnline ? Math.max(intensity, 0.2) : 0;

  useEffect(() => {
    if (isOnline) {
      waveAmplitude.value = withRepeat(
        withSequence(
          withTiming(25 * visualIntensity, { 
            duration: 750 / Math.max(visualIntensity, 0.5), 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(-25 * visualIntensity, { 
            duration: 750 / Math.max(visualIntensity, 0.5), 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1,
        true
      );
    } else {
      waveAmplitude.value = 0;
    }
  }, [isOnline, visualIntensity]);

  const animatedProps = useAnimatedProps(() => {
    const amp = waveAmplitude.value;
    return {
      d: `M 0 30 Q 50 ${30 - amp}, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 600 30 T 700 30 T 800 30 T 900 30 T 1000 30`
    };
  });

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 })), -1, true)
  }));

  if (isLoading || !employee) {
    return (
      <View className="space-y-6 mb-8">
        <Card variant="glass" className="p-8 h-[220px]">
          <View className="flex-row space-x-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <View className="flex-1 space-y-4">
              <Skeleton className="w-32 h-4 rounded-full" />
              <Skeleton className="w-full h-20 rounded-xl" />
            </View>
          </View>
        </Card>
        <Card variant="glass" className="p-8 h-[200px] justify-between">
           <Skeleton className="w-24 h-4 rounded-full" />
           <Skeleton className="w-full h-10 rounded-full" />
           <Skeleton className="w-16 h-8 rounded-lg" />
        </Card>
      </View>
    );
  }

  const focusStatus = visualIntensity > 1.2 ? "Hyper Focus" : visualIntensity > 0.7 ? "Optimal" : visualIntensity > 0.3 ? "Standard" : "Low Impact";
  const rhythmStatus = visualIntensity > 0.8 ? "High Velocity" : visualIntensity > 0.4 ? "Consistent" : "Fragmented";

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(500)} className="space-y-6 mb-8">
      {/* AI Insight Console */}
      <Card variant="glass" className="p-8 relative overflow-hidden">
        <View className="flex-row items-start space-x-6">
          <View className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
            <BrainCircuit size={24} className="text-primary" />
          </View>
          <View className="flex-1">
            <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              AI Insight Summary
            </Typography>
            <Typography className="text-lg font-medium italic leading-relaxed">
              "{displayedAiBrief}"
              {!isTypingComplete && (
                <Animated.View style={[cursorStyle, { width: 4, height: 18, backgroundColor: '#3b82f6', marginLeft: 4, marginBottom: -3 }]} />
              )}
            </Typography>
            
            {isOnline && (
              <View className="flex-row flex-wrap items-center mt-6 gap-4">
                <View className={cn(
                  "flex-row items-center space-x-2 px-3 py-1.5 rounded-lg border",
                  visualIntensity > 0.7 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"
                )}>
                  <Sparkles size={12} className={visualIntensity > 0.7 ? "text-emerald-500" : "text-orange-500"} />
                  <Typography variant="small" className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    visualIntensity > 0.7 ? "text-emerald-500" : "text-orange-500"
                  )}>Focus: {focusStatus}</Typography>
                </View>
                <View className="flex-row items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Activity size={12} className="text-primary" />
                  <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest">Rhythm: {rhythmStatus}</Typography>
                </View>
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Live Intensity Dial */}
      <Card variant="glass" className="p-8 relative overflow-hidden flex-col justify-between">
         <View className="flex-row items-center justify-between mb-6">
             <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Tension</Typography>
             {isOnline && <View className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />}
         </View>
         
         <View className="items-center justify-center py-4">
            <Svg width={width - 80} height={60} viewBox="0 0 1000 60">
              <AnimatedPath
                fill="none"
                stroke={isOnline ? "#3b82f6" : "#52525b"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeOpacity={isOnline ? 1 : 0.2}
                animatedProps={animatedProps}
              />
            </Svg>
         </View>
         
         <View className="mt-6 flex-row items-center justify-between">
            <Typography variant="h2" className="text-4xl font-black tracking-tighter">
                {isOnline ? (intensity * 70).toFixed(0) : "0"}%
            </Typography>
            <Zap size={24} className={isOnline ? 'text-primary' : 'text-muted-foreground/30'} />
         </View>
      </Card>
    </Animated.View>
  );
}
