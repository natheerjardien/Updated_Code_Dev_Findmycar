import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AccessibilityProvider, useAccessibility } from '../context/accessibilityContext';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { LanguageProvider } from '../context/languageContext';

function RootLayoutNav() {
  const { colorMode } = useAccessibility();
  const router = useRouter();

  //when the user click notification from the notification bar they will be taken to the notifications page
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications');
    });

    return () => subscription.remove();
  }, [router]);
  
  return (
    <ThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <RootLayoutNav />
      </LanguageProvider>
    </AccessibilityProvider>
  );
}