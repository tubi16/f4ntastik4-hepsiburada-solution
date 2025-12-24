import { Stack } from 'expo-router';
import { DeliveryProvider } from './context/DeliveryContext';

export default function RootLayout() {
  return (
    <DeliveryProvider>
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#fff' }, headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ title: 'Giriş', headerShown: false }} />
        <Stack.Screen name="customer/index" options={{ title: 'Müşteri Paneli', headerShown: false }} />
        <Stack.Screen name="courier/index" options={{ title: 'Kurye Paneli', headerShown: false }} />
        <Stack.Screen name="courier/delivery/[id]" options={{ title: 'Teslimat Onayı', headerShown: false }} />
      </Stack>
    </DeliveryProvider>
  );
}
