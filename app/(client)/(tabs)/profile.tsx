import { createElement, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Building2,
  HelpCircle,
  Home,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Repeat,
  ShoppingBag,
  User as UserIcon,
  UserCircle2,
  FileText,
  Tag,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useMyClient } from '../../../src/hooks/queries';
import { Colors } from '../../../src/theme/colors';
import { computeCompleteness } from '../../../src/lib/profileCompleteness';
import { resolveIcon } from '../../../src/lib/iconRegistry';
import { CompletenessRing } from '../../../src/components/profile/CompletenessRing';
import { ProfileSection } from '../../../src/components/profile/ProfileSection';
import { ProfileRow } from '../../../src/components/profile/ProfileRow';
import { ProfileGridTile } from '../../../src/components/profile/ProfileGridTile';
import { NameSheet } from '../../../src/components/profile/sheets/NameSheet';
import { PersonTypeSheet } from '../../../src/components/profile/sheets/PersonTypeSheet';
import { ClientTypeSheet } from '../../../src/components/profile/sheets/ClientTypeSheet';
import { EmailSheet } from '../../../src/components/profile/sheets/EmailSheet';
import { FiscalDocSheet } from '../../../src/components/profile/sheets/FiscalDocSheet';
import { AddressSheet } from '../../../src/components/profile/sheets/AddressSheet';
import { PhoneSheet } from '../../../src/components/profile/sheets/PhoneSheet';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { toastSuccess } from '../../../src/lib/toast';

const APP_VERSION = Constants.expoConfig?.version ?? '—';

type SheetKey =
  | 'name'
  | 'personType'
  | 'clientType'
  | 'phone'
  | 'email'
  | 'fiscalDoc'
  | 'address';

