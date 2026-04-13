import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Truck, ArrowLeftRight, User } from 'lucide-react-native';
import { Colors } from '../../../src/theme/colors';
import { useColorScheme, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// tabBarLabelStyle never changes — define once at module scope.
const TAB_LABEL_STYLE = { fontFamily: 'Inter_500Medium', fontSize: 11 } as const;

export default function TabsLayout() {
  const { t } = useTranslation('common');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const tabBarBg = isDark ? '#18191F' : '#FFFFFF';
  const borderColor = isDark ? '#272831' : '#E4E4E7';

  // On Android, insets.bottom reflects the gesture nav bar height (0 on older
  // devices with hardware buttons, ~24–48px on gesture-nav devices).
  // On iOS, the Tabs navigator handles the home indicator automatically when
  // we set an explicit height + paddingBottom, so we just add a fixed offset.
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
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
