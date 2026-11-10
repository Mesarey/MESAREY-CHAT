import { CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { NunitoSans_400Regular, NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useKura } from '@/state/store';
import { ambiences } from '@/theme/tokens';
import { RewardOverlay } from '@/ui/RewardOverlay';

export default function RootLayout() {
  const [fontsReady] = useFonts({ CormorantGaramond_500Medium, CormorantGaramond_600SemiBold, NunitoSans_400Regular, NunitoSans_600SemiBold });
  const hydrated = useKura((s) => s.hydrated);
  const name = useKura((s) => s.name);
  const pathname = usePathname();
  const bg = ambiences.base.sky[0];

  if (!fontsReady || !hydrated) return <View style={{ flex: 1, backgroundColor: bg }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!name && pathname !== '/bienvenida' && <Redirect href="/bienvenida" />}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg }, animation: 'fade' }} />
      {name !== '' && <RewardOverlay />}
    </SafeAreaProvider>
  );
}
