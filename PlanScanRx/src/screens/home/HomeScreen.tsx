import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';
import StateSelectorBar from '../../components/composites/StateSelectorBar';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import {
  Button,
  NeuSurface,
  NeuInset,
  NeuIconWell,
  EmptyState,
} from '../../components/primitives';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const handleNewLookup = () => {
    navigation.navigate('SearchTab');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}>

        {/* Hero / CTA */}
        <View style={{ alignItems: 'center', paddingTop: Spacing.xxxl, paddingBottom: Spacing.xxl }}>
          <NeuIconWell icon="💊" size={72} />
          <Text
            style={{
              ...Typography.title1,
              color: theme.textPrimary,
              marginTop: Spacing.xxl,
              marginBottom: Spacing.sm,
            }}>
            PlanScanRx
          </Text>
          <Text
            style={{
              ...Typography.body,
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: Spacing.xxl,
            }}>
            Check drug formulary coverage across insurance plans
          </Text>
          <Button
            variant="primary"
            size="lg"
            label="New Formulary Lookup"
            onPress={handleNewLookup}
            fullWidth
          />
        </View>

        {/* Recent Searches section */}
        <View style={{ marginBottom: Spacing.xxl }}>
          <Text style={{ ...Typography.title3, color: theme.textPrimary, marginBottom: Spacing.lg }}>
            Recent Searches
          </Text>
          <NeuInset level="insetSmall" cornerRadius={Radius.base}>
            <View
              style={{
                padding: Spacing.xxl,
                borderRadius: Radius.base,
                backgroundColor: theme.surface,
                alignItems: 'center',
              }}>
              <Text style={{ ...Typography.body, color: theme.textSecondary, textAlign: 'center' }}>
                Your recent searches will appear here
              </Text>
            </View>
          </NeuInset>
        </View>

        {/* Saved Lookups section */}
        <View style={{ marginBottom: Spacing.xxl }}>
          <Text style={{ ...Typography.title3, color: theme.textPrimary, marginBottom: Spacing.lg }}>
            Saved Lookups
          </Text>
          <NeuInset level="insetSmall" cornerRadius={Radius.base}>
            <View
              style={{
                padding: Spacing.xxl,
                borderRadius: Radius.base,
                backgroundColor: theme.surface,
                alignItems: 'center',
              }}>
              <Text style={{ ...Typography.body, color: theme.textSecondary, textAlign: 'center' }}>
                Save drug+plan combinations for quick access
              </Text>
            </View>
          </NeuInset>
        </View>

      </ScrollView>
    </View>
  );
}
