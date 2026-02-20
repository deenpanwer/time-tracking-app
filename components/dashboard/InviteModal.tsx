import React from 'react';
import { View, TouchableOpacity, useWindowDimensions, useColorScheme } from 'react-native';
import { Ticket, Copy, Check } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { SimpleModal } from '@/components/ui/SimpleModal';
import * as Clipboard from 'expo-clipboard';
import { Palette } from '@/constants/theme';
import { cn } from '@/lib/utils';

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  inviteCode: string;
}

export function InviteModal({ visible, onClose, inviteCode }: InviteModalProps) {
  const [copied, setCopied] = React.useState(false);
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isSmallScreen = width < 400;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SimpleModal
      visible={visible}
      onClose={onClose}
      title="Invite Staff"
      description="Expand your organization's footprint"
    >
      <View className="items-center space-y-12 pt-8 pb-12 px-2">
        <View className="size-24 bg-primary/10 rounded-3xl items-center justify-center border border-primary/20 shadow-inner rotate-3">
          <Ticket size={44} className="text-primary" />
        </View>

        <View className="w-full space-y-6 items-center">
          <Typography variant="small" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Organization Access Code
          </Typography>
          
          <View 
            className="w-full p-10 md:p-12 bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-primary/20 items-center justify-center"
            style={!isDark ? { backgroundColor: Palette.zinc[50] } : undefined}
          >
            <Typography 
              className="text-5xl md:text-6xl font-black text-foreground text-center tabular-nums"
              style={{ letterSpacing: isSmallScreen ? 8 : 12 }}
            >
              {inviteCode || "------"}
            </Typography>
          </View>
        </View>

        <View className="w-full space-y-8">
          <View className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <Typography variant="small" className="text-[11px] font-bold text-primary uppercase leading-relaxed text-center">
              Direct your personnel to enter this code in their profile to establish a secure handshake.
            </Typography>
          </View>

          <TouchableOpacity 
            onPress={handleCopy}
            className="bg-primary h-16 rounded-2xl flex-row items-center justify-center space-x-3 shadow-lg shadow-primary/20 active:scale-95"
          >
            {copied ? <Check size={20} color="white" /> : <Copy size={20} color="white" />}
            <Typography className="text-white font-black uppercase tracking-widest text-sm">
              {copied ? "Code Copied" : "Copy Access Code"}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </SimpleModal>
  );
}
