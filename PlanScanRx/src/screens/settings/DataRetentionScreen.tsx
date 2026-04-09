import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface, NeuInset, Button, AppIcon } from '../../components/primitives';
import { useSettingsStore } from '../../stores/settingsStore';
import { useToast } from '../../context/ToastContext';

type Props = NativeStackScreenProps<SettingsStackParamList, 'DataRetention'>;
type RetentionPeriod = 'forever' | '90days' | '30days' | 'off';

const retentionOptions: { value: RetentionPeriod; label: string }[] = [
  { value: 'forever', label: 'Forever' },
  { value: '90days', label: '90 Days' },
  { value: '30days', label: '30 Days' },
  { value: 'off', label: 'Do not keep' },
];

function RetentionPicker({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: RetentionPeriod;
  onValueChange: (v: RetentionPeriod) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ paddingVertical: Spacing.md }}>
      <Text
        style={{
          ...Typography.bodyMedium,
          color: theme.textPrimary,
          marginBottom: Spacing.md,
        }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {retentionOptions.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onValueChange(opt.value)}
              style={{ flex: 1 }}>
              {selected ? (
                <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                  <View
                    style={{
                      paddingVertical: Spacing.sm,
                      alignItems: 'center',
                      borderRadius: Radius.base,
                    }}>
                    <Text
                      style={{
                        ...Typography.caption,
                        color: theme.accent,
                        fontWeight: '700',
                      }}>
                      {opt.label}
                    </Text>
                  </View>
                </NeuInset>
              ) : (
                <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
                  <View
                    style={{
                      paddingVertical: Spacing.sm,
                      alignItems: 'center',
                      borderRadius: Radius.base,
                      backgroundColor: theme.surface,
                    }}>
                    <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
                      {opt.label}
                    </Text>
                  </View>
                </NeuSurface>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function DataRetentionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const historyRetention = useSettingsStore((s) => s.searchHistoryRetention);
  const savedRetention = useSettingsStore((s) => s.savedLookupsRetention);
  const setHistoryRetention = useSettingsStore((s) => s.setSearchHistoryRetention);
  const setSavedRetention = useSettingsStore((s) => s.setSavedLookupsRetention);

  const confirmClear = (label: string) => {
    Alert.alert(
      `Clear ${label}?`,
      `This will permanently delete all ${label.toLowerCase()}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () =>
            showToast({ message: `Clear ${label.toLowerCase()} coming soon`, variant: 'info' }),
        },
      ],
    );
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
          Data & Storage
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}>
        {/* Search History */}
        <NeuSurface level="extruded" cornerRadius={Radius.container}>
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
            <RetentionPicker
              label="Keep search history for"
              value={historyRetention}
              onValueChange={(v) => {
                setHistoryRetention(v);
                showToast({ message: 'Preference saved', variant: 'success' });
              }}
            />
            <View style={{ marginTop: Spacing.md }}>
              <Button
                variant="destructive"
                size="sm"
                label="Clear Search History"
                onPress={() => confirmClear('Search History')}
              />
            </View>
          </View>
        </NeuSurface>

        {/* Saved Lookups */}
        <View style={{ marginTop: Spacing.xxl }}>
          <NeuSurface level="extruded" cornerRadius={Radius.container}>
            <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
              <RetentionPicker
                label="Keep saved lookups for"
                value={savedRetention}
                onValueChange={(v) => {
                  setSavedRetention(v);
                  showToast({ message: 'Preference saved', variant: 'success' });
                }}
              />
              <View style={{ marginTop: Spacing.md }}>
                <Button
                  variant="destructive"
                  size="sm"
                  label="Clear Saved Lookups"
                  onPress={() => confirmClear('Saved Lookups')}
                />
              </View>
            </View>
          </NeuSurface>
        </View>
      </ScrollView>
    </View>
  );
}
