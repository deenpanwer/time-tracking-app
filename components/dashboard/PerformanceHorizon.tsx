import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import Svg, { Path, Defs, LinearGradient, Stop, G, Line, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PerformanceHorizonProps {
  data: any[];
}

export function PerformanceHorizon({ data }: PerformanceHorizonProps) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 80;
  const chartHeight = 200;
  const padding = 30;

  const maxVal = Math.max(...data.map(d => Math.max(d.actualHours || 0, d.projectedHours || 0)), 1);

  const getX = (i: number) => (i / 23) * chartWidth;
  const getY = (val: number) => chartHeight - (val / maxVal) * (chartHeight - padding) - padding/2;

  const lineGen = (key: string) => (shape.line() as any)
    .x((_: any, i: number) => getX(i))
    .y((d: any) => getY(d[key] || 0))
    .defined((d: any) => d[key] !== null)
    .curve(shape.curveMonotoneX)(data);

  const areaGen = (key: string) => (shape.area() as any)
    .x((_: any, i: number) => getX(i))
    .y0(chartHeight)
    .y1((d: any) => getY(d[key] || 0))
    .defined((d: any) => d[key] !== null)
    .curve(shape.curveMonotoneX)(data);

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(300)}>
      <Card variant="glass" className="p-8 mb-8 relative overflow-hidden">
        <View className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
        <View className="mb-8">
          <Typography variant="h3" className="font-black uppercase tracking-tight">Organizational Output</Typography>
          <Typography variant="small" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Aggregated performance (24h)
          </Typography>
        </View>

        <View style={{ height: chartHeight + 30, width: chartWidth }}>
          <Svg width={chartWidth} height={chartHeight + 30}>
            <Defs>
              <LinearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#6366f1" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#6366f1" stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {/* Area */}
            <Path d={areaGen('actualHours')} fill="url(#gradActual)" />
            
            {/* Projected Line (Dashed) */}
            <Path d={lineGen('projectedHours')} stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fill="none" opacity={0.5} />
            
            {/* Actual Line */}
            <Path d={lineGen('actualHours')} stroke="#6366f1" strokeWidth={3} fill="none" />

            {/* X-Axis */}
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
      </Card>
    </Animated.View>
  );
}
