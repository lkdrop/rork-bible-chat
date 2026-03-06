import { Tabs } from 'expo-router';
import { Home, MessageCircle, Sparkles, User, Users } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function TabLayout() {
  const { colors } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarAccessibilityLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Gabriel',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
          tabBarAccessibilityLabel: 'Chat com Gabriel',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comunidade',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          tabBarAccessibilityLabel: 'Comunidade',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Criar',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          tabBarAccessibilityLabel: 'Criar Conteúdo',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          tabBarAccessibilityLabel: 'Perfil e Configurações',
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
