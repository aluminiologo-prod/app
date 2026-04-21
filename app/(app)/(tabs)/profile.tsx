import { View, Text, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LogOut, Repeat, User, UserCircle2 } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Colors } from '../../../src/theme/colors';

const APP_VERSION = Constants.expoConfig?.version ?? '—';

export default function ProfileScreen() {
  const { t } = useTranslation('auth');
  const { t: tProfile } = useTranslation('profile');
  const { user, logout, accountType, chooseFlow } = useAuth();
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: isDark ? '#0F1117' : '#F4F4F5' }}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#0F1117' : '#F4F4F5' }}>
      {/* User card */}
      <View className="bg-white dark:bg-[#18191F] mx-4 mt-6 rounded-2xl p-5 border border-[#E4E4E7] dark:border-[#272831]">
        <View className="flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: Colors.primaryLight }}>
            <User size={22} color={Colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-[#11181C] dark:text-[#ECEDEE]">
              {user?.first_name} {user?.last_name}
            </Text>
            <Text className="text-sm text-[#71717A]">{user?.email}</Text>
            {user?.store && (
              <Text className="text-xs text-[#71717A] mt-0.5">{user.store.name}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Switch to client flow (only for BOTH) */}
      {accountType === 'BOTH' ? (
        <Pressable
          onPress={() => chooseFlow('client')}
          className="bg-white dark:bg-[#18191F] mx-4 mt-4 rounded-2xl p-4 border border-[#E4E4E7] dark:border-[#272831] flex-row items-center gap-3 active:opacity-70"
        >
          <View className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: Colors.brand.orangeSoft }}>
            <UserCircle2 size={18} color={Colors.brand.orange} />
          </View>
          <Text className="text-base font-medium flex-1" style={{ color: isDark ? '#ECEDEE' : '#11181C' }}>
            {tProfile('flowChoice.client.title')}
          </Text>
          <Repeat size={16} color="#71717A" />
        </Pressable>
      ) : null}

      {/* Logout */}
      <Pressable
        onPress={logout}
        className="bg-white dark:bg-[#18191F] mx-4 mt-4 rounded-2xl p-4 border border-[#E4E4E7] dark:border-[#272831] flex-row items-center gap-3 active:opacity-70"
      >
        <View className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#FEEBE7' }}>
          <LogOut size={18} color={Colors.danger} />
        </View>
        <Text className="text-base font-medium" style={{ color: Colors.danger }}>
          {t('logout')}
        </Text>
      </Pressable>

      {/* Version */}
      <Text className="text-xs text-[#A1A1AA] text-center mt-6">
        v{APP_VERSION}
      </Text>
      </View>
    </SafeAreaView>
  );
}
