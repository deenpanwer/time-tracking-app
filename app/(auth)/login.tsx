import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
import { supabase } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import GoogleLogo from '@/assets/images/google-logo.svg';
import AppleLogo from '@/assets/images/apple-logo.svg';

export default function LoginPage() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setAuth, isLoading, setLoading } = useAuthStore();

  const isEmailValid = z.string().email().safeParse(email).success;

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuth({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        }, session.access_token);
        router.replace('/main');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Hardcode the scheme to match Supabase dashboard 'Redirect URLs'
      const redirectUrl = 'tracapp://login';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success') {
        // The redirect will trigger onAuthStateChange
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Login Error', error.message || 'Failed to sign in with Google');
    }
  };

  const handleNavigation = () => {
    // Mock login for UI testing
    setAuth({
      id: '1',
      email: email || 'founder@trac.ai',
      name: 'Trac Founder',
    }, 'mock-token');
    
    router.replace('/main');
  };

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
            textClassName="text-white text-lg font-montserrat-bold"
            onPress={handleNavigation}
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
              onPress={handleNavigation}
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
