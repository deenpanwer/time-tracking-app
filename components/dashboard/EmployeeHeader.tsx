import React from 'react';
import { View, Image } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Zap, Clock, Target, MapPin, Activity, Mail, Calendar, ShieldCheck } from 'lucide-react-native';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface EmployeeHeaderProps {
  employee: any;
  totalHours?: string;
  hoursToday?: string;
  topApp?: string;
  joinedDate?: Date | null;
  isLoading?: boolean;
}

const MetricBox = ({ icon: Icon, label, value }: any) => {
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

  return (
    <View className="flex-col p-5 rounded-[2rem] bg-secondary/20 dark:bg-white/5 border border-border/40 overflow-hidden relative min-h-[110px]">
      {/* Shimmer Effect */}
      <Animated.View style={[shimmerStyle, { position: 'absolute', top: 0, bottom: 0, width: '100%', opacity: 0.1 }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, transform: [{ skewX: '-20deg' }] }}
        />
      </Animated.View>

      <View className="flex-row items-center space-x-2 mb-3 relative z-10">
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
      </View>
    </View>
  );
};

export function EmployeeHeader({ 
  employee, 
  totalHours = "0.0", 
  hoursToday = "0.0", 
  topApp = "---", 
  joinedDate,
  isLoading
}: EmployeeHeaderProps) {
  
  const getDate = (ts: any) => {
    if (!ts) return new Date(0);
    if (ts.toDate) return ts.toDate();
    if (ts instanceof Date) return ts;
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  const isOnline = employee?.heartbeat?.isCurrentlyRunning;
  const officialJoinedDate = joinedDate || getDate(employee?.createdAt);

  if (isLoading || !employee) {
    return (
      <View className="bg-card border border-border/40 rounded-[2.5rem] p-8 mb-8">
        <View className="flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <Skeleton className="size-32 md:size-40 rounded-[3rem]" />
          <View className="flex-1 w-full space-y-6">
            <View className="space-y-3">
              <Skeleton className="w-24 h-4 rounded-full" />
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-3/4 h-3 rounded-full" />
            </View>
            <View className="flex-row flex-wrap gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="flex-1 min-w-[45%] h-24 rounded-[2rem]" />
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(600)} className="bg-card border border-border/40 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-2xl">
      {/* Background Accent */}
      <View 
        className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" 
        style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }}
        pointerEvents="none" 
      />
      
      <View className="flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Avatar Section */}
        <View className="relative shrink-0">
          <View className={`absolute -inset-4 rounded-[3.5rem] blur-2xl opacity-20 ${isOnline ? "bg-emerald-500" : "bg-primary"}`} />
          <View className="size-32 md:size-40 rounded-[3rem] bg-secondary border-2 border-white/20 overflow-hidden shadow-xl relative z-10">
            <Image 
              source={{ uri: employee?.photoUrl || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${employee?.email}` }} 
              style={{ width: '100%', height: '100%' }}
            />
          </View>
          <View className={`absolute -bottom-2 -right-2 size-8 rounded-xl border-4 border-card flex items-center justify-center z-20 shadow-xl ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}>
            <Zap size={14} color="white" fill="white" />
          </View>
        </View>

        {/* Identity & Metrics Container */}
        <View className="flex-1 w-full space-y-8">
          <View className="space-y-4">
            <View className="flex-row items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start">
              <View className={`w-1.5 h-1.5 rounded-full mr-2 ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
              <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest">
                {isOnline ? "Currently Working" : "Offline"}
              </Typography>
            </View>
            
            <View>
              <Typography variant="h1" className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-3">
                {employee?.name || "Anonymous Member"}
              </Typography>
              <View className="flex-row flex-wrap gap-x-4 gap-y-2">
                <View className="flex-row items-center space-x-1.5">
                  <Activity size={12} className="text-primary" />
                  <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{employee?.role || "Team Member"}</Typography>
                </View>
                <View className="flex-row items-center space-x-1.5">
                  <Mail size={12} className="text-primary" />
                  <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{employee?.email}</Typography>
                </View>
                <View className="flex-row items-center space-x-1.5">
                  <Calendar size={12} className="text-primary" />
                  <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Joined {officialJoinedDate.getTime() > 0 ? format(officialJoinedDate, 'dd MMM yyyy') : '01 Jan 2026'}</Typography>
                </View>
                <View className="flex-row items-center space-x-1.5">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <Typography variant="small" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Metrics Grid */}
          <View className="flex-row flex-wrap -m-2">
            {[
              { icon: Zap, label: "Shift Hours", value: `${hoursToday}h` },
              { icon: Clock, label: "Today's Total", value: `${totalHours}h` },
              { icon: Target, label: "Top Application", value: topApp },
              { icon: MapPin, label: "Region", value: employee?.lastLoginLocation?.city || "Remote" },
            ].map((metric, i) => (
              <View key={i} style={{ width: '50%', padding: 8 }}>
                <MetricBox {...metric} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
