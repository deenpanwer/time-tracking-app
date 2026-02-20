import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Monitor, Globe, ChevronRight } from 'lucide-react-native';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate
} from 'react-native-reanimated';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string;
  lastLoginOs?: string;
  lastLoginIpAddress?: string;
  heartbeat?: {
    isCurrentlyRunning: boolean;
    lastActiveWindow: string;
  };
}

interface WorkforceRegistryProps {
  employees?: Employee[];
  isLoading?: boolean;
}

const HeartbeatBar = ({ h, isLive }: { h: number, isLive: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!isLive) return { height: '20%' };
    
    return {
      height: withRepeat(
        withSequence(
          withTiming(`${h * 100}%`, { duration: 500 + h * 500 }),
          withTiming(`${(1 - h) * 100}%`, { duration: 500 + h * 500 })
        ),
        -1,
        true
      )
    };
  });

  return (
    <Animated.View 
      style={animatedStyle}
      className={`w-1 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
    />
  );
};

export function WorkforceRegistry({ employees = [], isLoading }: WorkforceRegistryProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  const items = employees.length > 0 ? employees.slice(0, visibleCount) : [
    {
      id: '1',
      name: 'Sarah Connor',
      email: 'sarah@trac.ai',
      role: 'Lead Developer',
      lastLoginOs: 'macOS 14.2',
      lastLoginIpAddress: '192.168.1.42',
      heartbeat: { isCurrentlyRunning: true, lastActiveWindow: 'Visual Studio Code' }
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@trac.ai',
      role: 'UI Designer',
      lastLoginOs: 'Windows 11',
      lastLoginIpAddress: '10.0.0.15',
      heartbeat: { isCurrentlyRunning: false, lastActiveWindow: 'Standby' }
    }
  ];

  const hasMore = visibleCount < employees.length;

  const loadMore = () => {
    setSyncing(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setSyncing(false);
    }, 1200);
  };

  const renderSkeletonRow = (key: number) => (
    <Card key={key} variant="glass" className="p-4 mb-4 h-24 opacity-50">
      <View className="flex-row items-center h-full">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <View className="ml-4 flex-1 space-y-2">
          <Skeleton className="w-32 h-4 rounded-full" />
          <Skeleton className="w-24 h-2 rounded-full" />
        </View>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View className="mt-16 w-full mb-20">
        <View className="mb-10">
          <Skeleton className="w-48 h-10 rounded-lg mb-2" />
          <Skeleton className="w-64 h-3 rounded-full" />
        </View>
        {[1, 2, 3].map(i => renderSkeletonRow(i))}
      </View>
    );
  }

  return (
    <View className="mt-16 w-full mb-20">
      {/* Header */}
      <View className="flex-col md:flex-row justify-between mb-10">
        <View>
          <Typography variant="h2" className="text-3xl font-black uppercase tracking-tighter">Team Directory</Typography>
          <Typography variant="small" className="text-muted-foreground mt-1 text-[10px] font-black uppercase tracking-widest italic">
            Personnel registry and real-time status audit
          </Typography>
        </View>
        <View className="mt-4 md:mt-0 flex-row items-center">
          <View className="flex-row items-center px-4 py-2 rounded-2xl bg-secondary/50 border border-border">
            <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-2">Active Members:</Typography>
            <Typography className="text-sm font-black text-primary">{employees.length || 12}</Typography>
          </View>
        </View>
      </View>

      {/* Directory List */}
      <View className="space-y-4">
        {items.map((emp, i) => (
          <Animated.View 
            key={`${emp.id}-${i}`}
            entering={FadeInUp.duration(600).delay(i * 100)}
          >
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push(`/dashboard/team/${emp.id}`)}
              className="bg-card border border-border/40 rounded-[2rem] p-4 flex-col md:flex-row relative overflow-hidden shadow-sm"
            >
              <View className="flex-row items-center justify-between">
                {/* Identity Cluster */}
                <View className="flex-row items-center flex-1">
                  <View className="relative">
                    <View className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border-2 border-background shadow-lg bg-secondary/20">
                      <Image 
                        source={{ uri: emp.photoUrl || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${emp.email}` }} 
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>
                    <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${emp.heartbeat?.isCurrentlyRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </View>
                  
                  <View className="ml-4 flex-1">
                    <Typography className="font-black text-base tracking-tighter uppercase leading-none mb-1" numberOfLines={1}>
                      {emp.name}
                    </Typography>
                    <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest" numberOfLines={1}>
                      {emp.role || "Staff Member"}
                    </Typography>
                  </View>
                </View>

                {/* Status Indicator (Mobile Only) */}
                <View className="flex-row items-center ml-4">
                  <View className="flex-row space-x-1 items-end h-4 mr-3">
                    {[0.4, 0.7, 0.3, 0.9, 0.5].map((h, j) => (
                      <HeartbeatBar key={j} h={h} isLive={!!emp.heartbeat?.isCurrentlyRunning} />
                    ))}
                  </View>
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                    <ChevronRight size={18} className="text-primary" />
                  </View>
                </View>
              </View>

              {/* Status Details (Lower portion on mobile) */}
              <View className="mt-4 pt-4 border-t border-border/20 flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center space-x-2 mb-1">
                    <Monitor size={10} className="text-primary" />
                    <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest" numberOfLines={1}>
                      {emp.lastLoginOs || "Unknown System"}
                    </Typography>
                  </View>
                  <Typography className="text-xs font-bold text-muted-foreground italic" numberOfLines={1}>
                    {emp.heartbeat?.lastActiveWindow || "Standby Mode"}
                  </Typography>
                </View>
                
                <View className="items-end">
                  <View className="flex-row items-center space-x-2">
                    <Globe size={10} className="text-muted-foreground" />
                    <Typography variant="small" className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Network ID</Typography>
                  </View>
                  <Typography className="text-[10px] font-mono font-bold text-muted-foreground/60">{emp.lastLoginIpAddress || "0.0.0.0"}</Typography>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Load More */}
      {hasMore && (
        <View className="flex-row justify-center mt-12">
          <TouchableOpacity 
            onPress={loadMore}
            disabled={syncing}
            className="px-10 py-4 rounded-[2rem] bg-card border border-border shadow-xl items-center justify-center active:scale-95 disabled:opacity-50"
          >
            <Typography className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {syncing ? "Syncing Directory..." : "Load Additional Personnel"}
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
