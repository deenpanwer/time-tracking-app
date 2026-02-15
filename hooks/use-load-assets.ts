import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export function useLoadAssets() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Set ready immediately to prevent blocking the UI
        setIsReady(true);
        
        // Hide splash screen as soon as we are "ready" to show our own splash
        await SplashScreen.hideAsync();

        // Load fonts in the background
        Font.loadAsync({
          'Poppins_600SemiBold': require('../assets/fonts/Poppins_600SemiBold.ttf'),
          'Montserrat_400Regular': require('../assets/fonts/Montserrat_400Regular.ttf'),
          'Montserrat_700Bold': require('../assets/fonts/Montserrat_700Bold.ttf'),
          ...Ionicons.font,
        }).catch(err => console.warn("Background font load failed", err));

      } catch (e) {
        console.warn('Load resources error:', e);
        setIsReady(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isReady;
}
