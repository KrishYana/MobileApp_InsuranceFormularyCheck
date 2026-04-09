import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface, Toggle, AppIcon } from '../../components/primitives';
import { useSettingsStore } from '../../stores/settingsStore';
import { useToast } from '../../context/ToastContext';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Notifications'>;

function Separator({ color }: { color: string }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color,
        opacity: 0.15,
        marginHorizontal: Spacing.lg,
      }}
    />
  );
}

export default function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const hasShownStub = useRef(false);

  const enabled = useSettingsStore((s) => s.notificationsEnabled);
  const formulary = useSettingsStore((s) => s.formularyAlerts);
  const priceChange = useSettingsStore((s) => s.priceChangeAlerts);
  const setEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setFormulary = useSettingsStore((s) => s.setFormularyAlerts);
  const setPriceChange = useSettingsStore((s) => s.setPriceChangeAlerts);

  const handleToggle = (setter: (v: boolean) => void, value: boolean) => {
    setter(value);
    if (!hasShownStub.current) {
      showToast({
        message: 'Push notifications require backend setup — preference saved locally',
        variant: 'info',
        duration: 3000,
      });
      hasShownStub.current = true;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
        }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <AppIcon name="back" size={16} color={theme.accent} />
            <Text style={{ ...Typography.body, color: theme.accent }}>Settings</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Notifications
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}>
        <NeuSurface level="extruded" cornerRadius={Radius.container}>
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
            <Toggle
              label="Push Notifications"
              description="Enable all push notifications"
              value={enabled}
              onValueChange={(v) => handleToggle(setEnabled, v)}
            />

            <Separator color={theme.shadowDark} />

            <Toggle
              label="Formulary Changes"
              description="Get notified when drug coverage changes for saved lookups"
              value={formulary}
              onValueChange={(v) => handleToggle(setFormulary, v)}
              disabled={!enabled}
            />

            <Separator color={theme.shadowDark} />

            <Toggle
              label="Price Change Alerts"
              description="Get notified about significant cost changes"
              value={priceChange}
              onValueChange={(v) => handleToggle(setPriceChange, v)}
              disabled={!enabled}
            />
          </View>
        </NeuSurface>
      </ScrollView>
    </View>
  );
}
