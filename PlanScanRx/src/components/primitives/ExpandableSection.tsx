import React, { useState } from 'react';
import { View, Pressable, Text, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { TouchTarget } from '../../theme/touchTarget';

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
          justifyContent: 'space-between',
          minHeight: TouchTarget.minimum,
          paddingVertical: Spacing.md,
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
          <Text style={{ ...Typography.title3, color: theme.textPrimary }}>{title}</Text>
          {rightContent}
        </View>
        <Text style={{ fontSize: 14, color: theme.textSecondary }}>
          {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>
      {expanded && <View style={{ paddingBottom: Spacing.lg }}>{children}</View>}
    </View>
  );
}
