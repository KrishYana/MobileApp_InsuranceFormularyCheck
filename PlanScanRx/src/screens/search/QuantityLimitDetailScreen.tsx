import React from 'react';
import { View, Text, ScrollView, StatusBar, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import {
  NeuSurface,
  NeuInset,
  NeuIconWell,
  EmptyState,
} from '../../components/primitives';

type Props = NativeStackScreenProps<SearchStackParamList, 'QuantityLimitDetail'>;

export default function QuantityLimitDetailScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { drugName, planName, quantityLimitDetail } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}>
        {/* Back button */}
        <View style={{ marginTop: Spacing.lg }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ alignSelf: 'flex-start' }}>
            <NeuSurface level="extrudedSmall" cornerRadius={Radius.full}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: Radius.full,
                  backgroundColor: theme.surface,
                  gap: Spacing.sm,
                }}>
                <Text style={{ ...Typography.body, color: theme.textAccent }}>{'← Back'}</Text>
              </View>
            </NeuSurface>
          </Pressable>
        </View>

        {/* Header */}
        <View style={{ marginTop: Spacing.xl }}>
          <Text
            style={{ ...Typography.title1, color: theme.textPrimary }}
            accessibilityRole="header">
            Quantity Limit Details
          </Text>
          <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
            {drugName} on {planName}
          </Text>
        </View>

        {/* Content */}
        {quantityLimitDetail ? (
          <>
            {/* Limit card */}
            <View style={{ marginTop: Spacing.xxl }}>
              <NeuSurface level="extruded" cornerRadius={Radius.container}>
                <View
                  style={{
                    padding: Spacing.xxl,
                    borderRadius: Radius.container,
                    backgroundColor: theme.surface,
                    borderLeftWidth: 5,
                    borderLeftColor: theme.statusQuantityLimit,
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg }}>
                    <NeuIconWell icon="⏱" size={48} iconColor={theme.statusQuantityLimit} />
                    <Text style={{ ...Typography.title3, color: theme.textPrimary, flex: 1 }}>
                      Quantity Limit
                    </Text>
                  </View>
                  <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, lineHeight: 24 }}>
                    {quantityLimitDetail}
                  </Text>
                </View>
              </NeuSurface>
            </View>

            {/* Exception callout */}
            <View style={{ marginTop: Spacing.xl }}>
              <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                <View
                  style={{
                    padding: Spacing.lg,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                  }}>
                  <Text style={{ ...Typography.label, color: theme.textSecondary, marginBottom: Spacing.xs }}>
                    Need a higher quantity?
                  </Text>
                  <Text style={{ ...Typography.caption, color: theme.textSecondary, lineHeight: 20 }}>
                    If a higher quantity is medically necessary, your prescriber can submit a
                    quantity limit exception through the plan's prior authorization process.
                    Contact {planName} for specific exception request procedures.
                  </Text>
                </View>
              </NeuInset>
            </View>
          </>
        ) : (
          <View style={{ marginTop: Spacing.xxl }}>
            <EmptyState
              icon="📋"
              headline="Quantity limit applies"
              description={`A quantity limit is applied to ${drugName} on this plan, but specific details are not available in our data. Contact ${planName} for details.`}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
