import { Tabs } from 'expo-router';
import { TabBar } from '@/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }} tabBar={(p) => <TabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mundos" />
      <Tabs.Screen name="camino" />
      <Tabs.Screen name="biblioteca" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
