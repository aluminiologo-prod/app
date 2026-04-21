import { Stack } from 'expo-router';
import { RegisterProvider } from '../../../src/contexts/RegisterContext';

export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 260,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="phone" />
        <Stack.Screen name="code" options={{ animation: 'fade' }} />
        <Stack.Screen name="name" />
        <Stack.Screen name="segment" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      </Stack>
    </RegisterProvider>
  );
}
