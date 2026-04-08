import React from 'react';
import { View, Text, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import StateSelectorBar from '../../components/composites/StateSelectorBar';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import {
  NeuSurface,
  NeuIconWell,
  ExpandableSection,
} from '../../components/primitives';

type HomeNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<HomeNav>();

  const handleNewLookup = () => {
    navigation.navigate('InsurerSelection');
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsTab');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Header row: State selector (left) + Settings gear (right) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: Spacing.xl,
          paddingVertical: Spacing.sm,
        }}>
        <View style={{ flex: 1 }}>
          <StateSelectorBar compact />
        </View>

        {/* Settings gear */}
        <Pressable
          onPress={handleSettingsPress}
          hitSlop={12}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: `${theme.accent}15`,
            justifyContent: 'center',
            alignItems: 'center',
          })}>
          <Text style={{ fontSize: 20 }}>{'\u2699\uFE0F'}</Text>
        </Pressable>
      </View>

      {/* Hero CTA */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: Spacing.xl,
        }}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.huge }}>
          <Text
            style={{
              ...Typography.body,
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: Spacing.xxl,
            }}>
            Check drug coverage across plans
          </Text>

          <Pressable
            onPress={handleNewLookup}
            style={({ pressed }) => ({
              width: '100%',
              paddingVertical: Spacing.xxxl,
              paddingHorizontal: Spacing.xxl,
              alignItems: 'center',
              borderRadius: Radius.container,
              backgroundColor: `${theme.accent}18`,
              borderWidth: 1.5,
              borderColor: `${theme.accent}30`,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
            accessibilityRole="button"
            accessibilityLabel="New Formulary Lookup">
            <NeuIconWell size={56}>
              <Text style={{ fontSize: 26 }}>{'\uD83D\uDC8A'}</Text>
            </NeuIconWell>
            <Text
              style={{
                ...Typography.title2,
                color: theme.textPrimary,
                marginTop: Spacing.xl,
              }}>
              New Formulary Lookup
            </Text>
            <Text
              style={{
                ...Typography.caption,
                color: theme.textSecondary,
                marginTop: Spacing.xs,
              }}>
              Insurer {'\u2192'} Plan {'\u2192'} Drug {'\u2192'} Coverage
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Saved Lookups — collapsed by default */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: insets.bottom + 100 }}>
        <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
          <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs }}>
            <ExpandableSection
              title="Saved Lookups"
              defaultExpanded={false}>
              <View
                style={{
                  paddingVertical: Spacing.lg,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    ...Typography.caption,
                    color: theme.textSecondary,
                    textAlign: 'center',
                  }}>
                  Save drug+plan combinations for quick access
                </Text>
              </View>
            </ExpandableSection>
          </View>
        </NeuSurface>
      </View>
    </View>
  );
}
