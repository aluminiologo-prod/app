import { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';

type ConfirmColor = 'danger' | 'primary' | 'success' | 'warning';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: ConfirmColor;
  isLoading?: boolean;
}

const COLOR_MAP: Record<ConfirmColor, string> = {
  danger:  Colors.danger,
  primary: Colors.primary,
  success: Colors.success,
  warning: Colors.warning,
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmColor = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation('common');
  const isDark = useColorScheme() === 'dark';
  const scale = useRef(new Animated.Value(0.93)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          damping: 20,
          stiffness: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.93);
      opacity.setValue(0);
    }
  }, [isOpen, scale, opacity]);

  const confirmBg   = COLOR_MAP[confirmColor];
  const cardBg      = isDark ? '#18191F' : '#FFFFFF';
  const borderColor = isDark ? '#272831' : '#E4E4E7';
  const titleColor  = isDark ? '#ECEDEE' : '#11181C';
  const bodyColor   = isDark ? '#9BA1B0' : '#71717A';
  const cancelColor = isDark ? '#9BA1B0' : '#31374A';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={!isLoading ? onClose : undefined}
    >
      {/* Backdrop — dismiss on tap outside */}
      <TouchableWithoutFeedback onPress={!isLoading ? onClose : undefined}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 28,
          }}
        >
          {/* Card — stop backdrop dismiss when tapping inside */}
          <TouchableWithoutFeedback onPress={() => { /* absorb */ }}>
            <Animated.View
              style={{
                width: '100%',
                maxWidth: 360,
                backgroundColor: cardBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: isDark ? 0.45 : 0.12,
                shadowRadius: 28,
                elevation: 16,
                opacity,
                transform: [{ scale }],
              }}
            >
              {/* ── Header ── */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: borderColor,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontFamily: 'Inter_700Bold',
                    color: titleColor,
                    marginRight: 12,
                  }}
                >
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={!isLoading ? onClose : undefined}
                  hitSlop={10}
                  activeOpacity={0.5}
                >
                  <X size={18} color={bodyColor} />
                </TouchableOpacity>
              </View>

              {/* ── Body ── */}
              <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 22,
                    color: bodyColor,
                    fontFamily: 'Inter_400Regular',
                  }}
                >
                  {message}
                </Text>
              </View>

              {/* ── Footer ── */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: borderColor,
                  paddingHorizontal: 20,
                  paddingTop: 14,
                  paddingBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Cancel */}
                <TouchableOpacity
                  onPress={!isLoading ? onClose : undefined}
                  activeOpacity={0.6}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 10,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: cancelColor }}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>

                {/* Confirm */}
                <TouchableOpacity
                  onPress={!isLoading ? onConfirm : undefined}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: confirmBg,
                  }}
                >
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter_600SemiBold',
                      color: '#FFFFFF',
                    }}
                  >
                    {confirmLabel ?? t('confirm')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
