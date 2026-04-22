import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BookOpenText, ShoppingBag, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../src/theme/colors';
import { DottedBackground } from '../../src/components/register/DottedBackground';
import { OnboardingHeader } from '../../src/components/onboarding/OnboardingHeader';
import { Eyebrow, SoonEyebrow } from '../../src/components/onboarding/Eyebrow';
import { SoonBadge } from '../../src/components/onboarding/SoonBadge';
import { FeatureIconCard } from '../../src/components/onboarding/FeatureIconCard';
import { PulseRings } from '../../src/components/onboarding/PulseRings';
import { PrimaryCta } from '../../src/components/register/PrimaryCta';
import { useAuth } from '../../src/contexts/AuthContext';
import { useMarkMyOnboardingComplete } from '../../src/hooks/queries';
import { toastApiError } from '../../src/lib/toast';

type Variant = 'light' | 'dark';

const SLIDE_DURATION_MS = 6000;
const TOTAL_SLIDES = 6;

const SLIDE_VARIANTS: Variant[] = ['light', 'dark', 'light', 'dark', 'light', 'light'];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('onboarding');
  const { logout } = useAuth();
  const { mutateAsync: markOnboardingComplete, isPending: isFinishing } =
    useMarkMyOnboardingComplete();

  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const variant = SLIDE_VARIANTS[index];
  const isDark = variant === 'dark';
  const bg = isDark ? Colors.brand.navyDark : Colors.brand.cream;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** LET'S GO on the final slide — flip the backend flag, then enter the app. */
  const handleComplete = useCallback(async () => {
    clearTimer();
    try {
      await markOnboardingComplete();
      router.replace('/(client)/(tabs)/home');
    } catch (err) {
      toastApiError(err);
    }
  }, [clearTimer, markOnboardingComplete]);

  /**
   * X button / "Skip" — close without flipping the flag. We log the user out
   * so they land back on the login screen; the next successful login will
   * re-enter the client shell and the guard will send them through the deck
   * again since `client.onboarding` is still false.
   */
  const handleSkip = useCallback(async () => {
    clearTimer();
    await logout();
  }, [clearTimer, logout]);

  const advance = useCallback(() => {
    setIndex((current) => {
      if (current >= TOTAL_SLIDES - 1) return current;
      return current + 1;
    });
  }, []);

  // Drive the progress bar + auto-advance for slides 0..4.
  // The final slide sits indefinitely until the user taps "Comenzar".
  // We separate the visual animation (progress shared value) from the JS timer
  // that triggers the advance — so a dropped worklet callback can't miss a
  // transition and a resumed animation can't double-fire advance().
  useEffect(() => {
    clearTimer();
    progress.value = 0;

    if (index >= TOTAL_SLIDES - 1) {
      progress.value = withTiming(1, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    progress.value = withTiming(1, {
      duration: SLIDE_DURATION_MS,
      easing: Easing.linear,
    });

    timerRef.current = setTimeout(advance, SLIDE_DURATION_MS);

    Haptics.selectionAsync().catch(() => {});

    return clearTimer;
  }, [index, advance, clearTimer, progress]);

  useEffect(() => clearTimer, [clearTimer]);

  const handleTapToAdvance = () => {
    if (index >= TOTAL_SLIDES - 1) return;
    advance();
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {Platform.OS === 'android' ? (
        <StatusBar
          backgroundColor={bg}
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />
      ) : null}

      <DottedBackground variant={variant} />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 10,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <OnboardingHeader
          variant={variant}
          activeIndex={index}
          totalSlides={TOTAL_SLIDES}
          progress={progress}
          onClose={handleSkip}
        />

        {/* Body — tap anywhere (outside the footer) to advance */}
        <Pressable
          onPress={handleTapToAdvance}
          style={{ flex: 1 }}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Animated.View
            key={index}
            entering={FadeIn.duration(320)}
            exiting={FadeOut.duration(160)}
            style={{ flex: 1 }}
          >
            {renderSlide(index, variant, t)}
          </Animated.View>
        </Pressable>

        {/* Footer — skip for slides 1..5, CTA for slide 6 */}
        <View style={{ alignItems: 'center', paddingTop: 12 }}>
          {index < TOTAL_SLIDES - 1 ? (
            <Animated.View
              key={`skip-${index}`}
              entering={FadeIn.duration(320).delay(260)}
            >
              <Pressable
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel={t('skip')}
                hitSlop={16}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 28,
                  opacity: pressed ? 0.55 : 0.75,
                })}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 12,
                    letterSpacing: 2.2,
                    color: isDark ? 'rgba(255,255,255,0.72)' : Colors.brand.navyMuted,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('skip')}
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View
              key="cta"
              entering={FadeInDown.duration(420).delay(260).springify().damping(18)}
              style={{ alignSelf: 'stretch' }}
            >
              <PrimaryCta
                label={t('slide6.cta')}
                onPress={handleComplete}
                loading={isFinishing}
              />
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

function renderSlide(
  index: number,
  variant: Variant,
  t: (key: string) => string,
): React.ReactNode {
  switch (index) {
    case 0:
      return <Slide1 t={t} variant={variant} />;
    case 1:
      return <Slide2 t={t} />;
    case 2:
      return (
        <SoonSlide
          t={t}
          ns="slide3"
          variant="light"
          icon={BookOpenText}
        />
      );
    case 3:
      return (
        <SoonSlide
          t={t}
          ns="slide4"
          variant="dark"
          icon={ShoppingBag}
        />
      );
    case 4:
      return (
        <SoonSlide
          t={t}
          ns="slide5"
          variant="light"
          icon={Star}
        />
      );
    case 5:
      return <Slide6 t={t} />;
    default:
      return null;
  }
}

// ─── Slide 1 — Welcome (light) ───────────────────────────────────────────────
function Slide1({ t, variant }: { t: (k: string) => string; variant: Variant }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 80 }}>
      <Animated.View entering={FadeInDown.duration(420).delay(80)}>
        <Eyebrow label={t('slide1.eyebrow')} variant={variant} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(220)}
        style={{ marginTop: 22 }}
      >
        <HeadingThreePart
          leading={t('slide1.titleLeading')}
          italic={t('slide1.titleItalic')}
          trailing={t('slide1.titleTrailing')}
          variant={variant}
          size="xl"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(380)}
        style={{ marginTop: 24 }}
      >
        <BodyText variant={variant}>{t('slide1.body')}</BodyText>
      </Animated.View>
    </View>
  );
}

