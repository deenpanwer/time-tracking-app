import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { ChevronLeft, Bell, Shield, CircleHelp, LogOut, Moon, Sun } from 'lucide-react-native';
import { useAuthStore } from '@/stores/use-auth-store';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const avatarSeed = user?.email || 'anonymous';
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 justify-between border-b border-border/50">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
          <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Typography variant="h3" className="font-poppins">Profile</Typography>
        <View className="w-10" />
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-8"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/10">
            <Image 
              source={avatarUrl} 
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
          <Typography variant="h2" className="mt-4 font-poppins text-2xl">{user?.name || 'Anonymous'}</Typography>
          <Typography className="text-muted-foreground font-montserrat">{user?.email || 'founder@trac.ai'}</Typography>
        </View>

        {/* Settings Groups */}
        <View className="space-y-6">
          <SettingsSection title="Preferences">
            <SettingsItem 
              icon={<Moon size={20} color={isDark ? "#94a3b8" : "#64748b"} />} 
              label="Dark Mode" 
              right={<Switch 
                value={isDark} 
                onValueChange={() => setColorScheme(isDark ? 'light' : 'dark')}
                trackColor={{ false: '#767577', true: '#8b5cf6' }}
              />}
            />
            <SettingsItem icon={<Bell size={20} color={isDark ? "#94a3b8" : "#64748b"} />} label="Notifications" />
          </SettingsSection>

          <SettingsSection title="Security & Help">
            <SettingsItem icon={<Shield size={20} color={isDark ? "#94a3b8" : "#64748b"} />} label="Privacy & Security" />
            <SettingsItem icon={<CircleHelp size={20} color={isDark ? "#94a3b8" : "#64748b"} />} label="Help Center" />
          </SettingsSection>

          <View className="mt-10 mb-20">
            <TouchableOpacity 
              onPress={handleLogout}
              className="flex-row items-center justify-center bg-destructive/10 py-4 rounded-2xl border border-destructive/20"
            >
              <LogOut size={20} color="#ef4444" />
              <Typography className="ml-2 text-destructive font-montserrat-bold">Log out</Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Typography variant="small" className="ml-2 mb-3 text-muted-foreground uppercase tracking-widest text-[10px] font-montserrat-bold">
        {title}
      </Typography>
      <View className="bg-secondary/20 rounded-3xl overflow-hidden border border-border/40">
        {children}
      </View>
    </View>
  );
}

function SettingsItem({ icon, label, right }: { icon: React.ReactNode, label: string, right?: React.ReactNode }) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between px-5 py-4 border-b border-border/20 last:border-b-0">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-secondary/40 items-center justify-center mr-4">
          {icon}
        </View>
        <Typography className="font-montserrat-bold text-[15px]">{label}</Typography>
      </View>
      {right ? right : <ChevronLeft size={18} color="#94a3b8" style={{ transform: [{ rotate: '180deg' }] }} />}
    </TouchableOpacity>
  );
}
