import { Stack } from 'expo-router';
import "../global.css";
import { StatusBar } from 'expo-status-bar';
import { useLoadAssets } from '@/hooks/use-load-assets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { TeamProvider } from '@/providers/TeamProvider';
import { AuthProvider } from '@/providers/AuthProvider';

// Fix Reanimated warning and ensure it doesn't flood logs
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const isReady = useLoadAssets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const CustomDarkTheme = {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      primary: Colors.dark.primary,
    },
  };

  const CustomLightTheme = {
    ...NavDefaultTheme,
    colors: {
      ...NavDefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      primary: Colors.light.primary,
    },
  };

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 
        CRITICAL: The statusBarTranslucent and navigationBarTranslucent props 
        are now handled by react-native-edge-to-edge/expo-system-ui.
      */}
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TeamProvider>
              <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
                {/* 
                  The 'key' prop on the View forces a re-mount of the themed container 
                  when isDark changes, ensuring that Tailwind's 'dark' class 
                  is correctly applied to the root.
                */}
                <View 
                  key={isDark ? 'dark' : 'light'}
                  style={{ flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }} 
                  className={isDark ? 'dark' : ''}
                >
                  <StatusBar style={isDark ? 'light' : 'dark'} />
                  <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
                </View>
              </ThemeProvider>
            </TeamProvider>
          </AuthProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
