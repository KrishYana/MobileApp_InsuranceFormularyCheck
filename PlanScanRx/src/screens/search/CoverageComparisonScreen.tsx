import React, { useMemo } from 'react';
import { View, Text, FlatList, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useCoverageMulti } from '../../hooks/queries/useCoverageMulti';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NeuInset,
} from '../../components/primitives';
import { ComparisonRow } from '../../components/composites/ComparisonRow';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'CoverageComparison'>;

export default function CoverageComparisonScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { planIds, drugId } = route.params;

  const { data: entries, isLoading, isError, error, refetch } = useCoverageMulti(planIds, drugId);

  const summary = useMemo(() => {
    if (!entries) return null;
    const covered = entries.filter((e) => e.isCovered).length;
    return { covered, total: entries.length };
  }, [entries]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <StateSelectorBar />
        <LoadingState variant="skeleton" rows={4} layout="card" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <StateSelectorBar />
        <View style={{ padding: Spacing.xl, flex: 1, justifyContent: 'center' }}>
          <ErrorState
            variant="card"
            title={(error as any)?.displayMessage ?? 'Unable to compare coverage'}
            onRetry={() => refetch()}
          />
        </View>
      </View>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <StateSelectorBar />
        <EmptyState icon="📊" headline="No coverage data available" description="Formulary data is not available for the selected plans." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Coverage Comparison
        </Text>
      </View>

      {/* Summary bar */}
      {summary && (
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
          <NeuInset level="insetSmall" cornerRadius={Radius.base}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: Spacing.lg,
                borderRadius: Radius.base,
                backgroundColor: theme.surface,
              }}>
              <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
                Covered by {summary.covered} of {summary.total} plans
              </Text>
              {/* Progress bar */}
              <View
                style={{
                  width: 60,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.statusNotCoveredBg,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    width: `${(summary.covered / summary.total) * 100}%`,
                    height: '100%',
                    backgroundColor: theme.statusCovered,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </NeuInset>
        </View>
      )}

      {/* Plan list */}
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.entryId ?? item.planId)}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => (
          <ComparisonRow
            entry={item}
            planName={`Plan #${item.planId}`}
            onPress={() =>
              navigation.navigate('CoverageResult', {
                planId: item.planId,
                drugId,
              })
            }
          />
        )}
      />
    </View>
  );
}
