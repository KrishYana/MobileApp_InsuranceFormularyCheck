import React, { useState } from 'react';
import { View, Pressable, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { TouchTarget } from '../../theme/touchTarget';
import { AppIcon } from './Icon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ExpandableSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  rightContent?: React.ReactNode;
};

export function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
  rightContent,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { theme } = useTheme();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View>
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: TouchTarget.minimum,
          paddingVertical: Spacing.md,
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <Text style={{ ...Typography.title3, color: theme.textPrimary }}>{title}</Text>
        <View style={{ marginLeft: Spacing.sm }}>
          <AppIcon
            name={expanded ? 'expand' : 'chevronRight'}
            size={14}
            color={theme.textSecondary}
          />
        </View>
        {rightContent && <View style={{ marginLeft: 'auto' }}>{rightContent}</View>}
      </Pressable>
      {expanded && <View style={{ paddingBottom: Spacing.lg }}>{children}</View>}
    </View>
  );
}
