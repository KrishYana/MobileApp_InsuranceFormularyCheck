import React, { useState } from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { TouchTarget } from '../../theme/touchTarget';
import { Animation } from '../../theme/animation';
import { NeuSurface } from './NeuSurface';
import { NeuInset } from './NeuInset';

type TabItem = { id: string; label: string; badge?: number };

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
};

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const { theme } = useTheme();

  return (
    <NeuInset level="insetSmall" cornerRadius={Radius.full}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          padding: Spacing.xs,
          gap: Spacing.xs,
          alignItems: 'center',
        }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const inner = (
            <Pressable
              onPress={() => onTabChange(tab.id)}
              style={{
                minHeight: 36,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: Radius.full,
                backgroundColor: isActive ? theme.accent : theme.surface,
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <Text
                  style={{
                    ...Typography.label,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? theme.textInverse : theme.textSecondary,
                  }}>
                  {tab.label}
                </Text>
                {tab.badge != null && tab.badge > 0 && (
                  <View
                    style={{
                      backgroundColor: isActive ? theme.textInverse : theme.accent,
                      borderRadius: Radius.full,
                      minWidth: 18,
                      height: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: Spacing.xs,
                    }}>
                    <Text
                      style={{
                        ...Typography.badge,
                        color: isActive ? theme.accent : theme.textInverse,
                      }}>
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );

          if (isActive) {
            return (
              <NeuSurface key={tab.id} level="extrudedSmall" cornerRadius={Radius.full}>
                {inner}
              </NeuSurface>
            );
          }
          return <React.Fragment key={tab.id}>{inner}</React.Fragment>;
        })}
      </ScrollView>
    </NeuInset>
  );
}
