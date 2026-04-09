import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface, NeuIconWell, AppIcon } from '../../components/primitives';
import { SettingsRow } from '../../components/composites/SettingsRow';
import { useToast } from '../../context/ToastContext';

type Props = NativeStackScreenProps<SettingsStackParamList, 'AboutLegal'>;

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

export default function AboutLegalScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const handleStub = (label: string) => {
    showToast({ message: `${label} coming soon`, variant: 'info' });
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

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}>
        {/* App Info */}
        <NeuSurface level="extruded" cornerRadius={Radius.container}>
          <View style={{ alignItems: 'center', paddingVertical: Spacing.xxxl }}>
            <NeuIconWell icon="pill" size={64} />
            <Text
              style={{
                ...Typography.title2,
                color: theme.textPrimary,
                marginTop: Spacing.lg,
              }}>
              PlanScanRx
            </Text>
            <Text
              style={{
                ...Typography.caption,
                color: theme.textSecondary,
                marginTop: Spacing.xs,
              }}>
              Version 0.1.0
            </Text>
          </View>
        </NeuSurface>

        {/* Legal */}
        <View style={{ marginTop: Spacing.xxl }}>
          <NeuSurface level="extruded" cornerRadius={Radius.container}>
            <View style={{ paddingVertical: Spacing.sm }}>
              <SettingsRow
                icon="document"
                label="Terms of Service"
                onPress={() => handleStub('Terms of Service')}
              />
              <Separator color={theme.shadowDark} />
              <SettingsRow
                icon="lock"
                label="Privacy Policy"
                onPress={() => handleStub('Privacy Policy')}
              />
              <Separator color={theme.shadowDark} />
              <SettingsRow
                icon="document"
                label="Open Source Licenses"
                onPress={() => handleStub('Open Source Licenses')}
              />
            </View>
          </NeuSurface>
        </View>

        {/* Footer */}
        <Text
          style={{
            ...Typography.caption,
            color: theme.textSecondary,
            textAlign: 'center',
            marginTop: Spacing.xxxl,
          }}>
          {'\u00A9'} 2026 PlanScanRx. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}
