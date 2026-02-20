import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { MousePointer2, Keyboard, Move } from 'lucide-react-native';
import { format } from 'date-fns';
import Svg, { Path, Defs, LinearGradient, Stop, G, Line, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ActivityMatrixProps {
  workShifts?: any[];
  isLoading?: boolean;
}

export function ActivityMatrix({ workShifts = [], isLoading }: ActivityMatrixProps) {
  const { width } = useWindowDimensions();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const { chartData, totals } = useMemo(() => {
    const hourlyBuckets: any[] = [];
    
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      hourlyBuckets.push({
        time: hour,
        keystrokes: 0,
        clicks: 0,
        distance: 0,
      });
    }

    let totalKeys = 0;
    let totalClicks = 0;
    let totalDistance = 0;

    workShifts.forEach((shift) => {
      if (!shift.id?.startsWith(todayStr)) return;

      if (shift.hourlyPulse) {
        Object.entries(shift.hourlyPulse).forEach(([hour, metrics]: [string, any]) => {
          const hourIdx = parseInt(hour, 10);
          if (hourIdx >= 0 && hourIdx < 24) {
            const ks = metrics.keystrokes || 0;
            const mc = metrics.mouseClicks || 0;
            const md = metrics.mouseDistance || 0;

            hourlyBuckets[hourIdx].keystrokes += ks;
            hourlyBuckets[hourIdx].clicks += mc;
            hourlyBuckets[hourIdx].distance += md;

            totalKeys += ks;
            totalClicks += mc;
            totalDistance += md;
          }
        });
      }
    });

    return {
      chartData: hourlyBuckets,
      totals: {
        keys: totalKeys,
        clicks: totalClicks,
        distance: totalDistance,
      },
    };
  }, [workShifts, todayStr]);

  const renderChart = () => {
    const chartWidth = width - 80; // Card padding and screen margin
    const chartHeight = 180;
    const padding = 20;

    // Scale data
    const maxVal = Math.max(
      ...chartData.map(d => Math.max(d.keystrokes, d.clicks)),
      10 // Minimum scale
    );

    const getX = (i: number) => (i / 23) * chartWidth;
    const getY = (val: number) => chartHeight - (val / maxVal) * (chartHeight - padding) - padding/2;

    const lineGen = (key: string) => (shape.line() as any)
      .x((_: any, i: number) => getX(i))
      .y((d: any) => getY(d[key]))
      .curve(shape.curveMonotoneX)(chartData);

    const areaGen = (key: string) => (shape.area() as any)
      .x((_: any, i: number) => getX(i))
      .y0(chartHeight)
      .y1((d: any) => getY(d[key]))
      .curve(shape.curveMonotoneX)(chartData);

    return (
      <View style={{ height: chartHeight + 30, width: chartWidth }}>
        <Svg width={chartWidth} height={chartHeight + 30}>
          <Defs>
            <LinearGradient id="gradKeys" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3b82f6" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#a855f7" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#a855f7" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Grid Lines */}
          {[0, 0.5, 1].map((p, i) => (
            <Line
              key={i}
              x1="0"
              y1={padding/2 + (chartHeight - padding) * p}
              x2={chartWidth}
              y2={padding/2 + (chartHeight - padding) * p}
              stroke="#888"
              strokeOpacity="0.1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Areas */}
          <Path d={areaGen('keystrokes')} fill="url(#gradKeys)" />
          <Path d={areaGen('clicks')} fill="url(#gradClicks)" />

          {/* Lines */}
          <Path d={lineGen('keystrokes')} stroke="#3b82f6" strokeWidth={2} fill="none" />
          <Path d={lineGen('clicks')} stroke="#a855f7" strokeWidth={2} fill="none" />

          {/* X-Axis Labels */}
          {[0, 6, 12, 18, 23].map((h) => (
            <SvgText
              key={h}
              x={getX(h)}
              y={chartHeight + 20}
              fill="#888"
              fontSize="9"
              fontWeight="900"
              textAnchor="middle"
            >
              {h.toString().padStart(2, '0')}:00
            </SvgText>
          ))}
        </Svg>
      </View>
    );
  };

  if (isLoading || (workShifts.length === 0 && !isLoading)) {
    // Show placeholder if loading or no data
    return (
      <View className="space-y-6 mb-8">
        <Card variant="glass" className="p-8 h-[350px] justify-center">
          <Skeleton className="w-48 h-6 rounded-lg mb-8" />
          <Skeleton className="w-full h-48 rounded-2xl" />
        </Card>
        <View className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} variant="glass" className="p-6 flex-row items-center space-x-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <View className="space-y-2">
                <Skeleton className="w-24 h-6 rounded-lg" />
                <Skeleton className="w-32 h-3 rounded-full" />
              </View>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(400)} className="space-y-6 mb-8">
      {/* 24-Hour Activity Intensity Chart */}
      <Card variant="glass" className="p-8 shadow-xl">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Typography variant="h3" className="font-black uppercase tracking-tighter">Activity Intensity</Typography>
            <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Full Day Interaction Matrix (24 Hours)
            </Typography>
          </View>
          <View className="flex-row space-x-4">
            <LegendItem color="bg-primary" label="Keys" />
            <LegendItem color="bg-purple-500" label="Clicks" />
          </View>
        </View>

        <View className="items-center">
          {renderChart()}
        </View>
      </Card>

      {/* Aggregate Stats */}
      <View className="space-y-4">
        <StatCard
          icon={Keyboard}
          label="Total Keystrokes"
          value={totals.keys.toLocaleString()}
          sub="Captured Today"
          color="text-primary"
        />
        <StatCard
          icon={MousePointer2}
          label="Total Interactions"
          value={totals.clicks.toLocaleString()}
          sub="Clicks & Selects"
          color="text-purple-500"
        />
        <StatCard
          icon={Move}
          label="Cursor Distance"
          value={totals.distance >= 1000000 ? `${(totals.distance / 1000000).toFixed(2)}M` : `${(totals.distance / 1000).toFixed(1)}k`}
          sub="Pixels Traversed"
          color="text-blue-500"
        />
      </View>
    </Animated.View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center space-x-2">
      <View className={`w-2 h-2 rounded-full ${color}`} />
      <Typography variant="small" className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{label}</Typography>
    </View>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <Card variant="glass" className="p-5 flex-row items-center space-x-5">
      <View className={`p-4 rounded-2xl bg-secondary/30`}>
        <Icon size={24} className={color} />
      </View>
      <View>
        <Typography variant="h2" className="text-2xl font-black tracking-tighter">{value}</Typography>
        <Typography variant="small" className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</Typography>
        <Typography variant="small" className="text-[8px] font-bold text-muted-foreground/50 uppercase mt-0.5">{sub}</Typography>
      </View>
    </Card>
  );
}
