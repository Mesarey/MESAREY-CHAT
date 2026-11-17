import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useNova } from '@/state/nova';
import { nova } from '@/theme/nova';
import { PremioPopup } from '@/ui/nova';

export default function NovaLayout() {
  const hydrated = useNova((s) => s.hydrated);
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: nova.sky[0] }} />;
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: nova.sky[0] }, animation: 'fade' }} />
      <PremioPopup />
    </>
  );
}
