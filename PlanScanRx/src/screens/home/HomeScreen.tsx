import React from 'react';
import { View, Text, Pressable, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import StateSelectorBar from '../../components/composites/StateSelectorBar';
import { ArticleCard } from '../../components/composites/ArticleCard';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import {
  NeuSurface,
  ExpandableSection,
  AppIcon,
} from '../../components/primitives';
import { useArticles } from '../../hooks/queries/useArticles';

type HomeNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<HomeNav>();
  const { data: articles } = useArticles();

  const handleNewLookup = () => {
    navigation.navigate('InsurerSelection');
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsTab');
  };

  const handleInsightsPress = () => {
    navigation.navigate('InsightsTab');
  };

  const handleSeeAllArticles = () => {
    navigation.navigate('DiscoverTab');
  };

  // Show up to 3 articles on the home dashboard
  const previewArticles = articles?.slice(0, 3) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Header: State selector (left) + Settings gear (right) */}
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
          <AppIcon name="settings" size={20} color={theme.accent} />
        </Pressable>
      </View>

      {/* Scrollable dashboard */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}>

        {/* 1. New Formulary Lookup CTA */}
        <Pressable
          onPress={handleNewLookup}
          style={({ pressed }) => ({
            paddingVertical: Spacing.xxl,
            paddingHorizontal: Spacing.xxl,
            alignItems: 'center',
            borderRadius: Radius.container,
            backgroundColor: `${theme.accent}18`,
            borderWidth: 1.5,
            borderColor: `${theme.accent}30`,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            marginTop: Spacing.lg,
          })}
          accessibilityRole="button"
          accessibilityLabel="New Formulary Lookup">
          <AppIcon name="pill" size={36} color={theme.accent} />
          <Text
            style={{
              ...Typography.title2,
              color: theme.textPrimary,
              marginTop: Spacing.md,
            }}>
            New Formulary Lookup
          </Text>
        </Pressable>

        {/* 2. Discover preview */}
        {previewArticles.length > 0 && (
          <View style={{ marginTop: Spacing.xxxl }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: Spacing.lg,
              }}>
              <Text style={{ ...Typography.title3, color: theme.textPrimary }}>
                Discover
              </Text>
              <Pressable onPress={handleSeeAllArticles} hitSlop={8}>
                <Text style={{ ...Typography.label, color: theme.accent }}>
                  See All
                </Text>
              </Pressable>
            </View>
            <View style={{ gap: Spacing.lg }}>
              {previewArticles.map((article) => (
                <ArticleCard key={article.articleId} article={article} />
              ))}
            </View>
          </View>
        )}

        {/* 3. Insights button */}
        <Pressable
          onPress={handleInsightsPress}
          style={({ pressed }) => ({
            paddingVertical: Spacing.xxl,
            paddingHorizontal: Spacing.xxl,
            alignItems: 'center',
            borderRadius: Radius.container,
            backgroundColor: `${theme.teal}18`,
            borderWidth: 1.5,
            borderColor: `${theme.teal}30`,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            marginTop: Spacing.xxxl,
          })}
          accessibilityRole="button"
          accessibilityLabel="View Insights">
          <AppIcon name="chart" size={36} color={theme.teal} />
          <Text
            style={{
              ...Typography.title2,
              color: theme.textPrimary,
              marginTop: Spacing.md,
            }}>
            View Insights
          </Text>
        </Pressable>

        {/* 4. Saved Lookups -- collapsed */}
        <View style={{ marginTop: Spacing.xxxl }}>
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
      </ScrollView>
    </View>
  );
}
