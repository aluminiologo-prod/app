import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Truck, ArrowLeftRight, User } from 'lucide-react-native';
import { Colors } from '../../../src/theme/colors';
import { useColorScheme } from 'react-native';

export default function TabsLayout() {
  const { t } = useTranslation('common');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabBarBg = isDark ? '#18191F' : '#FFFFFF';
  const borderColor = isDark ? '#272831' : '#E4E4E7';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? '#9BA1B0' : '#31374A',
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="in-transit"
        options={{
          title: t('tabs.inTransit'),
          tabBarIcon: ({ color, size }) => <Truck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfers"
        options={{
          title: t('tabs.transfers'),
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
