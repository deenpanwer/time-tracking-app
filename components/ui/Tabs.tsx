import React from 'react';
import { View, Pressable } from 'react-native';
import { Typography } from './Typography';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <View className={cn("flex-row bg-secondary/50 p-1 rounded-2xl", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            className={cn(
              "flex-1 py-2.5 rounded-xl items-center justify-center",
              isActive && "bg-background shadow-sm shadow-black/5"
            )}
          >
            <Typography 
              className={cn(
                "text-sm font-montserrat-bold capitalize",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {tab}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
