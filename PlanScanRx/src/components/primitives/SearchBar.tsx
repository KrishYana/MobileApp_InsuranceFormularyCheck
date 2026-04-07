import React, { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuInset } from './NeuInset';

type SearchBarProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  error?: string;
};

export function SearchBar({
  placeholder,
  value,
  onChangeText,
  onClear,
  onSubmit,
  autoFocus = false,
  error,
}: SearchBarProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: Spacing.xs }}>
      <NeuInset
        level={isFocused ? 'insetDeep' : 'inset'}
        cornerRadius={Radius.base}
        focused={isFocused}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 52,
            paddingHorizontal: Spacing.lg,
            gap: Spacing.sm,
          }}>
          <Text style={{ fontSize: 16, color: theme.textSecondary }}>🔍</Text>
          <TextInput
            style={{
              flex: 1,
              ...Typography.body,
              color: theme.textPrimary,
              paddingVertical: 0,
            }}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.textDisabled}
            autoFocus={autoFocus}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
            autoCapitalize="words"
            autoCorrect={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityLabel={placeholder}
          />
          {value.length > 0 && (
            <Pressable onPress={onClear} hitSlop={8} accessibilityLabel="Clear search">
              <Text style={{ fontSize: 16, color: theme.textSecondary }}>✕</Text>
            </Pressable>
          )}
        </View>
      </NeuInset>
      {error && (
        <Text
          style={{ ...Typography.caption, color: theme.error, paddingLeft: Spacing.xs }}
          accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}