export default function ClientProfileScreen() {
  const { t } = useTranslation('profile');
  const { accountType, logout, chooseFlow } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const { data: client, isLoading, isError, refetch } = useMyClient();
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const completeness = useMemo(() => computeCompleteness(client), [client]);

  const bg = isDark ? '#0F1117' : Colors.brand.cream;
  const headerTitleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const subtleText = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.brand.orange} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !client) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              color: Colors.brand.navy,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {t('errors.loadFailed')}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              paddingHorizontal: 22,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: Colors.brand.orange,
            }}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', color: '#FFFFFF' }}>
              {t('errors.retry')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const fullName =
    [client.first_name, client.last_name].filter(Boolean).join(' ').trim() ||
    t('hero.noName');

  const memberSinceYear = new Date(client.created_at).getFullYear();
  const ClientTypeIcon = resolveIcon(client.client_type?.icon_name);

  const handleSwitchFlow = async () => {
    await chooseFlow('admin');
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 10,
          }}
        >
          <Image
            source={require('../../../assets/logo-light.png')}
            resizeMode="contain"
            style={{ width: 132, height: 28 }}
            accessibilityIgnoresInvertColors
          />
          <Pressable
            onPress={() => setConfirmLogout(true)}
            accessibilityRole="button"
            accessibilityLabel={t('header.logout')}
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? '#20222A' : Colors.brand.creamSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} color={subtleText} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <CompletenessRing value={completeness.percent} size={96} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Fraunces_700Bold',
                  fontSize: 22,
                  color: headerTitleColor,
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {fullName}
              </Text>
              {client.phone ? (
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 13,
                    color: subtleText,
                  }}
                >
                  {client.phone}
                </Text>
              ) : null}
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: subtleText,
                  marginTop: 4,
                }}
              >
                {t('hero.memberSince', { year: memberSinceYear })}
              </Text>

              {client.client_type ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    marginTop: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: Colors.brand.orangeSoft,
                    gap: 6,
                  }}
                >
                  {createElement(ClientTypeIcon, {
                    size: 14,
                    color: Colors.brand.orange,
                    strokeWidth: 2.2,
                  })}
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 11,
                      color: Colors.brand.orange,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {client.client_type.name}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Completeness card */}
          <View
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 16,
              backgroundColor: Colors.brand.orangeSoft,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 14,
                color: Colors.brand.navy,
                marginBottom: 4,
              }}
            >
              {completeness.percent === 100
                ? t('completeness.done')
                : t('completeness.title', { percent: completeness.percent })}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 18,
                color: Colors.brand.navyMuted,
              }}
            >
              {completeness.percent === 100
                ? t('completeness.doneSubtitle')
                : t('completeness.fieldsRemaining', {
                    count: completeness.total - completeness.filled,
                  })}
            </Text>
          </View>
        </View>

        {/* Personal */}
        <ProfileSection title={t('sections.personal')}>
          <ProfileRow
            icon={UserIcon}
            label={t('rows.name')}
            value={[client.first_name, client.last_name].filter(Boolean).join(' ')}
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('name')}
            isFirst
          />
          <ProfileRow
            icon={UserCircle2}
            label={t('rows.personType')}
            value={
              client.person_type
                ? t(`rows.personType.${client.person_type}`)
                : null
            }
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('personType')}
          />
          <ProfileRow
            icon={Tag}
            label={t('rows.clientType')}
            value={client.client_type?.name ?? null}
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('clientType')}
            isLast
          />
        </ProfileSection>

        {/* Contact */}
        <ProfileSection title={t('sections.contact')}>
          <ProfileRow
            icon={Phone}
            label={t('rows.phone')}
            value={client.phone}
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('phone')}
            isFirst
          />
          <ProfileRow
            icon={Mail}
            label={t('rows.email')}
            value={client.email}
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('email')}
            isLast
          />
        </ProfileSection>

        {/* Billing */}
        <ProfileSection title={t('sections.billing')}>
          <ProfileRow
            icon={FileText}
            label={t('rows.fiscalDoc')}
            value={client.rif}
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('fiscalDoc')}
            isFirst
          />
          <ProfileRow
            icon={MapPin}
            label={t('rows.address')}
            value={
              client.address
                ? [client.address, client.city].filter(Boolean).join(', ')
                : null
            }
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('address')}
            isLast
          />
        </ProfileSection>

        {/* Application grid */}
        <View style={{ marginTop: 22, paddingHorizontal: 20 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: subtleText,
              paddingHorizontal: 0,
              marginBottom: 10,
            }}
          >
            {t('sections.app')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <ProfileGridTile
              icon={ShoppingBag}
              label={t('grid.orders')}
              badge={t('grid.comingSoon')}
              onPress={() => toastSuccess(t('grid.comingSoon'))}
            />
            <ProfileGridTile
              icon={Home}
              label={t('grid.addresses')}
              badge={t('grid.comingSoon')}
              onPress={() => toastSuccess(t('grid.comingSoon'))}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ProfileGridTile
              icon={Bell}
              label={t('grid.notifications')}
              badge={t('grid.comingSoon')}
              onPress={() => toastSuccess(t('grid.comingSoon'))}
            />
            <ProfileGridTile
              icon={HelpCircle}
              label={t('grid.help')}
              badge={t('grid.comingSoon')}
              onPress={() => toastSuccess(t('grid.comingSoon'))}
            />
          </View>
        </View>

        {/* Switch to admin (only for BOTH) */}
        {accountType === 'BOTH' ? (
          <Pressable
            onPress={handleSwitchFlow}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginHorizontal: 16,
              marginTop: 22,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: isDark ? '#272831' : Colors.brand.creamSoft,
              backgroundColor: isDark ? '#18191F' : '#FFFFFF',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: Colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={18} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color: isDark ? '#ECEDEE' : Colors.brand.navy,
                }}
              >
                {t('header.switchFlow')}
              </Text>
            </View>
            <Repeat size={16} color={subtleText} />
          </Pressable>
        ) : null}

        {/* Version */}
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: subtleText,
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          v{APP_VERSION}
        </Text>
      </ScrollView>

      {/* Sheets */}
      <NameSheet
        isOpen={openSheet === 'name'}
        initialFirstName={client.first_name ?? ''}
        initialLastName={client.last_name ?? ''}
        onClose={() => setOpenSheet(null)}
      />
      <PersonTypeSheet
        isOpen={openSheet === 'personType'}
        initialPersonType={client.person_type}
        onClose={() => setOpenSheet(null)}
      />
      <ClientTypeSheet
        isOpen={openSheet === 'clientType'}
        initialClientTypeId={client.client_type_id}
        onClose={() => setOpenSheet(null)}
      />
      <PhoneSheet
        isOpen={openSheet === 'phone'}
        initialPhone={client.phone}
        onClose={() => setOpenSheet(null)}
      />
      <EmailSheet
        isOpen={openSheet === 'email'}
        initialEmail={client.email}
        onClose={() => setOpenSheet(null)}
      />
      <FiscalDocSheet
        isOpen={openSheet === 'fiscalDoc'}
        initialRif={client.rif}
        onClose={() => setOpenSheet(null)}
      />
      <AddressSheet
        isOpen={openSheet === 'address'}
        initialAddress={client.address}
        initialCity={client.city}
        onClose={() => setOpenSheet(null)}
      />

      <ConfirmModal
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout();
        }}
        title={t('logoutConfirm.title')}
        message={t('logoutConfirm.message')}
        confirmLabel={t('logoutConfirm.confirm')}
        confirmColor="danger"
      />
    </View>
  );
}
