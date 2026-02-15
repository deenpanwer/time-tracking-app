import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { View, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Menu } from 'lucide-react-native';
import { ChatSidebar, ChatSidebarRef } from '@/components/chat/ChatSidebar';

export default function HomePage() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sidebarRef = useRef<ChatSidebarRef>(null);

  return (
    <ChatSidebar ref={sidebarRef}>
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        {/* Floating Hamburger Button */}
        <View className="absolute top-12 left-6 z-50">
          <TouchableOpacity 
            onPress={() => sidebarRef.current?.open()}
            className="w-12 h-12 rounded-full bg-card border border-border/50 items-center justify-center shadow-sm shadow-black/10"
          >
            <Menu size={22} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>

        <ChatInterface />
      </SafeAreaView>
    </ChatSidebar>
  );
}