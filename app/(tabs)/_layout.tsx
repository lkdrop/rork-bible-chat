import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, MessageCircle, Sparkles, User, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';

function GabrielTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={tabStyles.gabrielContainer}>
      <LinearGradient
        colors={focused ? ['#8b5cf6', '#6d28d9'] : ['#7c3aed', '#5b21b6']}
        style={tabStyles.gabrielBtn}
      >
        <Sparkles size={20} color="#FFF" />
      </LinearGradient>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  gabrielContainer: {
    marginTop: -20,
    marginBottom: 4,
  },
  gabrielBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
    }),
  },
});

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
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
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
          tabBarIcon: ({ focused }) => <GabrielTabIcon focused={focused} />,
          tabBarAccessibilityLabel: 'Chat com Gabriel',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 0,
          },
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Social',
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
