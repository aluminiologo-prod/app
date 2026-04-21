import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, ShoppingBag, User } from 'lucide-react-native';
import { useColorScheme, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/theme/colors';

const TAB_LABEL_STYLE = { fontFamily: 'Inter_500Medium', fontSize: 11 } as const;

/**
 * Bottom-tab nav for the CLIENT flow. Only the Profile tab is wired up
 * today — Home and Orders render placeholder screens but are listed here so
 * the nav feels complete and the routes are reserved for upcoming work.
 */
export default function ClientTabsLayout() {
  const { t } = useTranslation('common');
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const tabBarBg = isDark ? '#18191F' : '#FFFFFF';
  const borderColor = isDark ? '#272831' : '#E4E4E7';

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.brand.orange,
      tabBarInactiveTintColor: isDark ? '#9BA1B0' : '#31374A',
      tabBarStyle: {
        backgroundColor: tabBarBg,
        borderTopColor: borderColor,
        borderTopWidth: 1,
        ...Platform.select({
          ios: {
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
          android: {
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
        }),
      },
      tabBarLabelStyle: TAB_LABEL_STYLE,
    }),
    [isDark, tabBarBg, borderColor, insets.bottom],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
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
