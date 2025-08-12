import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  useFrameworkReady();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}