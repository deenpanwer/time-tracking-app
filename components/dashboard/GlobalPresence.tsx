import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native';
import { Globe, Users, Maximize2, MapPin } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { SimpleModal } from '@/components/ui/SimpleModal';
import { Skeleton } from '@/components/ui/Skeleton';
import Svg, { Path, G } from 'react-native-svg';
import * as d3 from 'd3-geo';
import { feature } from 'topojson-client';
import Animated, { FadeInUp, FadeIn, ScaleInCenter } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

interface Employee {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  lastLoginLocation?: {
    country?: string;
    city?: string;
  };
}

interface GlobalPresenceProps {
  employees?: Employee[];
  isLoading?: boolean;
}

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function GlobalPresence({ employees = [], isLoading }: GlobalPresenceProps) {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showExpanded, setShowExpanded] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then(res => res.json())
      .then(data => {
        const countries = feature(data, data.objects.countries) as any;
        setGeoData(countries.features);
      })
      .catch(err => console.error("Map Fetch Error:", err));
  }, []);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const country = emp.lastLoginLocation?.country;
      if (country) {
        counts[country] = (counts[country] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  const activeCountriesCount = Object.keys(countryData).length;

  const renderMap = (mapWidth: number, mapHeight: number, interactive = true) => {
    if (!geoData) return <Skeleton className="w-full h-full rounded-3xl" />;

    const projection = d3.geoMercator()
      .scale(mapWidth / 6.5)
      .translate([mapWidth / 2, mapHeight / 1.6]);

    const pathGenerator = d3.geoPath().projection(projection);

    return (
      <Svg width={mapWidth} height={mapHeight}>
        <G>
          {geoData.map((d: any, i: number) => {
            const name = d.properties.name;
            const count = countryData[name];
            const isActive = count > 0;

            return (
              <Path
                key={i}
                d={pathGenerator(d) || undefined}
                fill={isActive ? '#3b82f6' : (isDark ? '#27272a' : '#f1f5f9')}
                stroke={isDark ? '#3f3f46' : '#e2e8f0'}
                strokeWidth={0.5}
                onPress={() => {
                  if (interactive && isActive) {
                    setSelectedCountry(selectedCountry === name ? null : name);
                  }
                }}
              />
            );
          })}
        </G>
      </Svg>
    );
  };

  if (isLoading) {
    return (
      <Card variant="glass" className="p-8 mb-16 h-[500px]">
        <View className="flex-row items-center space-x-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-48 h-6 rounded-lg" />
        </View>
        <View className="flex-1 flex-row">
          <View className="w-1/3 space-y-6">
            <Skeleton className="w-full h-4 rounded-full" />
            <Skeleton className="w-20 h-10 rounded-lg" />
            <Skeleton className="w-full h-20 rounded-[2rem]" />
          </View>
          <View className="w-2/3 ml-8">
            <Skeleton className="w-full h-full rounded-3xl" />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(600)} className="mb-16">
      <Card variant="glass" className="p-8 overflow-hidden">
        <View className="flex-col lg:flex-row">
          {/* Content Area */}
          <View className="mb-10">
            <View className="flex-row items-center space-x-3 mb-6">
              <View className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Globe size={20} className="text-primary" />
              </View>
              <Typography variant="h3" className="font-black uppercase tracking-tight">Global Coverage</Typography>
            </View>
            
            <Typography variant="small" className="text-muted-foreground text-[11px] font-bold leading-relaxed italic mb-8">
              {activeCountriesCount > 1 
                ? "Your team is spread across different countries and timezones working together." 
                : "Your team is currently focused within a single country, providing concentrated regional intelligence."}
            </Typography>

            <View className="flex-row space-x-12 mb-10">
              <View>
                <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Global Scale</Typography>
                <View className="flex-row items-baseline space-x-2">
                  <Typography variant="h2" className="text-3xl font-black tracking-tighter">{activeCountriesCount}</Typography>
                  <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase">Countries</Typography>
                </View>
              </View>
              <View>
                <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Total Staff</Typography>
                <View className="flex-row items-baseline space-x-2">
                  <Typography variant="h2" className="text-3xl font-black tracking-tighter">{employees.length || 12}</Typography>
                  <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase">Members</Typography>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setShowExpanded(true)}
              className="bg-primary p-6 rounded-[2rem] shadow-xl items-center justify-center flex-row space-x-4 active:scale-95"
            >
              <View className="flex-1">
                <Typography variant="small" className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Strategic Vector</Typography>
                <Typography className="text-lg font-black text-white uppercase tracking-tight">Expand Output</Typography>
              </View>
              <Users size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Map Area */}
          <View className="items-center justify-center relative h-[300px]">
            {renderMap(width - 80, 300)}
            
            {selectedCountry && (
              <Animated.View 
                entering={ScaleInCenter.duration(300)}
                className="absolute bg-black/90 p-4 rounded-2xl border border-white/10 items-center min-w-[120px]"
              >
                <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{selectedCountry}</Typography>
                <Typography className="text-3xl font-black text-white tracking-tighter">{countryData[selectedCountry]}</Typography>
                <Typography variant="small" className="text-[8px] font-bold text-gray-500 uppercase mt-1">Staff Members</Typography>
              </Animated.View>
            )}
          </View>
        </View>
      </Card>

      <SimpleModal
        visible={showExpanded}
        onClose={() => setShowExpanded(false)}
        title="Our Global Team"
        description="See where everyone is working from"
      >
        <View className="h-[300px] bg-secondary/10 rounded-[2rem] border border-border/50 overflow-hidden mb-8 items-center justify-center">
          {renderMap(width - 60, 300, false)}
        </View>

        <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 ml-2">
          Team Member List
        </Typography>

        <View className="space-y-3 mb-10">
          {(employees.length > 0 ? employees : Array(5).fill({ name: 'John Doe', lastLoginLocation: { country: 'USA' } })).map((emp, i) => (
            <View key={i} className="flex-row items-center p-4 bg-secondary/20 rounded-2xl border border-border/40">
              <View className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-card">
                 <Image 
                    source={emp.photoUrl || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${emp.email || i}`} 
                    style={{ width: '100%', height: '100%' }}
                 />
              </View>
              <View className="ml-4 flex-1">
                <Typography className="text-sm font-black uppercase tracking-tight">{emp.name}</Typography>
                <View className="flex-row items-center mt-1">
                  <MapPin size={10} className="text-primary mr-1" />
                  <Typography variant="small" className="text-[9px] font-black text-primary uppercase">{emp.lastLoginLocation?.country || 'Remote'}</Typography>
                </View>
              </View>
              <TouchableOpacity className="p-2 rounded-xl bg-card border border-border">
                <Maximize2 size={16} className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </SimpleModal>
    </Animated.View>
  );
}
