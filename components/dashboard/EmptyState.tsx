import React from 'react';
import { View, TouchableOpacity, Share, Linking, useColorScheme, useWindowDimensions, StyleSheet } from 'react-native';
import { UserPlus, Copy, Check, Share2, ExternalLink } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { MonitoringDashboard } from './MonitoringDashboard';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Palette } from '@/constants/theme';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  orgName: string;
  inviteCode: string;
}

export function EmptyState({ orgName, inviteCode }: EmptyStateProps) {
  const [copied, setCopied] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const dummyEmployees = [
    { id: '1', name: "Sarah Chen", role: "Senior Engineer", email: "sarah@trac.ai" },
    { id: '2', name: "Mike Ross", role: "Product Designer", email: "mike@trac.ai" },
    { id: '3', name: "Jessica Lee", role: "DevOps Lead", email: "jess@trac.ai" }
  ];

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Connect to ${orgName} on Trac EMS using code: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openDownloadPage = () => {
    Linking.openURL('https://www.traconomics.com/trac-diary');
  };

  return (
    <View className="flex-1 pb-32">
      {/* Increased vertical spacing between major sections */}
      <Animated.View entering={FadeInDown.duration(1000)} className="space-y-20 md:space-y-32">
        {/* Invite Hero Section */}
        <Card 
          variant="glass" 
          className="p-8 md:p-16 border-2 border-primary/20 rounded-[3rem] md:rounded-[3.5rem] relative overflow-hidden shadow-xl md:shadow-2xl"
          style={!isDark ? { backgroundColor: '#ffffff', borderColor: Palette.zinc[200] } : undefined}
        >
          <View 
            className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-primary/5 rounded-full blur-[60px] md:blur-[100px]" 
            style={{ transform: [{ translateX: 100 }, { translateY: -100 }] }}
            pointerEvents="none" 
          />
          
          <View className="items-center text-center space-y-12 md:space-y-16">
            <View className="size-20 md:size-24 bg-primary/10 rounded-3xl md:rounded-[3rem] items-center justify-center border border-primary/20 shadow-inner rotate-3">
              <UserPlus size={isSmallScreen ? 36 : 48} className="text-primary" />
            </View>
            
            <View className="space-y-6 items-center">
              <Typography variant="h1" className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none text-center">
                Deploy Your Workforce
              </Typography>
              <Typography className="text-muted-foreground font-medium text-base md:text-xl uppercase tracking-tight text-center max-w-2xl px-2">
                Link your first employee to <Typography className="text-foreground font-bold">{orgName}</Typography> to unlock the dashboard below.
              </Typography>
            </View>

            {/* Steps Grid */}
            <View className="flex-col md:flex-row gap-8 w-full max-w-5xl">
              <View 
                className="flex-1 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-border/50 space-y-6 md:space-y-8"
                style={!isDark ? { backgroundColor: Palette.zinc[50] } : { backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <View className="size-12 md:size-14 bg-card rounded-2xl md:rounded-3xl items-center justify-center border shadow-sm">
                  <Typography className="font-black text-primary text-lg md:text-xl">1</Typography>
                </View>
                <View className="space-y-3">
                  <Typography variant="small" className="font-black uppercase tracking-widest text-[11px] md:text-[12px]">Provision Software</Typography>
                  <Typography variant="small" className="text-[11px] md:text-[12px] text-muted-foreground font-medium leading-relaxed uppercase">
                    Direct your candidates to download the Trac EMS desktop client.
                  </Typography>
                </View>
                <TouchableOpacity 
                  onPress={openDownloadPage}
                  className="flex-row items-center mt-4 border-b border-primary/30 self-start pb-1"
                >
                  <Typography className="text-[11px] font-black text-primary uppercase">View Download Page</Typography>
                  <ExternalLink size={12} className="text-primary ml-2" />
                </TouchableOpacity>
              </View>

              <View 
                className="flex-1 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-border/50 space-y-6 md:space-y-8"
                style={!isDark ? { backgroundColor: Palette.zinc[50] } : { backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <View className="size-12 md:size-14 bg-card rounded-2xl md:rounded-3xl items-center justify-center border shadow-sm">
                  <Typography className="font-black text-primary text-lg md:text-xl">2</Typography>
                </View>
                <View className="space-y-3">
                  <Typography variant="small" className="font-black uppercase tracking-widest text-[11px] md:text-[12px]">Establish Handshake</Typography>
                  <Typography variant="small" className="text-[11px] md:text-[12px] text-muted-foreground font-medium leading-relaxed uppercase">
                    Employee enters your unique Organization Code into their profile.
                  </Typography>
                </View>
                <View className="flex-row items-center space-x-2 mt-4">
                  <Check size={16} className="text-emerald-500" />
                  <Typography className="text-[11px] font-black text-emerald-500 uppercase">Syncs Instantly</Typography>
                </View>
              </View>
            </View>

            {/* Code Container */}
            <View 
              className="w-full max-w-2xl bg-card border border-border rounded-[3rem] md:rounded-[3.5rem] p-10 md:p-16 shadow-lg md:shadow-xl space-y-10 md:space-y-12"
              style={!isDark ? { backgroundColor: '#ffffff', borderColor: Palette.zinc[200] } : undefined}
            >
              <View className="items-center">
                <Typography 
                  variant="small" 
                  className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8"
                  style={!isDark ? { color: Palette.zinc[600] } : { color: Palette.zinc[400] }}
                >
                  Unique Invite Code
                </Typography>
                <Typography 
                  className="text-5xl md:text-8xl font-black text-foreground mb-10 md:mb-16 text-center"
                  style={{ letterSpacing: isSmallScreen ? 8 : 16 }}
                >
                  {inviteCode || "------"}
                </Typography>
                <View className="flex-row gap-6 md:gap-8 w-full px-4">
                  <TouchableOpacity 
                    onPress={handleCopy}
                    className="flex-1 h-16 bg-primary rounded-[1.5rem] flex-row items-center justify-center space-x-3 shadow-lg shadow-primary/20"
                  >
                    {copied ? <Check size={20} color="white" /> : <Copy size={20} color="white" />}
                    <Typography className="text-white font-black uppercase tracking-widest text-xs md:text-sm">{copied ? "Copied" : "Copy Code"}</Typography>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleShare}
                    className="flex-1 h-16 border border-border rounded-[1.5rem] flex-row items-center justify-center space-x-3"
                    style={!isDark ? { backgroundColor: Palette.zinc[100], borderColor: Palette.zinc[200] } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <Share2 size={20} color={isDark ? "#ffffff" : Palette.zinc[900]} />
                    <Typography className="text-foreground font-black uppercase tracking-widest text-xs md:text-sm">Share</Typography>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Blurred Preview Section */}
        <View className="mt-12 md:mt-24 rounded-[3.5rem] overflow-hidden border border-border/20">
          {/* The Dashboard Preview */}
          <View style={{ opacity: 0.6, transform: [{ scale: 0.98 }] }}>
            <MonitoringDashboard employees={dummyEmployees} isOfflinePreview={true} />
          </View>

          {/* High-Intensity Blur Layer */}
          <BlurView 
            intensity={isDark ? 80 : 100} 
            tint={isDark ? "dark" : "light"} 
            style={StyleSheet.absoluteFill} 
          />

          {/* Sharp Pill (Centered on top) */}
          <View className="absolute inset-0 z-20 items-center justify-center">
            <View 
              className={cn(
                "px-8 md:px-12 py-5 md:py-6 rounded-full border flex-row items-center space-x-4 md:space-x-6 shadow-2xl",
                isDark ? "bg-black/60 border-white/20" : "bg-white/90 border-zinc-300"
              )}
            >
              <View className="size-4 md:size-5 bg-yellow-500 rounded-full shadow-sm shadow-yellow-500/50" />
              <Typography 
                variant="small" 
                className={cn(
                  "text-base md:text-lg font-black uppercase tracking-widest",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Waiting for connection...
              </Typography>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
