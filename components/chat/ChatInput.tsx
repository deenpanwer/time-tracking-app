import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { Mic, ArrowUp, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Audio } from 'expo-av';
import Voice, { SpeechResultsEvent, SpeechErrorEvent, SpeechVolumeChangeEvent } from '@react-native-voice/voice';
import { VoiceActivityWave } from './VoiceActivityWave';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  
  const MAX_INPUT_HEIGHT = 150;
  const INITIAL_HEIGHT = 46;
  const animatedHeight = useSharedValue(INITIAL_HEIGHT);
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    // Defensive check: Voice might be null if native module is not linked/found
    if (!Voice) return;

    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error('Speech Error:', e);
      setIsListening(false);
    };
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        setText(e.value[0]);
      }
    };
    Voice.onSpeechVolumeChanged = (e: SpeechVolumeChangeEvent) => {
      setVolume(e.value || 0);
    };

    return () => {
      if (Voice) {
        Voice.destroy().then(Voice.removeAllListeners).catch(e => console.log('Voice Cleanup Error:', e));
      }
    };
  }, []);

  const startListening = async () => {
    // 1. Check if Voice module is loaded at all
    if (!Voice) {
      Alert.alert(
        'Feature Unavailable', 
        'Voice recognition module not found. Please ensure you are using a Development Build and have followed the installation steps.'
      );
      return;
    }

    try {
      // 2. Request Microphone Permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Trac needs microphone access to use speech-to-text.');
        return;
      }

      // 3. Check if Speech recognition is available on this system
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        Alert.alert(
          'Speech Unavailable', 
          'Speech recognition is not available on this device or environment.'
        );
        return;
      }

      setText('');
      setVolume(0);
      await Voice.start('en-US');
    } catch (e: any) {
      console.error('Voice Start Error:', e);
      // Fail gracefully without crashing
      setIsListening(false);
      const errorMsg = e.message || 'Unknown error';
      if (errorMsg.includes('null')) {
        Alert.alert('Native Module Missing', 'Speech recognition requires a Development Build (npx expo run:android/ios). It will not work in standard Expo Go.');
      } else {
        Alert.alert('Error', `Could not start voice recognition: ${errorMsg}`);
      }
    }
  };

  const stopListening = async () => {
    if (!Voice) return;
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  /* 
    CRITICAL: DO NOT REMOVE OR MODIFY useKeyboardHandler. 
    Tracks keyboard height in real-time to move the absolute-positioned capsule.
  */
  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
    onEnd: (e) => {
      'worklet';
      keyboardHeight.value = e.height;
    },
  }, []); // Empty dependency array to keep it constant between renders

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      handleTextChange('');
    }
  };

  const handleTextChange = (val: string) => {
    setText(val);
    if (val.length === 0) {
      animatedHeight.value = withTiming(INITIAL_HEIGHT, { duration: 200 });
    }
  };

  const handleContentSizeChange = (e: any) => {
    const height = e.nativeEvent.contentSize.height;
    const targetHeight = Math.min(Math.max(height, INITIAL_HEIGHT), MAX_INPUT_HEIGHT);
    animatedHeight.value = withTiming(targetHeight, { duration: 200 });
  };

  const animatedInputStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    borderRadius: animatedHeight.value > 50 ? 20 : 28,
  }));

  /* 
    CRITICAL: Absolute positioning with dynamic bottom offset.
    Ensures messages are visible behind the transparent container and gradient.
  */
  const animatedContainerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: keyboardHeight.value > 0 
      ? keyboardHeight.value + 12 
      : Math.max(insets.bottom, 20),
    paddingTop: 12,
    backgroundColor: 'transparent', 
  }));

  const bgGradientColor = isDark ? Colors.dark.background : Colors.light.background;

  return (
    <Animated.View 
      style={animatedContainerStyle} 
      className="px-4 w-full"
    >
      <LinearGradient
        colors={[
          'transparent',
          isDark ? 'rgba(9, 9, 11, 0.4)' : 'rgba(255, 255, 255, 0.4)',
          isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          bgGradientColor
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: -60,
        }}
        pointerEvents="none"
      />

      <Animated.View 
        style={[
          { 
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              },
              android: {
                shadowColor: '#000',
                elevation: 15,
              }
            })
          },
          animatedInputStyle
        ]}
        className="relative flex-row items-center px-4 overflow-hidden"
      >
        {isListening ? (
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut}
            className="flex-1 h-full items-center justify-center pr-10"
          >
            <VoiceActivityWave volume={volume} isListening={isListening} />
          </Animated.View>
        ) : (
          <TextInput
            multiline
            placeholder="Find any candidate"
            placeholderTextColor="#94A3B8"
            className={cn(
              "flex-1 text-foreground font-montserrat text-[15px] pr-20",
              Platform.OS === 'web' && "outline-none"
            )}
            style={{ 
              textAlignVertical: 'center',
              lineHeight: 20,
              paddingTop: 12,
              paddingBottom: 12,
            }}
            value={text}
            onChangeText={handleTextChange}
            onContentSizeChange={handleContentSizeChange}
          />
        )}

        <View className="absolute bottom-[7px] right-3 flex-row items-center bg-transparent">
          {isListening ? (
             <TouchableOpacity 
               onPress={stopListening}
               className="w-8 h-8 items-center justify-center rounded-full bg-red-500/10 mr-1"
             >
               <X size={19} color="#ef4444" />
             </TouchableOpacity>
          ) : !text.trim() && (
            <TouchableOpacity 
              onPress={startListening}
              className="w-8 h-8 items-center justify-center rounded-full bg-transparent mr-1"
            >
              <Mic size={19} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!text.trim() || isListening}
            className={cn(
              "w-8 h-8 items-center justify-center rounded-full",
              (text.trim() && !isListening) ? "bg-trac-purple" : "bg-secondary/40"
            )}
          >
            <ArrowUp 
              size={18} 
              color={(text.trim() && !isListening) ? "white" : (isDark ? "#94A3B8" : "#64748B")} 
              strokeWidth={2.5} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
