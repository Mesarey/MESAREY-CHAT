import { Tabs } from 'expo-router';
import { TabBar } from '@/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }} tabBar={(p) => <TabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explorar" />
      <Tabs.Screen name="camino" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
