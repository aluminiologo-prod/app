import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { EditSheetFrame } from '../EditSheetFrame';
import { LabeledInput } from '../LabeledInput';
import { useUpdateMyFiscalDoc } from '../../../hooks/queries';
import { toastApiError, toastSuccess } from '../../../lib/toast';
import { Colors } from '../../../theme/colors';

type Prefix = 'V' | 'E' | 'J' | 'G' | 'P';
const PREFIXES: Prefix[] = ['V', 'E', 'J', 'G', 'P'];
const NUMBER_RE = /^\d{6,12}$/;
const RIF_RE = /^[VEJGP]-\d{6,12}$/;

interface Props {
  isOpen: boolean;
  initialRif: string | null;
  onClose: () => void;
}

function splitRif(rif: string | null): { prefix: Prefix; number: string } {
  const normalized = rif?.toUpperCase().trim() ?? '';
  const match = /^([VEJGP])-?(\d{0,12})$/.exec(normalized);
  if (match) return { prefix: match[1] as Prefix, number: match[2] };
  return { prefix: 'V', number: '' };
}

export function FiscalDocSheet({ isOpen, initialRif, onClose }: Props) {
  const { t } = useTranslation('profile');
  const isDark = useColorScheme() === 'dark';
  const seed = useMemo(() => splitRif(initialRif), [initialRif]);

  const [prefix, setPrefix] = useState<Prefix>(seed.prefix);
  const [number, setNumber] = useState(seed.number);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUpdateMyFiscalDoc();

  useEffect(() => {
    if (isOpen) {
      setPrefix(seed.prefix);
      setNumber(seed.number);
      setError(null);
    }
  }, [isOpen, seed]);

  const assembled = `${prefix}-${number}`;
  const isValid = RIF_RE.test(assembled);
  const canSave = isValid && assembled !== (initialRif ?? '');

  const handleSave = async () => {
    if (!NUMBER_RE.test(number)) {
      setError(t('edit.fiscalDoc.errors.invalid'));
      return;
    }
    setError(null);
    try {
      await mutateAsync({ rif: assembled });
      toastSuccess(t('edit.fiscalDoc.successToast'));
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(t('edit.fiscalDoc.errors.inUse'));
        return;
      }
      toastApiError(err, t('errors.saveFailed'));
    }
  };

  const labelColor = isDark ? '#9BA1B0' : Colors.brand.navyMuted;

  return (
    <EditSheetFrame
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={t('edit.eyebrow')}
      titleLeading={t('edit.fiscalDoc.titleLeading')}
      titleItalic={t('edit.fiscalDoc.titleItalic')}
      titleTrailing={t('edit.fiscalDoc.titleTrailing')}
      subtitle={t('edit.fiscalDoc.subtitle')}
      primaryLabel={t('edit.save')}
      onPrimary={handleSave}
      primaryDisabled={!canSave}
      primaryLoading={isPending}
    >
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: 8,
        }}
      >
        {t('edit.fiscalDoc.prefix')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {PREFIXES.map((p) => {
          const active = prefix === p;
          return (
            <Pressable
              key={p}
              onPress={() => setPrefix(p)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: active ? Colors.brand.orange : '#E2DAC9',
                backgroundColor: active ? Colors.brand.orange : '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 15,
                  color: active ? '#FFFFFF' : Colors.brand.navy,
                }}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <LabeledInput
        insideSheet
        label={t('edit.fiscalDoc.number')}
        value={number}
        onChangeText={(v) => {
          setNumber(v.replace(/\D/g, '').slice(0, 12));
          setError(null);
        }}
        autoFocus
        keyboardType="number-pad"
        maxLength={12}
        placeholder="12345678"
        returnKeyType="done"
        onSubmitEditing={handleSave}
        error={error}
      />
    </EditSheetFrame>
  );
}
