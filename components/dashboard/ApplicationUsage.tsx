import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Target, Code, Figma, MessageSquare, Terminal, Globe as ChromeIcon, LucideIcon } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { SimpleModal } from '@/components/ui/SimpleModal';

interface AppUsageData {
  name: string;
  hours: number;
  percentage: number;
}

interface ApplicationUsageProps {
  apps?: AppUsageData[];
  isLoading?: boolean;
}

const getAppIcon = (name: string): LucideIcon => {
  const n = name.toLowerCase();
  if (n.includes('vscode') || n.includes('code')) return Code;
  if (n.includes('figma')) return Figma;
  if (n.includes('slack') || n.includes('message')) return MessageSquare;
  if (n.includes('terminal') || n.includes('iterm')) return Terminal;
  if (n.includes('chrome') || n.includes('browser')) return ChromeIcon;
  return Target;
};

interface ProgressBarProps {
  percentage: number;
  index: number;
}

export function AnimatedProgressBar({ percentage, index }: ProgressBarProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withDelay(index * 100, withTiming(`${percentage}%`, { duration: 1500 }))
  }));

  return (
    <View className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden relative">
      <Animated.View 
        className="h-full rounded-full bg-primary"
        style={animatedStyle}
      />
    </View>
  );
};

export function ApplicationUsage({ apps = [], isLoading }: ApplicationUsageProps) {
  const [showAudit, setShowAudit] = useState(false);

  const displayApps = apps.length > 0 ? apps.slice(0, 3) : [
    { name: "VS Code", hours: 4.5, percentage: 45 },
    { name: "Figma", hours: 2.1, percentage: 21 },
    { name: "Chrome", hours: 1.8, percentage: 18 },
  ];

  const auditApps = apps.length > 0 ? apps : displayApps;

  if (isLoading) {
    return (
      <Card variant="glass" className="p-8 mb-8">
        <View className="flex-row items-center space-x-3 mb-8">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-40 h-6 rounded-lg" />
        </View>
        <View className="space-y-8">
          {[1, 2, 3].map((i) => (
            <View key={i} className="space-y-3">
              <View className="flex-row justify-between">
                <View className="flex-row items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-10" />
                  <View className="space-y-2">
                    <Skeleton className="w-24 h-3 rounded-full" />
                    <Skeleton className="w-16 h-2 rounded-full" />
                  </View>
                </View>
                <Skeleton className="w-8 h-3 rounded-full" />
              </View>
              <AnimatedProgressBar percentage={100} index={i} />
            </View>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <>
      <Card variant="glass" className="p-8 mb-8">
        <View className="flex-row items-center space-x-3 mb-8">
          <View className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Code size={20} className="text-primary" />
          </View>
          <Typography variant="h3" className="font-black uppercase tracking-tight">Resource Composition</Typography>
        </View>

        <View className="space-y-8">
          {displayApps.map((app, i) => {
            const Icon = getAppIcon(app.name);
            return (
              <View key={app.name}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center space-x-4">
                    <View className="w-10 h-10 rounded-xl bg-secondary items-center justify-center border border-border/40">
                      <Icon size={18} className="text-primary" />
                    </View>
                    <View>
                      <Typography className="text-[11px] font-black uppercase tracking-tighter" numberOfLines={1}>
                        {app.name}
                      </Typography>
                      <Typography variant="small" className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {app.hours} Hours Today
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="small" className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {app.percentage}%
                  </Typography>
                </View>
                <AnimatedProgressBar percentage={app.percentage} index={i} />
              </View>
            );
          })}
        </View>

        <TouchableOpacity 
          onPress={() => setShowAudit(true)}
          className="w-full mt-10 py-4 rounded-2xl bg-secondary/50 border border-border/40 items-center justify-center active:scale-95"
        >
          <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Detailed Resource Audit
          </Typography>
        </TouchableOpacity>
      </Card>

      <SimpleModal
        visible={showAudit}
        onClose={() => setShowAudit(false)}
        title="Application Intelligence"
        description="Granular resource allocation audit"
      >
        <View className="rounded-[2rem] border border-border overflow-hidden mb-8">
          {/* Mock Table Header */}
          <View className="flex-row bg-secondary/30 px-6 py-4 border-b border-border">
            <View className="flex-1"><Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Application</Typography></View>
            <View className="w-20"><Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Yield</Typography></View>
            <View className="w-20 items-end"><Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Saturation</Typography></View>
          </View>

          {/* Mock Table Body */}
          <View>
            {auditApps.map((app, i) => {
              const Icon = getAppIcon(app.name);
              return (
                <View key={app.name} className="flex-row px-6 py-5 border-b border-border/50 items-center">
                  <View className="flex-1 flex-row items-center space-x-3">
                    <View className="p-2 rounded-xl bg-secondary border border-border">
                      <Icon size={14} className="text-primary" />
                    </View>
                    <Typography className="text-sm font-black uppercase tracking-tight truncate flex-1">{app.name}</Typography>
                  </View>
                  <View className="w-20">
                    <Typography className="text-sm font-bold font-mono">{app.hours}h</Typography>
                  </View>
                  <View className="w-20 items-end">
                    <View className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                      <Typography className="text-primary text-[10px] font-black">{app.percentage}%</Typography>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </SimpleModal>
    </>
  );
}