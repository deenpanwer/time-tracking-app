import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { 
  LogOut, Moon, Sun, Building2, Ticket, 
  Check, Copy, ArrowLeft, ShieldAlert 
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/use-auth-store';
import { useColorScheme } from 'nativewind';
import { Colors, Palette } from '@/constants/theme';
import { auth, firestore } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';
import * as Clipboard from 'expo-clipboard';
import { useTeam } from '@/providers/TeamProvider';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { signOut } from '@react-native-firebase/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userData, logout } = useAuthStore();
  const { orgData, loading: teamLoading } = useTeam();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const avatarSeed = user?.email || 'anonymous';
  // Keeping SVG as requested, using PNG as fallback if needed but UI shows SVG
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert("Logout failed", error.message);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmDeleteOrg = () => {
    Alert.alert(
      "Are you absolutely sure?",
      "This action will archive your organization's data. You will be logged out and will need to create a new organization to continue. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDeleteOrganization }
      ]
    );
  };

  const handleDeleteOrganization = async () => {
    if (!user?.id || !userData?.ownedOrgId) {
      Alert.alert("Error", "No organization to delete.");
      return;
    }

    setDeleting(true);
    try {
      const orgRef = doc(firestore, "organizations", userData.ownedOrgId);
      const userRef = doc(firestore, "users", user.id);

      // Soft delete the organization
      await updateDoc(orgRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      // Update the owner's user document
      await updateDoc(userRef, {
        ownedOrgId: null,
        orgId: null,
        onboardingCompleted: false,
        orgDeleted: true,
      });

      // Clear the session and redirect
      await signOut(auth);
      logout();
      router.replace('/signup');
    } catch (error: any) {
      Alert.alert("Deletion Failed", error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 justify-between border-b border-border/50 bg-card/50">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center bg-secondary/50 rounded-xl mr-4"
          >
            <ArrowLeft size={20} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Typography variant="h3" className="font-black uppercase tracking-tighter">Account Settings</Typography>
        </View>
        
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity 
            onPress={() => setColorScheme(isDark ? 'light' : 'dark')}
            className="w-10 h-10 items-center justify-center"
          >
            {isDark ? <Sun size={20} color="#fff" /> : <Moon size={20} color="#000" />}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20 flex-row items-center"
          >
            <LogOut size={14} color="#ef4444" />
            <Typography className="ml-2 text-destructive font-black uppercase text-[10px]">Logout</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-8"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-3xl mx-auto w-full">
          
          {/* Profile Section */}
          <Animated.View entering={FadeInUp.duration(600)} className="mb-5">
            <Card
              variant="glass"
              className="p-8 shadow-sm"
              style={
                !isDark
                  ? { backgroundColor: '#ffffff', borderColor: Palette.zinc[200] }
                  : { backgroundColor: Colors.dark.card, borderColor: Colors.dark.border }
              }
            >
              <View className="flex-row items-center mb-8">
                <View className="size-16 rounded-2xl overflow-hidden border border-border bg-secondary shadow-inner">
                  <Image
                    source={avatarUrl}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
                <View className="ml-4">
                  <Typography variant="h3" className="text-lg font-black uppercase tracking-tighter">
                    {userData?.name || "Your Profile"}
                  </Typography>
                  <Typography variant="small" className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    Personal account details
                  </Typography>
                </View>
              </View>

              <View className="space-y-6">
                <View>
                  <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2">Email Address</Typography>
                  <View className="bg-secondary/50 h-12 rounded-xl justify-center px-4 border border-border/20">
                    <Typography className="font-bold text-muted-foreground">{user?.email || ""}</Typography>
                  </View>
                </View>
                <View>
                  <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2">Account Role</Typography>
                  <View className="bg-secondary/50 h-12 rounded-xl justify-center px-4 border border-border/20">
                    <Typography className="font-bold text-muted-foreground">{userData?.role || "Organization Owner"}</Typography>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Organization Section */}
          <Animated.View entering={FadeInUp.duration(600).delay(100)} className="mb-5">
            <Card
              variant="glass"
              className="p-8 shadow-sm"
              style={
                !isDark
                  ? { backgroundColor: '#ffffff', borderColor: Palette.zinc[200] }
                  : { backgroundColor: Colors.dark.card, borderColor: Colors.dark.border }
              }
            >
              <View className="flex-row items-center mb-8">
                <View className="size-12 bg-purple-500/10 rounded-2xl items-center justify-center border border-purple-500/20">
                  <Building2 size={24} color={Palette.trac.purple} />
                </View>
                <View className="ml-3">
                  <Typography variant="h3" className="text-lg font-black uppercase tracking-tighter">Organization</Typography>
                  <Typography variant="small" className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Company & Team management</Typography>
                </View>
              </View>
              
              <View className="space-y-6">
                <View>
                  <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest ml-1 mb-2">Organization Name</Typography>
                  <View className="bg-secondary/30 h-12 rounded-xl justify-center px-4 border border-border/20">
                    <Typography className="font-bold">{userData?.orgName || orgData?.name || ""}</Typography>
                  </View>
                </View>

                <View className="p-6 rounded-2xl bg-secondary/30 border-2 border-dashed border-border/50">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="size-10 bg-background rounded-xl items-center justify-center border border-border shadow-sm">
                        <Ticket size={20} color={Palette.trac.purple} />
                      </View>
                      <View className="ml-3">
                        <Typography variant="small" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team Invite Code</Typography>
                        <Typography className="text-xl font-black tracking-[0.2em]">{orgData?.inviteCode || "------"}</Typography>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(orgData?.inviteCode || "")}
                      className="bg-primary/10 px-3 py-2 rounded-xl border border-primary/20"
                    >
                      <View className="flex-row items-center">
                        {copied ? <Check size={14} color={Palette.trac.purple} className="mr-2" /> : <Copy size={14} color={Palette.trac.purple} className="mr-2" />}
                        <Typography className="text-primary font-black uppercase tracking-widest text-[10px]">{copied ? "Copied" : "Copy"}</Typography>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <Typography variant="small" className="mt-6 text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                    Share this code with employees to link their profile to your organization.
                  </Typography>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            <View className="p-8 border-2 border-destructive/10 rounded-3xl bg-destructive/5">
              <View className="flex-row items-center mb-6">
                <ShieldAlert size={16} color="#ef4444" style={{ marginRight: 8 }} />
                <Typography variant="h3" className="text-sm font-black uppercase tracking-widest text-destructive">Danger Zone</Typography>
              </View>
              <Typography variant="small" className="text-xs font-medium text-muted-foreground mb-8">Permanently delete your organization and all associated employee data.</Typography>
              
              <TouchableOpacity 
                onPress={confirmDeleteOrg}
                disabled={deleting}
                className="bg-destructive h-12 items-center justify-center rounded-xl active:scale-95 disabled:opacity-50 shadow-lg shadow-destructive/20"
              >
                <Typography className="text-white font-black uppercase tracking-widest text-[10px]">
                  {deleting ? "Deleting..." : "Delete Organization"}
                </Typography>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}