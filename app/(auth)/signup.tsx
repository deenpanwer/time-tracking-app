import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
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

import GoogleLogo from '@/assets/images/google-logo.svg';
import AppleLogo from '@/assets/images/apple-logo.svg';

export default function SignupPage() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setAuth } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = z.string().email().safeParse(email).success;

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const handleNavigation = () => {
    // Mock signup for UI testing
    setAuth({
      id: Date.now().toString(),
      email: email || 'newuser@trac.ai',
      name: name || 'New User',
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
            textClassName="text-white text-lg font-montserrat-bold"
            onPress={handleNavigation}
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
              onPress={handleNavigation}
            />
            <Button 
              variant="outline"
              className="border-border h-14 rounded-3xl bg-card"
              leftIcon={<GoogleLogo width={20} height={20} />}
              title="Sign up with Google"
              textClassName="text-foreground font-montserrat-bold"
              onPress={handleNavigation}
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
