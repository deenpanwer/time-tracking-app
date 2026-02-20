import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, TouchableOpacity, Image, StyleSheet, Modal, FlatList, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight, CheckCircle2, Loader2, Upload, Image as ImageIcon, Link as LinkIcon, Plus, MapPin, Phone, Pencil } from "lucide-react-native";
import { auth, firestore } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, setDoc, getDoc } from "@react-native-firebase/firestore";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import { useAuthStore } from "@/stores/use-auth-store"; // Using existing auth store
import { Button } from "@/components/ui/Button";
import { AuthInput } from "@/components/auth/AuthInput"; // Using AuthInput for text inputs
import { Typography } from "@/components/ui/Typography"; // Using Typography for text elements
import { SearchInput } from '@/components/ui/SearchInput';
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils"; // Assuming cn is a utility for NativeWind
import * as ImagePicker from 'expo-image-picker'; // For image upload
import 'react-native-get-random-values'; // Needed for UUID generation in some packages, e.g. for generating org IDs
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import PhoneInput from "react-native-phone-number-input";

const TEAM_SIZES = [
  { id: "1", label: "1 (Just me)" },
  { id: "2-10", label: "2 - 10" },
  { id: "11-50", label: "11 - 50" },
  { id: "51-200", label: "51 - 200" },
  { id: "201-500", label: "201 - 500" },
  { id: "501+", label: "501+" },
];

const SHIFTS = [
  { id: "4", label: "4h", seconds: 14400 },
  { id: "6", label: "6h", seconds: 21600 },
  { id: "8", label: "8h", seconds: 28800 },
  { id: "9", label: "9h", seconds: 32400 },
  { id: "10", label: "10h", seconds: 36000 },
];

const DAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 0, label: "Sun" },
];



