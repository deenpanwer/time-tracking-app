import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapPin, Zap } from 'lucide-react-native';
import { Sparkline } from './Sparkline';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  hoursToday: number;
  prevHours: number[];
  isLive: boolean;
  location: string;
  photoUrl?: string;
}

interface EmployeeCardProps {
  emp: Employee | null;
  isLoading?: boolean;
}

export function EmployeeCard({ emp, isLoading }: EmployeeCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width > 600 ? (width - 60) / 3 : width - 40;

  if (isLoading || !emp) {
    return (
      <Card variant="glass" className="p-8 mb-4 h-[420px]">
        <View className="flex-row justify-between items-start mb-6">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="w-10 h-8 rounded-xl" />
        </View>
        <View className="space-y-3 mb-8">
          <Skeleton className="w-3/4 h-10 rounded-lg" />
          <Skeleton className="w-1/2 h-3 rounded-full" />
        </View>
        <View className="mt-auto space-y-4">
          <Skeleton className="w-16 h-10 rounded-xl" />
          <Skeleton className="w-full h-20 rounded-2xl" />
        </View>
      </Card>
    );
  }

  const isLive = emp.isLive;
  const chartData = emp.prevHours || [0, 0, 0, 0, 0, 0];

  return (
    <Animated.View entering={FadeInUp.duration(600)}>
      <Card 
        variant="glass" 
        className="p-8 lg:p-10 mb-4 flex-col h-[420px] relative overflow-hidden border-b-4 border-b-transparent active:border-b-primary"
      >
        {/* 1. Header Row */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="relative">
            <View className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-background shadow-xl bg-secondary/20">
              <Image 
                source={emp.photoUrl || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${emp.email}`} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${isLive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </View>
          
          <View className={`p-2.5 rounded-xl border ${isLive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-400/10 border-slate-400/10'}`}>
            <Zap size={16} color={isLive ? '#10b981' : '#94a3b8'} fill={isLive ? '#10b981' : 'none'} />
          </View>
        </View>

        {/* 2. Identity Row */}
        <View className="mb-6 min-h-[100px] justify-center">
          <Typography 
            variant="h2" 
            className="text-3xl font-black uppercase tracking-tighter leading-[0.85] mb-2"
          >
            {emp.name.split(' ').join('\n')}
          </Typography>
          <Typography variant="small" className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">
            {emp.role}
          </Typography>
        </View>

        {/* 3. Metrics Row */}
        <View className="mb-6">
          <Typography variant="small" className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">
            Work Hours Today
          </Typography>
          <View className="flex-row items-baseline">
            <Typography variant="h1" className="text-5xl font-black tracking-tighter leading-none">
              {emp.hoursToday}
            </Typography>
            <Typography className="text-xl font-bold ml-1 text-muted-foreground/30">h</Typography>
          </View>
        </View>

        {/* 4. Visual Row */}
        <View className="mt-auto mb-6">
          <Sparkline 
            data={chartData} 
            color={isLive ? '#10b981' : '#3b82f6'} 
            height={80} 
            width={cardWidth - 64} // Card padding is p-8 (32 each side)
          />
        </View>

        {/* 5. Footer Row */}
        <View className="pt-6 border-t border-border/50 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <MapPin size={12} className="text-primary" />
            <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[120px]">
              {emp.location}
            </Typography>
          </View>
          <View className="flex-row items-center space-x-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <Typography variant="small" className="text-[9px] font-black uppercase text-primary tracking-tighter opacity-60">
              Verified Profile
            </Typography>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}
