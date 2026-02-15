import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withRepeat, 
  withTiming,
  SharedValue
} from 'react-native-reanimated';

interface VoiceActivityWaveProps {
  volume: number; // 0 to 100
  isListening: boolean;
}

const BAR_COUNT = 12;

export function VoiceActivityWave({ volume, isListening }: VoiceActivityWaveProps) {
  // Volume is normalized to a 0-1 range for the animation
  const normalizedVolume = useSharedValue(0);

  useEffect(() => {
    normalizedVolume.value = withSpring(volume / 40, { damping: 15, stiffness: 100 });
  }, [volume]);

  return (
    <View className="flex-row items-center justify-center gap-[4px] h-full w-full">
      {[...Array(BAR_COUNT)].map((_, i) => (
        <Bar key={i} index={i} volume={normalizedVolume} isListening={isListening} />
      ))}
    </View>
  );
}

function Bar({ index, volume, isListening }: { index: number, volume: SharedValue<number>, isListening: boolean }) {
  const height = useSharedValue(4);
  
  // Base staggered animation for "no speech" state
  const idleScale = useSharedValue(1);
  
  useEffect(() => {
    if (isListening && volume.value === 0) {
      idleScale.value = withRepeat(
        withTiming(1.5, { duration: 500 + index * 50 }),
        -1,
        true
      );
    } else {
      idleScale.value = withTiming(1);
    }
  }, [isListening, volume.value]);

  const animatedStyle = useAnimatedStyle(() => {
    // When volume is 0, it's a straight line (4px)
    // When volume increases, bars expand differently based on their index
    const multiplier = Math.sin((index / BAR_COUNT) * Math.PI) * 40;
    const finalHeight = 4 + (volume.value * multiplier);

    return {
      height: withSpring(isListening ? finalHeight : 4),
      width: 3,
      borderRadius: 1.5,
      backgroundColor: '#3B82F6', // Trac Blue
      opacity: isListening ? 1 : 0.3,
    };
  });

  return <Animated.View style={animatedStyle} />;
}
