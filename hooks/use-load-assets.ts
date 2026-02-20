import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export function useLoadAssets() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts first
        await Font.loadAsync({
          'Poppins_600SemiBold': require('../assets/fonts/Poppins_600SemiBold.ttf'),
          'Montserrat_400Regular': require('../assets/fonts/Montserrat_400Regular.ttf'),
          'Montserrat_700Bold': require('../assets/fonts/Montserrat_700Bold.ttf'),
          ...Ionicons.font,
        });

        // Hide splash screen after fonts are loaded
        await SplashScreen.hideAsync();

      } catch (e) {
        console.warn('Load resources error:', e);
      } finally {
        setIsReady(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isReady;
}
