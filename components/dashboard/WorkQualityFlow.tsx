import React, { useMemo, useState } from 'react';
import { View, useWindowDimensions, TouchableOpacity } from 'react-native';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { ShieldCheck, User, AppWindow, RefreshCcw, Activity } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Svg, { Path, Rect, G, Text as SvgText } from 'react-native-svg';
import Animated, { 
  FadeIn, 
  FadeInUp, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface SankeyNode {
  name: string;
  id: string;
  color: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface WorkQualityFlowProps {
  data?: { nodes: SankeyNode[]; links: SankeyLink[] };
  isLoading?: boolean;
}

const DEFAULT_DATA = {
  nodes: [
    { id: 'source', name: 'Logged Time', color: '#3b82f6' },
    { id: 'm1', name: 'Sarah Connor', color: '#a855f7' },
    { id: 'm2', name: 'John Doe', color: '#a855f7' },
    { id: 'app1', name: 'VS Code', color: '#10b981' },
    { id: 'app2', name: 'Figma', color: '#10b981' },
    { id: 'app3', name: 'Chrome', color: '#10b981' },
  ],
  links: [
    { source: 'source', target: 'm1', value: 8.5 },
    { source: 'source', target: 'm2', value: 6.2 },
    { source: 'm1', target: 'app1', value: 5.0 },
    { source: 'm1', target: 'app2', value: 3.5 },
    { source: 'm2', target: 'app2', value: 2.2 },
    { source: 'm2', target: 'app3', value: 4.0 },
  ]
};

export function WorkQualityFlow({ data = DEFAULT_DATA, isLoading }: WorkQualityFlowProps) {
  const { width } = useWindowDimensions();
  const [selectedItem, setSelectedItem] = useState<{ name: string; value: number } | null>(null);
  
  const chartWidth = width - 40; // Full width minus padding
  const chartHeight = 400;

  const sankeyLayout = useMemo(() => {
    if (!data.nodes.length || !data.links.length) return null;
    
    try {
      const s = sankey<any, any>()
        .nodeWidth(10)
        .nodePadding(20)
        .nodeId(d => d.id)
        .extent([[10, 10], [chartWidth - 10, chartHeight - 30]]);
      
      // Clone data as d3 mutates it
      const nodes = data.nodes.map(n => ({ ...n }));
      const links = data.links.map(l => ({ ...l }));

      return s({ nodes, links });
    } catch (e) {
      console.error("Sankey Layout Error:", e);
      return null;
    }
  }, [data, chartWidth]);

  if (isLoading) {
    return (
      <Card variant="glass" className="p-8 mb-16">
        <View className="flex-row justify-between items-end mb-10">
          <View className="space-y-2">
            <Typography variant="h3" className="font-black uppercase tracking-tighter">Time Utilization</Typography>
            <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Mapping Organization Workflows...
            </Typography>
          </View>
          <Animated.View style={{ transform: [{ rotate: '0deg' }] }}>
             <RefreshCcw size={20} className="text-primary" />
          </Animated.View>
        </View>
        <View className="h-[350px] w-full bg-secondary/20 rounded-[2.5rem] border border-dashed border-border/50 items-center justify-center overflow-hidden">
            <Activity size={48} className="text-muted-foreground/20 mb-4" />
            <Typography variant="small" className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
              Processing global telemetry
            </Typography>
        </View>
      </Card>
    );
  }

  if (!sankeyLayout) return null;

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(400)} className="mb-16">
      <Card variant="glass" className="p-8">
        <View className="flex-row justify-between items-start mb-10">
          <View className="flex-1">
            <Typography variant="h3" className="font-black uppercase tracking-tighter">Time Utilization</Typography>
            <Typography variant="small" className="text-muted-foreground mt-1 text-[9px] font-black uppercase tracking-widest leading-tight">
              Breakdown of today's logged hours across team members and applications
            </Typography>
          </View>
        </View>

        <View className="relative h-[400px]">
          <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Links */}
            <G>
              {sankeyLayout.links.map((link: any, i: number) => (
                <Path
                  key={`link-${i}`}
                  d={sankeyLinkHorizontal()(link) || undefined}
                  stroke={link.source.color || '#3b82f6'}
                  strokeWidth={Math.max(2, link.width || 0)}
                  opacity={0.3}
                  onPress={() => setSelectedItem({ name: `${link.source.name} → ${link.target.name}`, value: link.value })}
                />
              ))}
            </G>
            
            {/* Nodes */}
            <G>
              {sankeyLayout.nodes.map((node: any, i: number) => (
                <G key={`node-${i}`}>
                  <Rect
                    x={node.x0}
                    y={node.y0}
                    width={node.x1 - node.x0}
                    height={node.y1 - node.y0}
                    fill={node.color}
                    rx={4}
                    onPress={() => setSelectedItem({ name: node.name, value: node.value })}
                  />
                  {/* Node Labels */}
                  <SvgText
                    x={node.x0 < chartWidth / 2 ? node.x1 + 6 : node.x0 - 6}
                    y={(node.y0 + node.y1) / 2}
                    fill={node.color}
                    fontSize="9"
                    fontWeight="900"
                    textAnchor={node.x0 < chartWidth / 2 ? 'start' : 'end'}
                    alignmentBaseline="middle"
                    opacity={0.8}
                  >
                    {node.name.toUpperCase()}
                  </SvgText>
                  <SvgText
                    x={node.x0 < chartWidth / 2 ? node.x1 + 6 : node.x0 - 6}
                    y={(node.y0 + node.y1) / 2 + 10}
                    fill={node.color}
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor={node.x0 < chartWidth / 2 ? 'start' : 'end'}
                    alignmentBaseline="middle"
                    opacity={0.4}
                  >
                    {node.value.toFixed(1)}H
                  </SvgText>
                </G>
              ))}
            </G>
          </Svg>

          {/* Tooltip (Tap to view) */}
          {selectedItem && (
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => setSelectedItem(null)}
              className="absolute inset-0 items-center justify-center bg-background/5"
            >
              <Animated.View 
                entering={FadeIn.duration(200)}
                className="bg-card/95 border border-border/50 rounded-2xl p-4 shadow-2xl items-center"
              >
                <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                  {selectedItem.name}
                </Typography>
                <View className="flex-row items-baseline">
                  <Typography variant="h2" className="text-3xl font-black tracking-tighter">
                    {selectedItem.value.toFixed(1)}
                  </Typography>
                  <Typography variant="small" className="text-xs font-bold text-muted-foreground uppercase ml-1">
                    Hours
                  </Typography>
                </View>
                <Typography variant="small" className="text-[8px] text-muted-foreground mt-2 uppercase tracking-tighter">
                  Tap anywhere to dismiss
                </Typography>
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        {/* Legend */}
        <View className="flex-row justify-center space-x-6 mt-6">
          <LegendItem color="bg-blue-500" label="Source" />
          <LegendItem color="bg-purple-500" label="Team" />
          <LegendItem color="bg-emerald-500" label="Apps" />
        </View>
      </Card>
    </Animated.View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center space-x-2">
      <View className={`w-2 h-2 rounded-full ${color}`} />
      <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </Typography>
    </View>
  );
}
