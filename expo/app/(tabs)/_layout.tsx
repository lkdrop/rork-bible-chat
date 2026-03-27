import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Sparkles, User, Users, Compass } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';

function GabrielTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={tabStyles.gabrielContainer}>
      <View style={tabStyles.gabrielGlow}>
        <LinearGradient
          colors={focused ? ['#C5943A', '#8B6914'] : ['#B8862D', '#7A5C12']}
          style={tabStyles.gabrielBtn}
        >
          <Sparkles size={22} color="#FFF" />
        </LinearGradient>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  gabrielContainer: {
    marginTop: -24,
    marginBottom: 2,
    alignItems: 'center',
  },
  gabrielGlow: {
    borderRadius: 28,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#C5943A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      default: {
        shadowColor: '#C5943A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
    }),
  },
  gabrielBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
        tabBarActiveTintColor: '#D4A84B',
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
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarAccessibilityLabel: 'Inicio',
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
        name="create"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          tabBarAccessibilityLabel: 'Explorar',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          tabBarAccessibilityLabel: 'Perfil e Configuracoes',
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
