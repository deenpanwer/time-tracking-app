import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as shape from 'd3-shape';

interface SparklineProps {
  data: number[];
  color: string;
  height: number;
  width: number;
}

export function Sparkline({ data, color, height, width }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height * 0.8 - height * 0.1, // Leave some padding
  }));

  const line = (shape.line() as any)
    .x((d: any) => d.x)
    .y((d: any) => d.y)
    .curve(shape.curveMonotoneX)(points);

  const area = (shape.area() as any)
    .x((d: any) => d.x)
    .y0(height)
    .y1((d: any) => d.y)
    .curve(shape.curveMonotoneX)(points);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#gradient)" />
        <Path d={line} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}
