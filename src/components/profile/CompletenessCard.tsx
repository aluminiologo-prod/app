import { useEffect } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

interface Props {
  percent: number;
  headline: string;
  /** Full paragraph rendered below the bar. Parts wrapped in <b>…</b> are bolded. */
  body: string;
  /** When 100 the card flips to a success-tinted variant. */
  complete?: boolean;
}

/**
 * "PERFIL AL X%" card with horizontal progress bar. Ships a tiny rich-text
 * parser (just <b>…</b>) so callers can bold specific tokens in the body
 * (e.g. the list of missing fields) without pulling in a full HTML library.
 */
export function CompletenessCard({ percent, headline, body, complete }: Props) {
  const isDark = useColorScheme() === 'dark';
  const clamped = Math.max(0, Math.min(100, percent));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clamped, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const bg = isDark ? '#18191F' : '#FFFFFF';
  const border = isDark ? '#272831' : Colors.brand.creamSoft;
  const labelColor = Colors.brand.orange;
  const percentColor = isDark ? '#ECEDEE' : Colors.brand.navy;
  const bodyColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;
  const trackColor = isDark ? '#272831' : '#EFE7D7';
  const fillColor = complete ? Colors.success : Colors.brand.orange;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 20,
        padding: 18,
        borderRadius: 16,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 12,
            color: labelColor,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {headline}
        </Text>
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 22,
            color: percentColor,
          }}
        >
          {`${Math.round(clamped)}%`}
        </Text>
      </View>

      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: trackColor,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <Animated.View
          style={[
            {
              height: 6,
              borderRadius: 999,
              backgroundColor: fillColor,
            },
            barStyle,
          ]}
        />
      </View>

      <RichBody text={body} color={bodyColor} />
    </View>
  );
}

/**
 * Minimal <b>…</b> parser. Keeps inline bolding possible in i18n strings
 * without introducing an HTML dependency. Anything else in the string
 * renders as a plain `<Text>` segment.
 */
function RichBody({ text, color }: { text: string; color: string }) {
  const parts: { value: string; bold: boolean }[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    const open = remaining.indexOf('<b>');
    if (open === -1) {
      parts.push({ value: remaining, bold: false });
      break;
    }
    if (open > 0) parts.push({ value: remaining.slice(0, open), bold: false });
    const close = remaining.indexOf('</b>', open);
    if (close === -1) {
      parts.push({ value: remaining.slice(open + 3), bold: true });
      break;
    }
    parts.push({ value: remaining.slice(open + 3, close), bold: true });
    remaining = remaining.slice(close + 4);
  }

  return (
    <Text
      style={{
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 20,
        color,
      }}
    >
      {parts.map((p, i) => (
        <Text
          key={i}
          style={{
            fontFamily: p.bold ? 'Inter_700Bold' : 'Inter_400Regular',
            color,
          }}
        >
          {p.value}
        </Text>
      ))}
    </Text>
  );
}
