import React from 'react';
import { View, useWindowDimensions, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { 
  Activity, Zap, ShieldCheck, Clock, Star, Code2, ChevronRight 
} from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Palette } from '@/constants/theme';

interface MonitoringDashboardProps {
  employees: any[];
  isOfflinePreview?: boolean;
}

export function MonitoringDashboard({ employees, isOfflinePreview = false }: MonitoringDashboardProps) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isSmallScreen = width < 400;

  // Stability styles for Android shadows/rounding artifacts
  const cardStyle = (radius: number) => (!isDark ? { 
    backgroundColor: '#ffffff', 
    borderColor: Palette.zinc[200],
    borderRadius: radius,
    elevation: isOfflinePreview ? 0 : 4,
    shadowOpacity: isOfflinePreview ? 0 : 0.1,
  } : { borderRadius: radius });

  return (
    <View className={cn("space-y-20 md:space-y-32 pt-12 md:pt-16", isOfflinePreview && "space-y-24")}>
      {/* 1. Dashboard Header */}
      <View className="flex-row items-end justify-between px-6">
        <View className="space-y-3 md:space-y-4">
          <Typography variant="h1" className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Technical Intelligence</Typography>
          <Typography className="text-base md:text-xl font-medium text-muted-foreground uppercase tracking-tight">
            Monitoring <Typography className="text-primary font-black">{employees.length}</Typography> Active {employees.length === 1 ? 'Member' : 'Members'}
          </Typography>
        </View>
      </View>

      {/* 2. Global Aggregates */}
      <View className="flex-row flex-wrap -m-3 md:-m-5 px-3">
        <View style={{ width: '50%', padding: isSmallScreen ? 8 : 12 }}>
          <MetricCard icon={Activity} label="Velocity" value="84.2%" trend="+5.2%" color="text-blue-500" isDark={isDark} isPreview={isOfflinePreview} />
        </View>
        <View style={{ width: '50%', padding: isSmallScreen ? 8 : 12 }}>
          <MetricCard icon={Zap} label="Average Focus" value="72/100" trend="-2.1%" color="text-yellow-500" isDark={isDark} isPreview={isOfflinePreview} />
        </View>
        <View style={{ width: '50%', padding: isSmallScreen ? 8 : 12 }}>
          <MetricCard icon={ShieldCheck} label="Compliance" value="100%" trend="STABLE" color="text-green-500" isDark={isDark} isPreview={isOfflinePreview} />
        </View>
        <View style={{ width: '50%', padding: isSmallScreen ? 8 : 12 }}>
          <MetricCard icon={Clock} label="Aggregated" value="1,420h" trend="+124h" color="text-purple-500" isDark={isDark} isPreview={isOfflinePreview} />
        </View>
      </View>

      {/* 3. Live Workforce Grid */}
      <View className="space-y-12 md:space-y-16">
        <View className="flex-row items-center space-x-5 px-6">
          <View className="size-4 md:size-5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
          <Typography variant="h3" className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Live Workforce</Typography>
        </View>
        
        <View className="flex-row flex-wrap -m-4 md:-m-6 px-2">
          {employees.map((emp) => (
            <View key={emp.id} style={{ width: width > 768 ? '33.33%' : '100%', padding: 16 }}>
              <Card 
                variant="glass" 
                className={cn("p-10 md:p-12 rounded-[3.5rem] relative overflow-hidden shadow-xl", isOfflinePreview && "shadow-none")}
                style={cardStyle(56)}
              >
                <View className="flex-row items-center space-x-6 relative z-10">
                  <View className="size-16 rounded-[1.5rem] bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-inner">
                    <Image 
                      source={{ uri: emp.photoUrl || `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${emp.email}` }} 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </View>
                  <View className="flex-1">
                    <Typography className="font-black uppercase tracking-tight text-xl md:text-2xl" numberOfLines={1}>{emp.name || emp.email}</Typography>
                    <Typography variant="small" className="text-[11px] md:text-[12px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5">{emp.role || 'Active Member'}</Typography>
                  </View>
                  <View className="flex-row items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <View className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Typography variant="small" className="text-[10px] font-black text-emerald-500 uppercase">Live</Typography>
                  </View>
                </View>

                <View className="mt-12 md:mt-16 flex-row space-x-6 md:space-x-8 relative z-10">
                  <View 
                    className="flex-1 p-6 rounded-[2.5rem] border border-border/50"
                    style={!isDark ? { backgroundColor: Palette.zinc[50] } : { backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase mb-2.5 tracking-widest">Activity</Typography>
                    <Typography className="text-2xl md:text-3xl font-black tracking-tighter">88%</Typography>
                  </View>
                  <View 
                    className="flex-1 p-6 rounded-[2.5rem] border border-border/50"
                    style={!isDark ? { backgroundColor: Palette.zinc[50] } : { backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase mb-2.5 tracking-widest">Time</Typography>
                    <Typography className="text-2xl md:text-3xl font-black tracking-tighter">6h 12m</Typography>
                  </View>
                </View>

                {!isOfflinePreview && (
                  <View className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-border/50 flex-row justify-between items-center relative z-10">
                    <View className="flex-row -space-x-3">
                      {[1, 2, 3].map(i => (
                        <View key={i} className="size-10 rounded-xl bg-secondary border-2 border-card items-center justify-center shadow-sm">
                          <Code2 size={18} className="text-muted-foreground" />
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity className="flex-row items-center bg-primary h-14 px-8 rounded-[1.5rem] shadow-lg shadow-primary/20 active:scale-95">
                      <Typography variant="small" className="text-white font-black uppercase text-xs tracking-[0.1em]">Deep Dive</Typography>
                      <ChevronRight size={18} color="white" className="ml-2" />
                    </TouchableOpacity>
                  </View>
                )}
                
                {!isOfflinePreview && <View className="absolute top-0 right-0 size-48 bg-primary/5 rounded-full blur-3xl" style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }} />}
              </Card>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Organizational Output Adaptation */}
      <View className="flex-col lg:flex-row gap-12 md:gap-20 pb-40 px-2">
        <Card 
          variant="glass" 
          className={cn("lg:flex-1 p-12 md:p-16 flex-col justify-between h-[450px] md:h-[550px] relative overflow-hidden shadow-2xl", isOfflinePreview && "shadow-none")}
          style={cardStyle(48)}
        >
          <View className="absolute top-0 left-0 right-0 h-2 bg-primary" />
          <View className="mb-12 md:mb-16 px-2">
            <Typography variant="h3" className="text-2xl md:text-4xl font-black tracking-tight uppercase">Organizational Output</Typography>
            <Typography variant="small" className="text-base md:text-xl font-medium text-muted-foreground uppercase tracking-widest mt-2">Aggregated performance (24h)</Typography>
          </View>
          
          <View className="flex-1 flex-row items-end justify-between px-6 mb-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <View 
                key={i} 
                style={{ 
                  height: `${Math.random() * 70 + 20}%`,
                  width: (width - 160) / 30,
                }}
                className="bg-primary/20 rounded-t-md"
              />
            ))}
          </View>
          
          <View className="mt-10 flex-row justify-between px-6 border-t border-border/30 pt-8">
            <Typography variant="small" className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">00:00</Typography>
            <Typography variant="small" className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">12:00</Typography>
            <Typography variant="small" className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">23:59</Typography>
          </View>
        </Card>

        <Card 
          variant="glass" 
          className={cn("lg:w-1/3 p-12 relative overflow-hidden shadow-2xl", isOfflinePreview && "shadow-none")}
          style={cardStyle(48)}
        >
          <View className="absolute top-0 left-0 right-0 h-2 bg-primary" />
          <Typography variant="small" className="text-[12px] font-black uppercase tracking-widest text-muted-foreground mb-12 px-2">Skill Density</Typography>
          
          <View className="space-y-12 px-2">
            <SkillBar label="Velocity" percent={88} color="bg-blue-500" isDark={isDark} />
            <SkillBar label="Reliability" percent={92} color="bg-green-500" isDark={isDark} />
            <SkillBar label="Compliance" percent={100} color="bg-purple-500" isDark={isDark} />
          </View>

          <View 
            className="mt-20 p-10 rounded-[3rem] border border-primary/10 flex-row items-center space-x-6 shadow-inner"
            style={!isDark ? { backgroundColor: Palette.zinc[50] } : { backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
          >
            <View className="size-16 rounded-[1.5rem] bg-primary items-center justify-center shadow-lg shadow-primary/30">
              <Star size={36} color="white" fill="white" />
            </View>
            <View>
              <Typography variant="small" className="text-base font-black uppercase text-primary">Top Performer</Typography>
              <Typography variant="small" className="text-sm text-muted-foreground uppercase font-bold tracking-widest mt-1.5">Sarah Connor</Typography>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

function MetricCard({ icon: Icon, label, value, trend, color, isDark, isPreview }: any) {
  return (
    <Card 
      variant="glass" 
      className={cn("p-8 rounded-[3rem] shadow-lg", isPreview && "shadow-none")}
      style={!isDark ? { 
        backgroundColor: '#ffffff', 
        borderColor: Palette.zinc[200], 
        borderRadius: 48,
        elevation: isPreview ? 0 : 2 
      } : { borderRadius: 48 }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <View 
          className={cn("size-14 rounded-2xl items-center justify-center shadow-inner")}
          style={!isDark ? { backgroundColor: Palette.zinc[100] } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <Icon size={28} className={color} />
        </View>
        <View className="px-3.5 py-2 rounded-full bg-secondary/50 border border-border/30">
          <Typography className={cn("text-[11px] font-black", 
            trend.startsWith('+') ? 'text-green-500' : trend === 'STABLE' ? 'text-blue-500' : 'text-red-500'
          )}>
            {trend}
          </Typography>
        </View>
      </View>
      <Typography variant="h2" className="text-3xl md:text-4xl font-black tracking-tighter mb-1">{value}</Typography>
      <Typography variant="small" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</Typography>
    </Card>
  );
}

function SkillBar({ label, percent, color, isDark }: any) {
  return (
    <View className="space-y-4">
      <View className="flex-row justify-between items-end px-1">
        <Typography variant="small" className="text-[12px] font-black uppercase tracking-widest">{label}</Typography>
        <Typography className="text-lg font-black">{percent}%</Typography>
      </View>
      <View 
        className="h-2.5 w-full rounded-full overflow-hidden shadow-inner"
        style={!isDark ? { backgroundColor: Palette.zinc[100] } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <View 
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
}