// ─── Slide 2 — Access unlocked (dark, pulse rings) ──────────────────────────
function Slide2({ t }: { t: (k: string) => string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flex: 0.9, justifyContent: 'center' }}>
        <Animated.View entering={FadeIn.duration(600).delay(80)}>
          <PulseRings size={88} />
        </Animated.View>
      </View>

      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        <Animated.View entering={FadeInDown.duration(420).delay(320)}>
          <Eyebrow label={t('slide2.eyebrow')} variant="dark" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(520).delay(440)}
          style={{ marginTop: 16 }}
        >
          <HeadingThreePart
            leading={t('slide2.titleLeading')}
            italic={t('slide2.titleItalic')}
            trailing={t('slide2.titleTrailing')}
            variant="dark"
            size="lg"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(520).delay(580)}
          style={{ marginTop: 18 }}
        >
          <BodyText variant="dark">{t('slide2.body')}</BodyText>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Slides 3 / 4 / 5 — "Coming soon" features ──────────────────────────────
function SoonSlide({
  t,
  ns,
  variant,
  icon,
}: {
  t: (k: string) => string;
  ns: 'slide3' | 'slide4' | 'slide5';
  variant: Variant;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}) {
  return (
    <View style={{ flex: 1, paddingTop: 20, justifyContent: 'center', paddingBottom: 60 }}>
      <Animated.View entering={FadeInDown.duration(420).delay(80)}>
        <SoonBadge label={t(`${ns}.badge`)} variant={variant} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(220)}
        style={{ marginTop: 28 }}
      >
        <FeatureIconCard icon={icon} variant={variant} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(360)}
        style={{ marginTop: 26 }}
      >
        <HeadingThreePart
          leading={t(`${ns}.titleLeading`)}
          italic={t(`${ns}.titleItalic`)}
          trailing={t(`${ns}.titleTrailing`)}
          variant={variant}
          size="lg"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(500)}
        style={{ marginTop: 18 }}
      >
        <BodyText variant={variant}>{t(`${ns}.body`)}</BodyText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(620)}
        style={{ marginTop: 26 }}
      >
        <SoonEyebrow label={t(`${ns}.soon`)} variant={variant} />
      </Animated.View>
    </View>
  );
}

// ─── Slide 6 — Final "This is just the beginning" ───────────────────────────
function Slide6({ t }: { t: (k: string) => string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 }}>
      <Animated.View
        entering={FadeInDown.duration(520).delay(240)}
        style={{ alignItems: 'center' }}
      >
        <HeadingThreePart
          leading={t('slide6.titleLeading')}
          italic={t('slide6.titleItalic')}
          trailing={t('slide6.titleTrailing')}
          variant="light"
          size="lg"
          align="center"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(520).delay(400)}
        style={{ marginTop: 18, paddingHorizontal: 16 }}
      >
        <BodyText variant="light" align="center">
          {t('slide6.body')}
        </BodyText>
      </Animated.View>
    </View>
  );
}

// ─── Shared primitives ───────────────────────────────────────────────────────
function HeadingThreePart({
  leading,
  italic,
  trailing,
  variant,
  size,
  align = 'left',
}: {
  leading: string;
  italic: string;
  trailing?: string;
  variant: Variant;
  size: 'lg' | 'xl';
  align?: 'left' | 'center';
}) {
  const inkColor = variant === 'dark' ? '#FFFFFF' : Colors.brand.navy;
  const fontSize = size === 'xl' ? 36 : 32;
  const lineHeight = size === 'xl' ? 42 : 38;

  return (
    <Text
      style={{
        fontFamily: 'Fraunces_700Bold',
        fontSize,
        lineHeight,
        color: inkColor,
        letterSpacing: -0.5,
        textAlign: align,
      }}
    >
      {leading}
      {leading.endsWith(' ') || leading.endsWith('\n') ? '' : ' '}
      <Text
        style={{
          fontFamily: 'Fraunces_700Bold_Italic',
          color: Colors.brand.orange,
        }}
      >
        {italic}
      </Text>
      {trailing ? trailing : ''}
    </Text>
  );
}

function BodyText({
  children,
  variant,
  align = 'left',
}: {
  children: React.ReactNode;
  variant: Variant;
  align?: 'left' | 'center';
}) {
  const color =
    variant === 'dark' ? 'rgba(255,255,255,0.72)' : Colors.brand.navyMuted;
  return (
    <Text
      style={{
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 23,
        color,
        textAlign: align,
      }}
    >
      {children}
    </Text>
  );
}
