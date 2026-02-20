import React from 'react';
import { Modal, View, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';

interface SimpleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SimpleModal({ visible, onClose, title, description, children }: SimpleModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={onClose} 
          activeOpacity={1}
        >
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
        
        <View className="bg-card w-[95%] max-h-[80%] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border">
          <View className="p-6 border-b border-border flex-row justify-between items-center">
            <View>
              <Typography variant="h3" className="font-black uppercase tracking-tighter">{title}</Typography>
              {description && (
                <Typography variant="small" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                  {description}
                </Typography>
              )}
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-secondary">
              <X size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="p-4">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  }
});
