import { createElement, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Repeat,
  Tag,
  User as UserIcon,
  UserCircle2,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useMyClient } from '../../../src/hooks/queries';
import { Colors } from '../../../src/theme/colors';
import { computeCompleteness } from '../../../src/lib/profileCompleteness';
import { resolveIcon } from '../../../src/lib/iconRegistry';
import { ProfileHeader } from '../../../src/components/profile/ProfileHeader';
import { AvatarWithRing } from '../../../src/components/profile/AvatarWithRing';
import { CompletenessCard } from '../../../src/components/profile/CompletenessCard';
import { ProfileSection } from '../../../src/components/profile/ProfileSection';
import { ProfileRow } from '../../../src/components/profile/ProfileRow';
import { NameSheet } from '../../../src/components/profile/sheets/NameSheet';
import { PersonTypeSheet } from '../../../src/components/profile/sheets/PersonTypeSheet';
import { ClientTypeSheet } from '../../../src/components/profile/sheets/ClientTypeSheet';
import { EmailSheet } from '../../../src/components/profile/sheets/EmailSheet';
import { FiscalDocSheet } from '../../../src/components/profile/sheets/FiscalDocSheet';
import { AddressSheet } from '../../../src/components/profile/sheets/AddressSheet';
import { PhoneSheet } from '../../../src/components/profile/sheets/PhoneSheet';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';

const APP_VERSION = Constants.expoConfig?.version ?? '—';

type SheetKey =
  | 'name'
  | 'personType'
  | 'clientType'
  | 'phone'
  | 'email'
  | 'fiscalDoc'
  | 'address';

function getInitials(first: string | null, last: string | null): string {
  const f = first?.trim()?.[0] ?? '';
  const l = last?.trim()?.[0] ?? '';
  const combined = `${f}${l}`.toUpperCase();
  return combined.length > 0 ? combined : '·';
}

/**
 * Joins a list of translated field names with locale-aware conjunction.
 *   ['email']                     → "email"
 *   ['email', 'dirección']        → "email y dirección"
 *   ['email', 'cédula', 'dir.']   → "email, cédula y dir."
 */
function joinFields(names: string[], conjunction: string): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}${conjunction}${names[1]}`;
  return `${names.slice(0, -1).join(', ')}${conjunction}${names[names.length - 1]}`;
}

export default function ClientProfileScreen() {
  const { t } = useTranslation('profile');
  const { accountType, logout, chooseFlow } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const { data: client, isLoading, isError, refetch } = useMyClient();
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const completeness = useMemo(() => computeCompleteness(client), [client]);

  const bg = isDark ? '#0F1117' : Colors.brand.cream;
  const titleColor = isDark ? '#ECEDEE' : Colors.brand.navy;
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
              color: titleColor,
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
  const initials = getInitials(client.first_name, client.last_name);
  const memberSinceYear = new Date(client.created_at).getFullYear();
  const ClientTypeIcon = resolveIcon(client.client_type?.icon_name);

  const missingCount = completeness.missingKeys.length;
  const completenessBody =
    completeness.percent === 100
      ? t('completeness.doneSubtitle')
      : `${t('completeness.missingIntro', { count: missingCount })} ${t(
          'completeness.missingFields',
          {
            fields: joinFields(
              completeness.missingKeys.map((k) => t(`missingFieldName.${k}`)),
              t('listConjunction'),
            ),
          },
        )}`;

  const completenessHeadline =
    completeness.percent === 100
      ? t('completeness.done')
      : t('completeness.headline', { percent: completeness.percent });

  const handleSwitchFlow = async () => {
    await chooseFlow('admin');
  };

  // Client-only accounts have nothing to go "back" to (they land here from /).
  // BOTH-users reached this screen by picking a flow — tapping back should
  // take them to the flow-choice modal again.
  const canGoBack = accountType === 'BOTH';
  const handleBack = canGoBack ? () => router.replace('/flow-choice') : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SafeAreaView edges={['top']}>
        <ProfileHeader
          title={t('header.title')}
          onBack={handleBack}
          onLogout={() => setConfirmLogout(true)}
          logoutLabel={t('header.logout')}
          backLabel={t('header.back')}
        />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingHorizontal: 24 }}>
          <AvatarWithRing
            initials={initials}
            percent={completeness.percent}
            size={132}
          />

          <Text
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: 26,
              lineHeight: 32,
              color: titleColor,
              textAlign: 'center',
              marginTop: 18,
            }}
            numberOfLines={1}
          >
            {fullName}
          </Text>

          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: subtleText,
              marginTop: 6,
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {client.phone ? `${client.phone}  ·  ` : ''}
            {t('hero.memberSince', { year: memberSinceYear })}
          </Text>

          {client.client_type ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 12,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: Colors.brand.orangeSoft,
                gap: 8,
              }}
            >
              {createElement(ClientTypeIcon, {
                size: 14,
                color: Colors.brand.orange,
                strokeWidth: 2.2,
              })}
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 12,
                  color: Colors.brand.orange,
                  letterSpacing: 0.4,
                }}
              >
                {client.client_type.name}
              </Text>
            </View>
          ) : null}
        </View>

        <CompletenessCard
          percent={completeness.percent}
          headline={completenessHeadline}
          body={completenessBody}
          complete={completeness.percent === 100}
        />

        {/* Personal */}
        <ProfileSection
          title={t('sections.personal')}
          counter={t('sectionCounter', {
            filled: completeness.sections.personal.filled,
            total: completeness.sections.personal.total,
          })}
          counterComplete={completeness.sections.personal.complete}
        >
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
            label={t('rows.personType.label')}
            value={
              client.person_type ? t(`rows.personType.${client.person_type}`) : null
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
        <ProfileSection
          title={t('sections.contact')}
          counter={t('sectionCounter', {
            filled: completeness.sections.contact.filled,
            total: completeness.sections.contact.total,
          })}
          counterComplete={completeness.sections.contact.complete}
        >
          <ProfileRow
            icon={Phone}
            label={t('rows.phone')}
            value={client.phone}
            emptyLabel={t('rows.empty')}
            onPress={() => setOpenSheet('phone')}
            verified={!!client.phone}
            verifiedLabel={t('verified')}
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
        <ProfileSection
          title={t('sections.billing')}
          counter={t('sectionCounter', {
            filled: completeness.sections.billing.filled,
            total: completeness.sections.billing.total,
          })}
          counterComplete={completeness.sections.billing.complete}
        >
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
                  color: titleColor,
                }}
              >
                {t('header.switchFlow')}
              </Text>
            </View>
            <Repeat size={16} color={subtleText} />
          </Pressable>
        ) : null}

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