export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // isDragging not needed for RN
  
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { setLoading: setAuthStoreLoading, setUserData: setAuthStoreUserData } = useAuthStore(); // Using AuthStore functions
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // fileInputRef not needed for RN, use ImagePicker directly
  // useRef is not needed for fileInputRef

  const [formData, setFormData] = useState({
    role: "",
    orgName: "",
    teamSize: "",
    logoUrl: "",
    motivation: "",
    whatsapp: "",
    shift: "8",
    workdays: [1, 2, 3, 4, 5], // User selects workdays
    timezone: "UTC"
  });

  // Mock refreshUserData
  const refreshUserData = async () => {
    if (user) {
      setAuthStoreLoading(true);
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        setAuthStoreUserData(userDoc.data());
      }
      setAuthStoreLoading(false);
    }
  };

  useEffect(() => {
    // Wait until the root navigation state is loaded to prevent navigation context errors
    if (!rootNavigationState || !rootNavigationState.routes || rootNavigationState.routes.length === 0) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
        const userData = userDoc.data();
        if (userData?.onboardingCompleted) {
          router.replace("/main"); // Use replace to prevent going back to onboarding
          return;
        }
        
        if (userData?.ownedOrgId) {
            const orgDoc = await getDoc(doc(firestore, "organizations", userData.ownedOrgId));
            const data = orgDoc.data();
            setOrgData({ id: userData.ownedOrgId, ...data });
            if (data?.name) {
              setFormData(prev => ({ ...prev, orgName: data.name }));
            }
        }
        setAuthLoading(false);
      } else {
        router.replace("/login"); // Redirect to login if no user
      }
    });
    return () => unsubscribe();
  }, [rootNavigationState]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      setLogoPreview(uri); // Use URI for display
      setFormData({ ...formData, logoUrl: `data:image/jpeg;base64,${base64}` }); // Store base64 for submission
    }
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let finalOrgId = orgData?.id;
      const offDays = DAYS.filter(d => !formData.workdays.includes(d.id)).map(d => d.label);

      if (!finalOrgId) {
        finalOrgId = uuidv4(); // Generate UUID for new org
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 14);

        await setDoc(doc(firestore, "organizations", finalOrgId), {
          name: formData.orgName || "My Organization",
          ownerId: user.uid,
          logoUrl: formData.logoUrl || null,
          teamSize: formData.teamSize,
          whatsapp: formData.whatsapp,
          motivation: formData.motivation,
          inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
          subscriptionExpiry: trialExpiry,
          subscriptionStatus: "trialing",
          createdAt: serverTimestamp()
        });
      } else {
        await updateDoc(doc(firestore, "organizations", finalOrgId), {
          name: formData.orgName,
          logoUrl: formData.logoUrl || null,
          teamSize: formData.teamSize,
          whatsapp: formData.whatsapp,
          motivation: formData.motivation,
          updatedAt: serverTimestamp()
        });
      }

      await updateDoc(doc(firestore, "users", user.uid), { // Use updateDoc as user already exists
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || "User",
        photoUrl: user.photoURL || null,
        role: formData.role,
        orgName: formData.orgName,
        ownedOrgId: finalOrgId,
        onboardingCompleted: true,
        whatsapp: formData.whatsapp,
        settings: {
          defaultShiftSeconds: SHIFTS.find(s => s.id === formData.shift)?.seconds || 28800,
          offDays: offDays,
          timezone: formData.timezone
        },
        updatedAt: serverTimestamp()
      });

      await refreshUserData();
      Alert.alert("Configuration complete", "Welcome to your new workspace.");
      router.replace("/main");
    } catch (error: any) {
      Alert.alert("Setup failed", error.message);
      console.error("Onboarding setup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
        <View className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <View className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16, // Equivalent to p-4
            paddingBottom: 32, // Equivalent to pb-8
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-2xl">
                    <View className="bg-secondary/30 border border-border/50 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm relative">            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <View 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      step === i ? "w-8 bg-primary" : "w-4 bg-secondary"
                    )} 
                  />
                ))}
              </View>
              <Typography className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Step {step} of 4
              </Typography>
            </View>

            {/* Step 1 */}
            {step === 1 && (
              <View
                key="step1"
                className="space-y-16"
              >
                <View className="mb-8">
                  <Typography variant="h1" className="text-3xl font-bold tracking-tight mb-2">Welcome</Typography>
                  <Typography className="text-muted-foreground">Let's start with your basic details.</Typography>
                </View>

                <View className="space-y-16">
                  <View className="space-y-4">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 pb-1">Organization Name</Typography>
                    <AuthInput
                      placeholder="e.g. Acme Corp"
                      value={formData.orgName}
                      onChangeText={(text) => setFormData({ ...formData, orgName: text })}
                      containerClassName="h-14 rounded-2xl px-2 bg-background/50"
                    />
                  </View>

                  <View className="space-y-4">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 pb-1">Your Role</Typography>
                    <View className="flex-row flex-wrap justify-between gap-3">
                      {["Founder", "Manager", "Ops", "HR"].map((r) => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setFormData({ ...formData, role: r })}
                          style={{
                            flexBasis: '48%',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 24, // Assuming rounded-2xl
                            borderWidth: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: formData.role === r ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#334155' : '#e2e8f0'), // Dynamic border color
                            backgroundColor: formData.role === r ? (isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)') : (isDark ? '#1E293B' : '#F1F5F9'), // Dynamic background
                          }}
                        >
                          <Typography style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            color: formData.role === r ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#94A3B8' : '#64748B'), // Dynamic text color
                          }}>
                            {r}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="space-y-5 mb-8">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 py-2 flex-row items-center">
                      <Phone size={14} className="text-primary mr-2" /> WhatsApp Number
                    </Typography>
                    <PhoneInput
                      defaultCode="PK"
                      layout="first"
                      onChangeFormattedText={(text) => {
                        setFormData({ ...formData, whatsapp: text });
                      }}
                      containerStyle={{
                        width: '100%',
                        height: 60,
                        borderRadius: 16,
                        backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                        borderWidth: 1,
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        flexDirection: 'row', // Ensure content is laid out in a row
                        alignItems: 'center', // Center vertically
                      }}
                      textContainerStyle={{
                        backgroundColor: 'transparent',
                        paddingVertical: 0,
                        flexGrow: 1, // Allow text input to grow
                      }}
                      textInputStyle={{
                        color: isDark ? '#FFFFFF' : '#000000',
                        fontSize: 16,
                      }}
                      codeTextStyle={{
                        color: isDark ? '#FFFFFF' : '#000000',
                        fontSize: 16,
                      }}

                      countryPickerProps={{
                        withFlag: true, // Explicitly ensure flag is rendered
                        theme: { // Customize theme of the modal
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          onBackgroundTextColor: isDark ? '#F8FAFC' : '#020617',
                          fontSize: 16,
                          filterTextInputPlaceholder: isDark ? '#E2E8F0' : '#64748B',
                          primaryColor: isDark ? '#A855F7' : '#8B5CF6',
                          primaryColorVariant: isDark ? '#C084FC' : '#A78BFA',
                          // Add other theme props as needed
                        },
                        // You can pass specific modal props here
                        modalProps: {
                          presentationStyle: 'fullScreen', // Or 'overFullScreen' on iOS
                          animationType: 'slide',
                          // You can pass more styling to the modal's content view if needed
                          // e.g., via a custom renderModal hook or if the library exposes a prop
                        },
                      }}
                    />
                  </View>
                </View>

                <Button 
                  disabled={!formData.role || !formData.orgName || !formData.whatsapp} 
                  onPress={handleNext} 
                  className="w-full h-14 rounded-2xl font-bold uppercase tracking-wide flex-row items-center justify-center"
                >
                  <Typography className="text-white text-lg font-montserrat-bold mr-2">Continue</Typography>
                  <ChevronRight size={18} color="white" />
                </Button>
              </View>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <View
                key="step2"
                className="space-y-16"
              >
                <View>
                  <Typography variant="h1" className="text-3xl font-bold tracking-tight mb-2 pb-6">Organization Context</Typography>
                  <Typography className="text-muted-foreground">Tell us more about how you operate.</Typography>
                </View>

                <View className="space-y-16">
                  <View className="space-y-8 py-4">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 mb-8">Team Size</Typography>
                    <View className="flex-row flex-wrap justify-between gap-2">
                      {TEAM_SIZES.map((t) => (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => setFormData({ ...formData, teamSize: t.id })}
                          style={{
                            flexBasis: '31%', // Adjust for 3 columns
                            paddingHorizontal: 8,
                            paddingVertical: 12,
                            borderRadius: 24, // Assuming rounded-xl
                            borderWidth: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: formData.teamSize === t.id ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#334155' : '#e2e8f0'),
                            backgroundColor: formData.teamSize === t.id ? (isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)') : (isDark ? '#1E293B' : '#F1F5F9'),
                          }}
                        >
                          <Typography style={{
                            fontSize: 9,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            textAlign: 'center',
                            color: formData.teamSize === t.id ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#94A3B8' : '#64748B'),
                          }}>
                            {t.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="space-y-8 py-4">
                    <View className="flex-row items-baseline ml-1 mb-8">
                      <Typography className="text-xs font-montserrat-bold tracking-wider text-muted-foreground flex-shrink pr-2">
                        What problem made you look for employee monitoring / tracking software?
                      </Typography>
                      <Typography className="text-[9px] font-bold uppercase text-muted-foreground">
                        (Optional)
                      </Typography>
                    </View>
                    <AuthInput
                      placeholder="Tell us what led you here."
                      value={formData.motivation}
                      onChangeText={(text) => setFormData({ ...formData, motivation: text })}
                      multiline
                      containerClassName="min-h-[120px] rounded-2xl p-2 bg-background/50 border-border/50"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Button variant="outline" onPress={handleBack} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wide">
                    <Typography>Back</Typography>
                  </Button>
                  <Button 
                    disabled={!formData.teamSize} 
                    onPress={handleNext} 
                    className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wide flex-row items-center justify-center"
                  >
                    <Typography className="text-white text-lg font-montserrat-bold mr-2">Continue</Typography>
                    <ChevronRight size={18} color="white" />
                  </Button>
                </View>
              </View>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <View
                key="step3"
                className="space-y-16"
              >
                <View>
                  <Typography variant="h1" className="text-3xl font-bold tracking-tight mb-2">Operations</Typography>
                  <Typography className="text-muted-foreground">Define your workspace standards.</Typography>
                </View>

                <View className="space-y-16">
                  <View className="space-y-8 py-4">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 flex-row items-center mb-8">
                      <MapPin size={14} className="text-primary mr-2" /> Location & Timezone
                    </Typography>
                    
                    <View className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                          <Loader2 size={16} className={cn(loading ? "animate-spin" : "", "text-primary")} />
                        </View>
                        <View className="flex-col">
                          <Typography className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detected Zone</Typography>
                          <Typography className="text-[11px] font-bold text-foreground">
                            {formData.timezone}
                          </Typography>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      </View>
                    </View>
                  </View>

                  <View className="space-y-8 py-4">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 mb-8">Standard Workday</Typography>
                    <View className="flex-row justify-between gap-2">
                      {SHIFTS.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          onPress={() => setFormData({ ...formData, shift: s.id })}
                          style={{
                            flex: 1,
                            paddingVertical: 16,
                            borderRadius: 24, // Assuming rounded-2xl
                            borderWidth: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: formData.shift === s.id ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#334155' : '#e2e8f0'),
                            backgroundColor: formData.shift === s.id ? (isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)') : (isDark ? '#1E293B' : '#F1F5F9'),
                          }}
                        >
                          <Typography style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            color: formData.shift === s.id ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#94A3B8' : '#64748B'),
                          }}>
                            {s.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="space-y-8 py-4">
                    <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 mb-8">Weekly Schedule (Workdays)</Typography>
                    <View className="flex-row justify-between gap-1">
                      {DAYS.map((d) => (
                        <TouchableOpacity
                          key={d.id}
                          onPress={() => {
                            const newWorkdays = formData.workdays.includes(d.id)
                              ? formData.workdays.filter(id => id !== d.id)
                              : [...formData.workdays, d.id].sort();
                            setFormData({ ...formData, workdays: newWorkdays });
                          }}
                          style={{
                            flex: 1,
                            paddingVertical: 16,
                            borderRadius: 16, // Assuming rounded-xl
                            borderWidth: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: formData.workdays.includes(d.id) ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#334155' : '#e2e8f0'),
                            backgroundColor: formData.workdays.includes(d.id) ? (isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)') : (isDark ? '#1E293B' : '#F1F5F9'),
                          }}
                        >
                          <Typography style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: formData.workdays.includes(d.id) ? (isDark ? '#a78bfa' : '#8b5cf6') : (isDark ? '#94A3B8' : '#64748B'),
                          }}>
                            {d.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Typography className="text-[9px] text-muted-foreground uppercase tracking-widest text-center mt-2">Unselected days will be marked as holidays.</Typography>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Button variant="outline" onPress={handleBack} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wide">
                    <Typography>Back</Typography>
                  </Button>
                  <Button 
                    onPress={handleNext} 
                    className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wide flex-row items-center justify-center"
                  >
                    <Typography className="text-white text-lg font-montserrat-bold mr-2">Continue</Typography>
                    <ChevronRight size={18} color="white" />
                  </Button>
                </View>
              </View>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <View
                key="step4"
                className="space-y-16"
              >
                <View>
                  <Typography variant="h1" className="text-3xl font-bold tracking-tight mb-2">Visual Branding</Typography>
                  <Typography className="text-muted-foreground">Add your organization logo (Optional).</Typography>
                </View>

                <View className="space-y-16">
                  <View style={{ flexDirection: 'row', gap: 8, padding: 4, borderRadius: 24, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.5)' }}>
                    <TouchableOpacity 
                      onPress={() => setLogoMode("upload")}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 12,
                        borderRadius: 12, // Assuming rounded-xl
                        backgroundColor: logoMode === "upload" ? (isDark ? '#000000' : '#FFFFFF') : 'transparent',
                        shadowColor: logoMode === "upload" ? '#000' : 'transparent',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: logoMode === "upload" ? 0.1 : 0,
                        shadowRadius: 1,
                        elevation: logoMode === "upload" ? 1 : 0,
                      }}
                    >
                      <Upload size={14} color={logoMode === "upload" ? (isDark ? "#fff" : "#000") : (isDark ? "#94A3B8" : "#64748B")} /> 
                      <Typography style={{
                        fontSize: 10,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: logoMode === "upload" ? (isDark ? "#fff" : "#000") : (isDark ? "#94A3B8" : "#64748B"),
                      }}>
                        File Upload
                      </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setLogoMode("url")}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingVertical: 12,
                        borderRadius: 12, // Assuming rounded-xl
                        backgroundColor: logoMode === "url" ? (isDark ? '#000000' : '#FFFFFF') : 'transparent',
                        shadowColor: logoMode === "url" ? '#000' : 'transparent',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: logoMode === "url" ? 0.1 : 0,
                        shadowRadius: 1,
                        elevation: logoMode === "url" ? 1 : 0,
                      }}
                    >
                      <LinkIcon size={14} color={logoMode === "url" ? (isDark ? "#fff" : "#000") : (isDark ? "#94A3B8" : "#64748B")} /> 
                      <Typography style={{
                        fontSize: 10,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: logoMode === "url" ? (isDark ? "#fff" : "#000") : (isDark ? "#94A3B8" : "#64748B"),
                      }}>
                        Image URL
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  {logoMode === "upload" ? (
                    <TouchableOpacity 
                      onPress={pickImage}
                      style={{
                        position: 'relative',
                        aspectRatio: 16 / 9,
                        borderRadius: 32, // Assuming rounded-[2rem]
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 16,
                        overflow: 'hidden',
                        borderColor: logoPreview ? '#4ADE80' : (isDark ? '#334155' : '#e2e8f0'), // Dynamic border color
                        backgroundColor: logoPreview ? 'rgba(74, 222, 128, 0.05)' : (isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(241, 245, 249, 0.3)'), // Dynamic background color
                      }}
                    >
                      
                      {isUploading ? (
                        <View style={{ flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                           <Loader2 className="animate-spin text-primary" size={32} />
                           <Typography style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Processing...</Typography>
                        </View>
                      ) : logoPreview ? (
                        <View style={{ position: 'relative', width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                          <Image source={{ uri: logoPreview }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, justifyContent: 'center', alignItems: 'center' }}>
                             <Plus className="text-white rotate-45" size={32} />
                          </View>
                        </View>
                      ) : (
                        <>
                          <View style={{ width: 56, height: 56, backgroundColor: isDark ? '#000000' : '#FFFFFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1, borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                            <ImageIcon className="text-muted-foreground" size={24} />
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Typography style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Tap to upload logo</Typography>
                            <Typography style={{ fontSize: 10, color: isDark ? '#94A3B8' : '#64748B', fontWeight: '500', textTransform: 'uppercase', marginTop: 4 }}>Select from gallery</Typography>
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View className="space-y-8 py-4">
                      <Typography className="text-xs font-semibold uppercase tracking-wider ml-1 mb-8">Logo URL</Typography>
                      <AuthInput
                        placeholder="https://company.com/logo.png"
                        value={formData.logoUrl}
                        onChangeText={(text) => {
                          setFormData({ ...formData, logoUrl: text });
                          setLogoPreview(text);
                        }}
                        containerClassName="h-14 rounded-2xl px-2 bg-background/50"
                      />
                      {logoPreview && (
                        <View className="mt-4 aspect-video rounded-2xl border bg-secondary/30 flex items-center justify-center p-6 overflow-hidden">
                           <Image 
                              source={{ uri: logoPreview }} 
                              className="w-full h-full object-contain"
                              resizeMode="contain"
                              onError={() => setLogoPreview(null)}
                           />
                        </View>
                      )}
                    </View>
                  )}
                </View>

                <View className="flex-row gap-3 pt-4">
                  <Button variant="outline" onPress={handleBack} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wide">
                    <Typography>Back</Typography>
                  </Button>
                  <Button 
                    disabled={loading} 
                    onPress={handleSubmit} 
                    className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-wide flex-row items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="mr-2" size={18} color="white" />
                    )}
                    <Typography className="text-white text-lg font-montserrat-bold">{loading ? "Completing..." : "Finish Setup"}</Typography>
                  </Button>
                </View>
              </View>
            )}
          </View>
          
          <Typography className="text-center mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Professional Performance Monitoring • v1.0
          </Typography>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
