import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Image, Modal, useWindowDimensions, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Hash, Clock, ZoomIn, ImageIcon, ChevronDown, X } from 'lucide-react-native';
import { format } from 'date-fns';
import Animated, { FadeInUp, FadeIn, ScaleInCenter } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';

interface WorkHistoryProps {
  timeEntries?: any[];
  screenshots?: any[];
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function WorkHistory({ timeEntries = [], screenshots = [], onLoadMore, isLoading }: WorkHistoryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getDate = (ts: any) => {
    if (!ts) return new Date(0);
    if (ts.toDate) return ts.toDate();
    if (ts instanceof Date) return ts;
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  const clusters = useMemo(() => {
    return timeEntries.map(entry => {
      const start = getDate(entry.startTime);
      const end = getDate(entry.endTime);
      
      const relatedScreenshots = screenshots.filter(s => {
        const sTime = getDate(s.timestamp);
        return sTime >= start && sTime <= end;
      }).sort((a, b) => getDate(b.timestamp).getTime() - getDate(a.timestamp).getTime());

      return {
        ...entry,
        startTime: start,
        endTime: end,
        images: relatedScreenshots.slice(0, 5)
      };
    });
  }, [timeEntries, screenshots]);

  if (isLoading || (timeEntries.length === 0 && !isLoading)) {
    return (
      <Card variant="glass" className="p-8 mb-8">
        <View className="flex-row items-center justify-between mb-8">
          <Skeleton className="w-48 h-6 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </View>
        <View className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-32 rounded-[2rem]" />
          ))}
        </View>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-8 mb-8 relative overflow-hidden">
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Typography variant="h3" className="font-black uppercase tracking-tighter">Engagement Log</Typography>
          <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Chronological activity clusters
          </Typography>
        </View>
        <View className="w-10 h-10 bg-primary/10 rounded-xl items-center justify-center border border-primary/20">
          <Hash size={20} className="text-primary" />
        </View>
      </View>

      <View className="space-y-6">
        {clusters.map((entry, idx) => (
          <Animated.View 
            key={entry.id || idx}
            entering={FadeInUp.duration(600).delay(idx * 100)}
            className="p-5 rounded-[2.5rem] bg-secondary/20 border border-border/40"
          >
            {/* 1. Time & Meta */}
            <View className="flex-row items-center space-x-4 mb-4">
              <View className="flex-col items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border">
                <Typography variant="small" className="text-[9px] font-black text-primary uppercase">
                  {entry.startTime.getTime() > 0 ? format(entry.startTime, 'HH:mm') : '--:--'}
                </Typography>
                <View className="w-0.5 h-1.5 bg-muted-foreground/20 my-0.5" />
                <Typography variant="small" className="text-[9px] font-black text-muted-foreground uppercase">
                  {entry.endTime.getTime() > 0 ? format(entry.endTime, 'HH:mm') : '--:--'}
                </Typography>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center space-x-2 mb-1">
                  <View className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    <Typography className="text-primary text-[8px] font-black uppercase tracking-wider">
                      {entry.projectName || "General"}
                    </Typography>
                  </View>
                  <View className="flex-row items-center space-x-1">
                    <Clock size={10} className="text-muted-foreground" />
                    <Typography variant="small" className="text-[9px] font-black text-muted-foreground uppercase">
                      {Math.floor((entry.duration || 0) / 60)}m {(entry.duration || 0) % 60}s
                    </Typography>
                  </View>
                </View>
                <Typography className="text-xs font-bold uppercase tracking-tight text-foreground/80 leading-tight" numberOfLines={2}>
                  {entry.description || `Activity session within ${entry.projectName || 'environment'}.`}
                </Typography>
              </View>
            </View>

            {/* 2. Visual Proof */}
            <View className="flex-row flex-wrap -m-1">
              {entry.images.length > 0 ? (
                entry.images.map((img: any, i: number) => (
                  <TouchableOpacity 
                    key={i} 
                    activeOpacity={0.8}
                    onPress={() => setSelectedImage(img.url || img.activity?.cloudinaryUrl)}
                    style={{ width: (width - 110) / 3, margin: 4 }}
                    className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border/40"
                  >
                    <Image 
                      source={{ uri: img.url || img.activity?.cloudinaryUrl }} 
                      className="w-full h-full"
                    />
                    <View className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/60">
                      <Typography className="text-[7px] font-black text-white uppercase">
                        {format(getDate(img.timestamp), 'HH:mm')}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="w-full py-4 items-center justify-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                  <View className="flex-row items-center space-x-2">
                    <ImageIcon size={14} className="text-muted-foreground/30" />
                    <Typography variant="small" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      No visual logs for this segment
                    </Typography>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        ))}
      </View>

      <View className="mt-10 items-center">
        <TouchableOpacity 
          onPress={onLoadMore}
          className="flex-row items-center px-10 py-4 rounded-2xl border-2 border-border bg-card active:scale-95"
        >
          <Typography className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-2">
            Load More Clusters
          </Typography>
          <ChevronDown size={16} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>

      {/* Image Zoom Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setSelectedImage(null)}
            activeOpacity={1}
          >
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          </TouchableOpacity>
          
          <Animated.View entering={ScaleInCenter} className="w-full aspect-video p-4">
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                className="w-full h-full rounded-2xl"
                resizeMode="contain"
              />
            )}
            <TouchableOpacity 
              onPress={() => setSelectedImage(null)}
              className="absolute top-8 right-8 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
