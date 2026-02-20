import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Moon, Sun, Mail, Lock } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { AuthInput } from '@/components/auth/AuthInput';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '@/stores/use-auth-store';
import { z } from 'zod';
import { auth, firestore } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { getDoc, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import GoogleLogo from '@/assets/images/google-logo.svg';
import AppleLogo from '@/assets/images/apple-logo.svg';

GoogleSignin.configure({
  webClientId: '278674911210-lk40pk3m388ddsj3po4q8cusrehnn1f9.apps.googleusercontent.com',
});

export default function LoginPage() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const { setAuth, setUserData, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isEmailValid = z.string().email().safeParse(email).success;

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        const orgId = `org_${Math.random().toString(36).substr(2, 9)}`;
        const orgName = `${user.displayName || 'Enterprise'}'s Org`;
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 14);

        await setDoc(doc(firestore, "organizations", orgId), {
          name: orgName,
          ownerId: user.uid,
          inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
          subscriptionStatus: "trialing",
          subscriptionExpiry: trialExpiry,
          createdAt: serverTimestamp()
        });

        await setDoc(doc(firestore, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
          role: "owner",
          orgName: orgName,
          ownedOrgId: orgId,
          uid: user.uid,
          onboardingCompleted: false,
          createdAt: serverTimestamp()
        });

        Alert.alert("Welcome", "Let's set up your workspace.");
        router.replace("/dashboard/onboarding");
      } else {
        const userData = userDoc.data();
        if (userData && !userData.onboardingCompleted) {
          router.replace("/dashboard/onboarding");
        } else {
          Alert.alert("Welcome back", "You have successfully signed in.");
          router.replace("/main"); // Keep existing navigation for fully onboarded users
        }
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Login Error', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      
      // Force account selection by signing out first
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if not signed in
      }

      const response = await GoogleSignin.signIn();
      
      const idToken = response.data?.idToken;
      
      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID Token received.');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        const orgId = `org_${Math.random().toString(36).substr(2, 9)}`;
        const orgName = `${user.displayName || 'Enterprise'}'s Org`;
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 14);

        await setDoc(doc(firestore, "organizations", orgId), {
          name: orgName,
          ownerId: user.uid,
          inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
          subscriptionStatus: "trialing",
          subscriptionExpiry: trialExpiry,
          createdAt: serverTimestamp()
        });

        await setDoc(doc(firestore, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
          role: "owner",
          orgName: orgName,
          ownedOrgId: orgId,
          uid: user.uid,
          onboardingCompleted: false,
          createdAt: serverTimestamp()
        });
        
        Alert.alert("Welcome", "Let's set up your workspace.");
        router.replace("/dashboard/onboarding");
      } else {
        const userData = userDoc.data();
        if (userData && !userData.onboardingCompleted) {
          router.replace("/dashboard/onboarding");
        } else {
          Alert.alert("Welcome back", "You have successfully signed in.");
          router.replace("/main"); // Keep existing navigation for fully onboarded users
        }
      }
      // AuthProvider will handle navigation via state changes for existing users
    } catch (error: any) {
      setLoading(false);
      console.error('Google Sign-In error details:', error);
      Alert.alert('Google Login Error', error.message || 'Failed to sign in with Google');
    }
  };

  if (!isMounted) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <IconButton 
          icon={<ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />}
          variant="outline"
          className="border-border w-10 h-10"
          onPress={() => router.replace('/splash')}
        />
        <IconButton 
          icon={isDark ? <Sun size={20} color="#fff" /> : <Moon size={20} color="#000" />}
          variant="outline"
          className="border-border w-10 h-10"
          onPress={toggleTheme}
        />
      </View>

      <View className="flex-1 px-8 pb-8 justify-between">
        <View>
          <View className="mb-8 mt-4">
            <Typography variant="h1" className="font-poppins text-primary mb-2">
              Log in to Trac
            </Typography>
            <Typography variant="muted" className="text-base">
              Enter your existing account details below
            </Typography>
          </View>

          <View className="space-y-4">
            <AuthInput 
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              leftIcon={<Mail size={20} color={isDark ? "#94A3B8" : "#64748B"} />}
              isValid={isEmailValid}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View>
              <AuthInput 
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                isPassword
                leftIcon={<Lock size={20} color={isDark ? "#94A3B8" : "#64748B"} />}
                containerClassName="mb-1"
              />
              
              <TouchableOpacity className="self-end mt-1">
                <Typography className="text-trac-purple font-montserrat-bold underline decoration-trac-purple text-xs">
                  Forgot password?
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          <Button 
            title="Log in"
            className="bg-trac-purple h-14 rounded-3xl mt-8 shadow-lg shadow-trac-purple/30"
            loading={isLoading}
            textClassName="text-white text-lg font-montserrat-bold"
            onPress={handleEmailLogin}
          />
        </View>

        <View>
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-border" />
            <Typography className="mx-4 text-muted-foreground font-montserrat text-xs uppercase tracking-widest">or</Typography>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          <View className="gap-y-4">
            <Button 
              variant="outline"
              className="border-border h-14 rounded-3xl bg-card"
              leftIcon={<AppleLogo width={20} height={20} color={isDark ? '#fff' : '#000'} />}
              title="Sign in with Apple"
              textClassName="text-foreground font-montserrat-bold"
              onPress={() => {}} 
            />
            <Button 
              variant="outline"
              className="border-border h-14 rounded-3xl bg-card"
              leftIcon={<GoogleLogo width={20} height={20} />}
              title="Sign in with Google"
              loading={isLoading}
              textClassName="text-foreground font-montserrat-bold"
              onPress={handleGoogleLogin}
            />
          </View>

          <View className="flex-row justify-center mt-6">
            <Typography className="text-muted-foreground font-montserrat">
              Want to join Trac?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Typography className="text-trac-purple font-montserrat-bold underline decoration-trac-purple">
                Sign up
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
