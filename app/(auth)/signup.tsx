import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Moon, Sun, User, Mail, Lock } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { AuthInput } from '@/components/auth/AuthInput';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '@/stores/use-auth-store';
import { z } from 'zod';
import { auth, firestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithCredential, GoogleAuthProvider, updateProfile } from '@react-native-firebase/auth';
import { getDoc, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import GoogleLogo from '@/assets/images/google-logo.svg';
import AppleLogo from '@/assets/images/apple-logo.svg';

export default function SignupPage() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setAuth, setUserData, isLoading, setLoading } = useAuthStore();
  
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = z.string().email().safeParse(email).success;

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !orgName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      const orgId = `org_${Math.random().toString(36).substr(2, 9)}`;
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 14);

      // Create Organization
      await setDoc(doc(firestore, "organizations", orgId), {
        name: orgName,
        ownerId: user.uid,
        inviteCode: Math.floor(100000 + Math.random() * 900000).toString(),
        subscriptionStatus: "trialing",
        subscriptionExpiry: trialExpiry,
        createdAt: serverTimestamp()
      });

      // Create User Profile WITH ownedOrgId
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        name: name,
        photoUrl: user.photoURL,
        role: "owner",
        orgName: orgName,
        ownedOrgId: orgId,
        uid: user.uid,
        onboardingCompleted: false,
        createdAt: serverTimestamp()
      });

      Alert.alert('Account created', 'Your organization has been set up successfully.');
      router.replace('/dashboard/onboarding');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Signup Error', error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      
      // Force account selection
      try {
        await GoogleSignin.signOut();
      } catch (e) {}

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
        const generatedOrgName = `${user.displayName || 'Enterprise'}'s Org`;
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 14);

        await setDoc(doc(firestore, "organizations", orgId), {
          name: generatedOrgName,
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
          orgName: generatedOrgName,
          ownedOrgId: orgId,
          uid: user.uid,
          onboardingCompleted: false,
          createdAt: serverTimestamp()
        });
      }
      router.replace("/dashboard/onboarding");
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Google Signup Error', error.message || 'Failed to sign up with Google');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pt-4">
        <IconButton 
          icon={<ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />}
          variant="outline"
          className="border-border w-10 h-10"
          onPress={() => router.back()}
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
          <View className="mb-6 mt-2">
            <Typography variant="h1" className="font-poppins text-primary mb-2">
              Create Account
            </Typography>
            <Typography variant="muted" className="text-base">
              Join Trac today and start your journey
            </Typography>
          </View>

          <View className="space-y-3">
            <AuthInput 
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              leftIcon={<User size={20} color={isDark ? "#94A3B8" : "#64748B"} />}
              autoCapitalize="words"
            />

            <AuthInput 
              value={orgName}
              onChangeText={setOrgName}
              placeholder="Organization Name"
              leftIcon={<User size={20} color={isDark ? "#94A3B8" : "#64748B"} />}
              autoCapitalize="words"
            />

            <AuthInput 
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              leftIcon={<Mail size={20} color={isDark ? "#94A3B8" : "#64748B"} />}
              isValid={isEmailValid}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <AuthInput 
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              isPassword
              leftIcon={<Lock size={20} color={isDark ? "#94A3B8" : "#64748B"} />}
            />
          </View>

          <Button 
            title="Sign up"
            className="bg-trac-purple h-14 rounded-3xl mt-6 shadow-lg shadow-trac-purple/30"
            loading={isLoading}
            textClassName="text-white text-lg font-montserrat-bold"
            onPress={handleSignup}
          />
        </View>

        <View>
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-[1px] bg-border" />
            <Typography className="mx-4 text-muted-foreground font-montserrat text-xs uppercase tracking-widest">or</Typography>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          <View className="gap-y-4">
            <Button 
              variant="outline"
              className="border-border h-14 rounded-3xl bg-card"
              leftIcon={<AppleLogo width={20} height={20} color={isDark ? '#fff' : '#000'} />}
              title="Sign up with Apple"
              textClassName="text-foreground font-montserrat-bold"
              onPress={() => {}}
            />
            <Button 
              variant="outline"
              className="border-border h-14 rounded-3xl bg-card"
              leftIcon={<GoogleLogo width={20} height={20} />}
              title="Sign up with Google"
              loading={isLoading}
              textClassName="text-foreground font-montserrat-bold"
              onPress={handleGoogleSignup}
            />
          </View>

          <View className="flex-row justify-center mt-4">
            <Typography className="text-muted-foreground font-montserrat">
              Already have an account?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Typography className="text-trac-purple font-montserrat-bold underline decoration-trac-purple">
                Log in
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
