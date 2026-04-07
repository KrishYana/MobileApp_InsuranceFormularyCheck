import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, SafeAreaView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { NeuSurface } from './NeuSurface';
import { NeuInset } from './NeuInset';

type PickerOption = { value: string; label: string; disabled?: boolean };

type PickerProps = {
  label: string;
  value: string | null;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export function Picker({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  error,
}: PickerProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={{ gap: Spacing.sm }}>
      <Text style={{ ...Typography.label, color: theme.textSecondary }}>{label}</Text>

      <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
        <Pressable
          onPress={() => setOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: TouchTarget.recommended,
            backgroundColor: theme.surface,
            borderRadius: Radius.base,
            paddingHorizontal: Spacing.xl,
          }}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${selectedOption?.label ?? placeholder}`}>
          <Text
            style={{
              ...Typography.body,
              color: selectedOption ? theme.textPrimary : theme.textDisabled,
            }}>
            {selectedOption?.label ?? placeholder}
          </Text>
          <Text style={{ color: theme.textSecondary }}>▼</Text>
        </Pressable>
      </NeuSurface>

      {error && <Text style={{ ...Typography.caption, color: theme.error }}>{error}</Text>}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: Spacing.xxl,
              paddingVertical: Spacing.xl,
            }}>
            <Text style={{ ...Typography.title2, color: theme.textPrimary }}>{label}</Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={{ ...Typography.bodyBold, color: theme.textAccent }}>Done</Text>
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              const row = (
                <Pressable
                  onPress={() => {
                    if (!item.disabled) {
                      onChange(item.value);
                      setOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.xl,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                    opacity: item.disabled ? 0.5 : 1,
                  }}>
                  <Text style={{ ...Typography.body, color: theme.textPrimary }}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Text style={{ color: theme.accent, fontSize: 18 }}>✓</Text>
                  )}
                </Pressable>
              );

              if (isSelected) {
                return <NeuInset level="insetSmall" cornerRadius={Radius.base}>{row}</NeuInset>;
              }
              return <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>{row}</NeuSurface>;
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
