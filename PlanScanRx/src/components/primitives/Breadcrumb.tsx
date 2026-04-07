import React, { useState } from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Animation } from '../../theme/animation';
import { NeuSurface } from './NeuSurface';

type BreadcrumbItem = { label: string; icon?: React.ReactNode };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  onItemPress: (index: number) => void;
};

export function Breadcrumb({ items, onItemPress }: BreadcrumbProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
        alignItems: 'center',
      }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Text style={{ ...Typography.caption, color: theme.textSecondary }}>›</Text>
          )}
          <NeuSurface level="extrudedSmall" cornerRadius={Radius.full}>
            <Pressable
              onPress={() => onItemPress(index)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.xs,
                backgroundColor: theme.surface,
                borderRadius: Radius.full,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
              }}
              accessibilityRole="link"
              accessibilityLabel={`Go back to ${item.label}`}>
              {item.icon}
              <Text style={{ ...Typography.label, color: theme.textAccent }}>{item.label}</Text>
            </Pressable>
          </NeuSurface>
        </React.Fragment>
      ))}
    </ScrollView>
  );
}
