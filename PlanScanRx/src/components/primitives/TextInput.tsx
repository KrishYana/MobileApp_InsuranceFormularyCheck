import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  Pressable,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { NeuInset } from './NeuInset';

type TextInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
  maxLength?: number;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry,
  keyboardType,
  clearable = false,
  leftIcon,
  maxLength,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  autoCapitalize,
}: TextInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: Spacing.sm }}>
      {label && (
        <Text style={{ ...Typography.label, color: theme.textSecondary }}>
          {label}
        </Text>
      )}

      <NeuInset
        level={isFocused ? 'insetDeep' : 'inset'}
        cornerRadius={Radius.base}
        focused={isFocused}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 52,
            paddingHorizontal: Spacing.lg,
            gap: Spacing.sm,
          }}>
          {leftIcon}

          <RNTextInput
            style={{
              flex: 1,
              ...Typography.body,
              color: theme.textPrimary,
              paddingVertical: Spacing.lg,
            }}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.textDisabled}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoFocus={autoFocus}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize={autoCapitalize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityLabel={label ?? placeholder}
          />

          {clearable && value.length > 0 && (
            <Pressable
              onPress={() => onChangeText('')}
              hitSlop={8}
              accessibilityLabel="Clear input">
              <Text style={{ ...Typography.body, color: theme.textSecondary }}>✕</Text>
            </Pressable>
          )}
        </View>
      </NeuInset>

      {error && (
        <Text
          style={{ ...Typography.caption, color: theme.error }}
          accessibilityRole="alert">
          {error}
        </Text>
      )}
      {!error && helperText && (
        <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
          {helperText}
        </Text>
      )}
    </View>
  );
}
