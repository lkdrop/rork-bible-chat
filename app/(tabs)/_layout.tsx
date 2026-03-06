import { Tabs } from 'expo-router';
import { Moon, MessageCircle, BookOpen } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primary.navy,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: Colors.accent.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
          marginTop: 4,
        },
        sceneStyle: { backgroundColor: Colors.background.cream },
      }}
    >
      <Tabs.Screen
        name="(guide)"
        options={{
          title: 'Orações',
          tabBarIcon: ({ color, size }) => <Moon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
