import React, { useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import { View, TouchableOpacity, Dimensions, useColorScheme, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { ChevronLeft, LogOut, Settings, User, SquarePen, Clock, Briefcase, MoreVertical, Trash2, Check, X, UserPlus, LayoutDashboard, Users } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAuthStore } from '@/stores/use-auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { fetchHistory, SearchRecord } from '@/lib/supabase';
import { useUIStore } from '@/stores/use-ui-store';
import { useTeam } from '@/providers/TeamProvider';

import { GlowFeedback } from '@/components/ui/GlowFeedback';
import { InviteModal } from '../dashboard/InviteModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.9;
const EDGE_THRESHOLD = 50;

export interface ChatSidebarRef {
  open: () => void;
  close: () => void;
}

interface ChatSidebarProps {
  children: React.ReactNode;
}

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(({ children }, ref) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const startX = useSharedValue(0);
  const isOpening = useSharedValue(false);
  const { user, logout } = useAuthStore();
  const { employees, owner, orgData } = useTeam();
  const { setCurrentParentId, setActiveSearchId, activeSearchId: activeStoreId } = useUIStore();

  const [history, setHistory] = useState<Array<{ id: string; title: string }>>([]);
  const [hired, setHired] = useState<Array<{ id: string; title: string }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  React.useEffect(() => {
    if (user?.email) {
      fetchHistory(user.email).then((data) => {
        const rootSearches = data.filter(s => !s.parent_id);
        const mapped = rootSearches.map(s => ({
          id: s.id,
          title: s.custom_title || s.original_query
        }));
        setHistory(mapped);
      });
    }
  }, [user?.email]);

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
    setMenuId(null);
  };

  const saveRename = () => {
    if (!editingId) return;
    const updateList = (list: any[]) => list.map(item => item.id === editingId ? { ...item, title: editValue } : item);
    setHistory(updateList(history));
    setHired(updateList(hired));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    setHired(hired.filter(item => item.id !== id));
    if (activeStoreId === id) setActiveSearchId(null);
    setMenuId(null);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const open = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, { 
      damping: 20, 
      stiffness: 120, 
      mass: 0.8,
      overshootClamping: true,
    });
  }, []);

  const close = useCallback(() => {
    'worklet';
    translateX.value = withSpring(-SIDEBAR_WIDTH, { 
      damping: 25, 
      stiffness: 120,
      mass: 1,
      overshootClamping: true,
    });
  }, []);

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart((event) => {
      startX.value = translateX.value;
      if (translateX.value === -SIDEBAR_WIDTH && event.x <= EDGE_THRESHOLD) {
        isOpening.value = true;
      } else if (translateX.value === 0) {
        isOpening.value = true;
      } else {
        isOpening.value = false;
      }
    })
    .onUpdate((event) => {
      if (!isOpening.value) return;
      translateX.value = Math.min(0, Math.max(-SIDEBAR_WIDTH, startX.value + event.translationX));
    })
    .onEnd((event) => {
      if (!isOpening.value) return;
      
      const shouldOpen = event.velocityX > 500 || (translateX.value > -SIDEBAR_WIDTH / 2 && event.velocityX > -500);
      
      if (shouldOpen) {
        open();
      } else {
        close();
      }
    });

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const mainTranslateX = interpolate(
      translateX.value,
      [-SIDEBAR_WIDTH, 0],
      [0, SIDEBAR_WIDTH], 
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      translateX.value,
      [-SIDEBAR_WIDTH, 0],
      [1, 0.4],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: mainTranslateX }],
      opacity,
    };
  });

  const avatarSeed = user?.email || 'anonymous';
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${encodeURIComponent(avatarSeed)}`;

  return (
    <GestureDetector gesture={panGesture}>
      <View className="flex-1 bg-background overflow-hidden">
        {/* Main Content */}
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          {children}
          
          <Animated.View 
            style={useAnimatedStyle(() => ({
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? 'white' : 'black',
              opacity: interpolate(translateX.value, [-SIDEBAR_WIDTH, 0], [0, isDark ? 0.08 : 0.2], Extrapolate.CLAMP),
              pointerEvents: translateX.value > -SIDEBAR_WIDTH ? 'auto' : 'none',
            }))}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={{ flex: 1 }} 
              onPress={() => close()} 
            />
          </Animated.View>
        </Animated.View>

        {/* Sidebar Panel */}
        <Animated.View 
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: SIDEBAR_WIDTH,
              zIndex: 100,
            },
            sidebarAnimatedStyle
          ]}
          className="bg-background border-r border-border/40 shadow-2xl"
        >
          <View 
            className="flex-1 pt-12 px-6 justify-between"
            style={{ paddingBottom: Math.max(insets.bottom, 20) + 10 }}
          >
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              <View className="flex-row items-center justify-between mb-8 px-2">
                <Typography className="font-poppins text-2xl">trac ADMIN</Typography>
                <TouchableOpacity 
                  onPress={() => close()}
                  className="w-8 h-8 items-center justify-center"
                >
                  <ChevronLeft size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
              </View>

              {/* EMS Admin Navigation */}
              <View className="space-y-6 mt-4">
                {/* Invite Staff Member */}
                <View>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowInviteModal(true);
                    }}
                    className="flex-row items-center h-14 px-4 rounded-2xl bg-secondary/30 border border-border/40 active:bg-secondary/50"
                  >
                    <UserPlus size={20} color={isDark ? "#fff" : "#000"} />
                    <Typography className="ml-3 font-montserrat-bold text-[15px]">Invite Staff Member</Typography>
                  </TouchableOpacity>

                  <InviteModal 
                    visible={showInviteModal} 
                    onClose={() => setShowInviteModal(false)} 
                    inviteCode={orgData?.inviteCode || owner?.inviteCode || "------"} 
                  />
                </View>

                {/* Overview Tab */}
                <View className="space-y-2">
                  <Typography variant="small" className="px-4 mb-2 text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">System Control</Typography>
                  <TouchableOpacity 
                    onPress={() => {
                      router.push('/main');
                      close();
                    }}
                    className={cn(
                      "flex-row items-center h-14 px-4 rounded-2xl active:bg-secondary/50",
                      "bg-primary"
                    )}
                  >
                    <LayoutDashboard size={20} color="#fff" />
                    <Typography className="ml-3 font-montserrat-bold text-[15px] text-white">Overview</Typography>
                  </TouchableOpacity>
                </View>
                
                {/* Team Section (EMS Focus) */}
                <View className="mt-2">
                  <View className="flex-row items-center h-10 px-4 rounded-xl mb-2">
                    <Users size={16} color="#a855f7" />
                    <Typography className="ml-3 text-purple-500/80 font-poppins text-[10px] uppercase tracking-[1.5px]">Staff Members</Typography>
                  </View>
                  
                  <View className="relative pl-8">
                    <View className="absolute left-[24px] top-0 bottom-0 w-[1.5px] bg-purple-500/10 rounded-full" />
                    
                    {/* Real Team List from useTeam */}
                    <View className="space-y-1">
                      {employees.length === 0 ? (
                        <Typography variant="small" className="px-4 py-2 text-[10px] text-muted-foreground italic">No active personnel</Typography>
                      ) : (
                        employees.map((emp) => (
                          <TouchableOpacity 
                            key={emp.id}
                            onPress={() => {
                              router.push(`/dashboard/team/${emp.id}`);
                              close();
                            }}
                            className="flex-row items-center py-3.5 px-4 rounded-xl border border-transparent active:bg-purple-500/5"
                          >
                            <View className="size-1.5 rounded-full bg-purple-500/40 mr-4" />
                            <Typography className="text-[14px] font-montserrat font-bold text-muted-foreground active:text-purple-500">
                              {emp.name}
                            </Typography>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom User Section */}
            <View className="pt-6 border-t border-border/50">
              <GlowFeedback 
                onPress={() => router.push('/profile')}
                className="w-full"
              >
                <View className="flex-row items-center bg-secondary/20 p-4 rounded-2xl">
                  <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center overflow-hidden border border-border/50">
                    <Image 
                      source={avatarUrl} 
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Typography className="font-montserrat-bold text-[15px]">
                      {owner?.name || user?.name || 'Anonymous'}
                    </Typography>
                    <Typography className="text-muted-foreground text-xs" numberOfLines={1}>
                      {owner?.email || user?.email || 'Guest User'}
                    </Typography>
                  </View>
                  <TouchableOpacity className="p-2" onPress={() => router.push('/profile')}>
                    <Settings size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                  </TouchableOpacity>
                </View>
              </GlowFeedback>
            </View>
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
});
