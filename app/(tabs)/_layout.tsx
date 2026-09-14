import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

const COLORS = { primary: '#5B5CE2', muted: '#737B8C' };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 6,
          borderTopColor: '#E7E9F0',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="vocabulary" options={{ title: 'Vocabulary', tabBarLabel: 'Words' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice', tabBarLabel: 'Practice' }} />
      <Tabs.Screen name="speak" options={{ title: 'Speak', tabBarLabel: 'Speak' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarLabel: 'Progress' }} />
    </Tabs>
  );
}
