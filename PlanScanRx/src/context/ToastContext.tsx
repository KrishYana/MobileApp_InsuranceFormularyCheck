import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { View, Text, Pressable, Animated as RNAnimated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { Radius } from '../theme/radius';
import { NeuShadows } from '../theme/shadows';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  action?: { label: string; onPress: () => void };
};

type ShowToastParams = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onPress: () => void };
};

type ToastContextValue = { showToast: (params: ShowToastParams) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const dismiss = useCallback(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [fadeAnim]);

  const showToast = useCallback(
    (params: ShowToastParams) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const newToast: Toast = {
        id: Date.now().toString(),
        message: params.message,
        variant: params.variant ?? 'info',
        duration: params.duration ?? 3000,
        action: params.action,
      };
      setToast(newToast);
      fadeAnim.setValue(0);
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(dismiss, newToast.duration);
    },
    [fadeAnim, dismiss],
  );

  const variantColors: Record<ToastVariant, string> = {
    success: theme.success,
    error: theme.error,
    warning: theme.warning,
    info: theme.info,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <RNAnimated.View
          style={[
            {
              position: 'absolute',
              top: insets.top + Spacing.sm,
              left: Spacing.xl,
              right: Spacing.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: Spacing.lg,
              paddingHorizontal: Spacing.xl,
              borderRadius: Radius.base,
              borderLeftWidth: 4,
              borderLeftColor: variantColors[toast.variant],
              backgroundColor: theme.surface,
              opacity: fadeAnim,
              zIndex: 9999,
            },
            NeuShadows.extruded.dark,
          ]}>
          <Text
            style={{ ...Typography.label, color: theme.textPrimary, flex: 1, marginRight: Spacing.sm }}
            numberOfLines={2}>
            {toast.message}
          </Text>
          {toast.action && (
            <Pressable onPress={toast.action.onPress} hitSlop={8}>
              <Text style={{ ...Typography.label, fontWeight: '700', color: theme.accent }}>
                {toast.action.label}
              </Text>
            </Pressable>
          )}
        </RNAnimated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
