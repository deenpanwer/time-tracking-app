import React from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Users, Clock, Activity, Globe, Target, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MetricBox } from './MetricBox';
import { Skeleton } from '@/components/ui/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';

interface OwnerCockpitProps {
  orgName?: string;
  ownerData?: any;
  stats?: any;
  logoUrl?: string | null;
  isLoading?: boolean;
}

export function OwnerCockpit({ 
  orgName = "TRAC STUDIO", 
  ownerData, 
  stats, 
  logoUrl,
  isLoading 
}: OwnerCockpitProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isOrgActive = (stats?.activeEmployees || 0) > 0;

  const getDate = (ts: any) => {
    if (!ts) return new Date();
    if (ts.toDate) return ts.toDate();
    if (ts instanceof Date) return ts;
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  const memberSince = ownerData?.createdAt ? format(getDate(ownerData.createdAt), 'MMMM dd, yyyy') : 'Loading...';
  const primaryApp = stats?.topApps?.[0]?.name || "Analytics";

  const renderIdentity = () => {
    if (isLoading) {
      return (
        <View className="flex-row items-center space-x-6 mb-8">
          <Skeleton className="w-24 h-24 rounded-[2rem]" />
          <View className="flex-1 space-y-3">
            <Skeleton className="w-32 h-4 rounded-full" />
            <Skeleton className="w-48 h-10 rounded-lg" />
            <Skeleton className="w-32 h-4 rounded-full" />
          </View>
        </View>
      );
    }

    return (
      <View className="flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8 mb-10">
        <TouchableOpacity 
          onPress={() => router.push('/profile')}
          className="relative"
        >
          {/* Glow Effect */}
          <View 
            className={`absolute -inset-2 rounded-[3rem] blur-xl opacity-20 ${isOrgActive ? 'bg-emerald-500' : 'bg-primary'}`} 
          />
          <View className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] items-center justify-center border-2 border-white/20 overflow-hidden shadow-2xl">
            <LinearGradient
              colors={['#8b5cf6', '#4f46e5']} 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {logoUrl || ownerData?.photoUrl ? (
              <Image 
                source={logoUrl || ownerData?.photoUrl} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <View className="w-full h-full bg-secondary items-center justify-center">
                <Typography className="text-primary font-black text-2xl">
                  {orgName.charAt(0)}
                </Typography>
              </View>
            )}
          </View>
          <View className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-card ${isOrgActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center space-x-2 mb-3">
            <View className={`w-2 h-2 rounded-full ${isOrgActive ? 'bg-emerald-500' : 'bg-primary'}`} />
            <Typography variant="small" className="text-[9px] font-black text-primary uppercase tracking-widest">
              {isOrgActive ? `Live: ${stats.activeEmployees} Personnel Active` : 'Organization Standby'}
            </Typography>
          </View>

          <View>
            {orgName.split(' ').map((word, i) => (
              <Typography 
                key={i} 
                variant="h1" 
                className={`text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none ${i !== 0 ? 'text-primary' : ''}`}
              >
                {word}
              </Typography>
            ))}
          </View>

          <View className="mt-4">
            <Typography variant="small" className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
              Account Authority
            </Typography>
            <Typography className="text-sm font-black mt-0.5">
              {ownerData?.role || "Founder"}: {ownerData?.name || "System Admin"}
            </Typography>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Animated.View entering={FadeInUp.duration(600)}>
      <Card variant="glass" className="mb-8 p-6 md:p-10 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <View 
          className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[60px]"
          pointerEvents="none"
        />

        {renderIdentity()}

        {/* Metrics Grid */}
        <View className="flex-row flex-wrap -m-1.5">
          {[
            { icon: Users, label: "Workforce Total", value: stats?.totalStaff || 0, subValue: "Registered Staff" },
            { icon: Clock, label: "Daily Output", value: `${stats?.totalHoursToday || 0}h`, subValue: `${stats?.totalOrgHours || 0}h Org Total` },
            { icon: Activity, label: "Live Operations", value: stats?.activeEmployees || 0, subValue: "On-Shift Now" },
            { icon: Target, label: "Daily Top App", value: primaryApp, subValue: "Most Used Today" },
            { icon: Globe, label: "Principal Region", value: ownerData?.lastLoginLocation?.city || "Remote", subValue: ownerData?.lastLoginLocation?.country || "Global" },
            { icon: Calendar, label: "Member Since", value: memberSince, subValue: "Original Commission" },
          ].map((item, index) => (
            <View 
              key={index} 
              style={{ width: width > 600 ? '33.33%' : '50%', padding: 6 }}
            >
              <MetricBox 
                {...item} 
                isLoading={isLoading} 
              />
            </View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}
