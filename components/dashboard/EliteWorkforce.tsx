import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Users, TrendingUp, Clock } from 'lucide-react-native';
import { EmployeeCard } from './EmployeeCard';
import { Sparkline } from './Sparkline';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface EliteWorkforceProps {
  employees?: any[];
  isLoading?: boolean;
}

export function EliteWorkforce({ employees = [], isLoading }: EliteWorkforceProps) {
  const { width } = useWindowDimensions();
  const visibleEmployees = employees.length > 0 ? employees.slice(0, 2) : [
    {
      id: '1',
      name: 'Sarah Connor',
      email: 'sarah@trac.ai',
      role: 'Lead Developer',
      hoursToday: 7.5,
      prevHours: [2, 5, 3, 8, 4, 7, 6],
      isLive: true,
      location: 'Austin, TX',
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@trac.ai',
      role: 'UI Designer',
      hoursToday: 6.2,
      prevHours: [4, 3, 6, 5, 7, 4, 5],
      isLive: false,
      location: 'Remote',
    }
  ];

  const cumulativeHours = useMemo(() => {
    return visibleEmployees.reduce((acc, emp) => acc + (parseFloat(emp.hoursToday) || 0), 0).toFixed(1);
  }, [visibleEmployees]);

  const aggregatedData = useMemo(() => {
    const dataPoints = 10;
    const combined = Array(dataPoints).fill(0);
    
    visibleEmployees.forEach(emp => {
      const scores = emp.prevHours || [];
      const slice = scores.slice(-dataPoints);
      slice.forEach((score: number, idx: number) => {
        combined[idx] += score;
      });
    });

    return combined;
  }, [visibleEmployees]);

  return (
    <View className="mb-16 space-y-8">
      <View className="flex-row items-center space-x-6 mb-8">
        <View className="h-[1px] flex-1 bg-primary/10" />
        <Typography variant="small" className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/40">
          Top Performers
        </Typography>
        <View className="h-[1px] flex-1 bg-primary/10" />
      </View>

      <View className="flex-row flex-wrap -m-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <View key={i} style={{ width: width > 768 ? '33.33%' : '100%', padding: 8 }}>
              {i === 3 ? (
                 <Card variant="glass" className="p-8 h-[420px] animate-pulse" />
              ) : (
                <EmployeeCard isLoading={true} emp={null} />
              )}
            </View>
          ))
        ) : (
          <>
            {visibleEmployees.map((emp) => (
              <View key={emp.id} style={{ width: width > 768 ? '33.33%' : '100%', padding: 8 }}>
                <EmployeeCard emp={emp} />
              </View>
            ))}

            {/* Aggregate Audit Card */}
            <View style={{ width: width > 768 ? '33.33%' : '100%', padding: 8 }}>
              <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                <Card 
                  variant="glass" 
                  className="bg-primary/5 border-none shadow-2xl flex-col justify-between p-8 lg:p-10 h-[420px] relative overflow-hidden"
                >
                  <View className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }} />
                  
                  <View className="relative z-10 space-y-8">
                    <View className="flex-row justify-between items-start">
                      <View className="p-4 rounded-[1.5rem] bg-primary/10 border border-primary/20 shadow-inner">
                        <Users size={24} className="text-primary" />
                      </View>
                      <View className="flex-row items-center bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/20">
                        <TrendingUp size={16} className="text-emerald-400 mr-2" />
                        <Typography className="text-[10px] font-black text-emerald-400">+12.4%</Typography>
                      </View>
                    </View>

                    <View>
                      <Typography variant="small" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 mb-3">
                        Combined Work Time
                      </Typography>
                      <View className="flex-row items-baseline">
                        <Typography variant="h1" className="text-6xl font-black tracking-tighter leading-none">
                          {cumulativeHours}
                        </Typography>
                        <Typography className="text-2xl font-bold text-muted-foreground uppercase ml-2">h</Typography>
                      </View>
                      <View className="flex-row items-center mt-4 space-x-2">
                        <Clock size={14} className="text-primary/60" />
                        <Typography variant="small" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Active Session Overview
                        </Typography>
                      </View>
                    </View>
                  </View>
                  
                  <View className="mt-auto relative z-10 pt-8">
                    <View className="h-20 w-full mb-8">
                      <Sparkline 
                        data={aggregatedData} 
                        color="#3b82f6" 
                        height={80} 
                        width={width > 768 ? (width - 60) / 3 - 64 : width - 104} 
                      />
                    </View>
                    <View className="pt-6 border-t border-border/20 flex-row items-center justify-between">
                      <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Team Scaling
                      </Typography>
                      <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        Consistent Output
                      </Typography>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
