import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { GuestGate } from '../../components/composites/GuestGate';
import {
  NeuSurface,
  NeuInset,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/primitives';
import { useInsightsSummary } from '../../hooks/queries/useInsightsSummary';
import { useInsightsTrends } from '../../hooks/queries/useInsightsTrends';
import type { TrendPoint, TopDrug, TopInsurer, TopPlan } from '../../types/domain';
import type { ThemeTokens } from '../../theme/tokens';

// --- Sub-components ---

function HeroSection({
  totalLookups,
  coverageSuccessRate,
  theme,
}: {
  totalLookups: number;
  coverageSuccessRate: number;
  theme: ThemeTokens;
}) {
  return (
    <NeuSurface level="extruded" cornerRadius={Radius.container}>
      <View
        style={{
          padding: Spacing.xxl,
          borderRadius: Radius.container,
          backgroundColor: theme.surface,
          alignItems: 'center',
        }}>
        <Text
          style={{
            ...Typography.display,
            color: theme.accent,
          }}
          accessibilityLabel={`${totalLookups} total lookups`}>
          {totalLookups.toLocaleString()}
        </Text>
        <Text
          style={{
            ...Typography.label,
            color: theme.textSecondary,
            marginTop: Spacing.xs,
          }}>
          Total Lookups
        </Text>

        <View
          style={{
            width: '60%',
            height: 1,
            backgroundColor: theme.shadowDark,
            opacity: 0.12,
            marginVertical: Spacing.xl,
          }}
        />

        <Text
          style={{
            ...Typography.title1,
            color: theme.statusCovered,
          }}
          accessibilityLabel={`${Math.round(coverageSuccessRate)}% coverage success rate`}>
          {Math.round(coverageSuccessRate)}%
        </Text>
        <Text
          style={{
            ...Typography.label,
            color: theme.textSecondary,
            marginTop: Spacing.xs,
          }}>
          Coverage Success Rate
        </Text>
      </View>
    </NeuSurface>
  );
}

function RankedListSection({
  title,
  items,
  theme,
}: {
  title: string;
  items: { name: string; count: number }[];
  theme: ThemeTokens;
}) {
  if (items.length === 0) return null;

  return (
    <View>
      <Text
        style={{
          ...Typography.title2,
          color: theme.textPrimary,
          marginBottom: Spacing.lg,
        }}
        accessibilityRole="header">
        {title}
      </Text>
      <NeuInset level="inset" cornerRadius={Radius.base}>
        <View
          style={{
            padding: Spacing.lg,
            borderRadius: Radius.base,
            backgroundColor: theme.surface,
          }}>
          {items.slice(0, 5).map((item, index) => (
            <View
              key={`${title}-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: Spacing.md,
                borderBottomWidth: index < items.length - 1 && index < 4 ? 1 : 0,
                borderBottomColor: `${theme.shadowDark}15`,
              }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: theme.accentLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: Spacing.md,
                }}>
                <Text
                  style={{
                    ...Typography.badge,
                    color: theme.accent,
                  }}>
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{
                  ...Typography.body,
                  color: theme.textPrimary,
                  flex: 1,
                }}
                numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={{
                  ...Typography.label,
                  color: theme.textSecondary,
                }}>
                {item.count.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </NeuInset>
    </View>
  );
}

function WeeklyTrendsChart({
  dataPoints,
  theme,
}: {
  dataPoints: TrendPoint[];
  theme: ThemeTokens;
}) {
  // Take the last 12 data points for display
  const points = dataPoints.slice(-12);
  const maxCount = Math.max(...points.map((p) => p.lookupCount), 1);

  if (points.length === 0) return null;

  return (
    <View>
      <Text
        style={{
          ...Typography.title2,
          color: theme.textPrimary,
          marginBottom: Spacing.lg,
        }}
        accessibilityRole="header">
        Weekly Trends
      </Text>
      <NeuInset level="inset" cornerRadius={Radius.base}>
        <View
          style={{
            padding: Spacing.lg,
            borderRadius: Radius.base,
            backgroundColor: theme.surface,
          }}>
          {/* Y-axis max label */}
          <Text
            style={{
              ...Typography.caption,
              color: theme.textSecondary,
              marginBottom: Spacing.sm,
            }}>
            {maxCount.toLocaleString()} lookups
          </Text>

          {/* Bars */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              height: 120,
              gap: Spacing.xs,
            }}
            accessibilityLabel={`Bar chart showing lookup trends over ${points.length} weeks`}>
            {points.map((point, index) => {
              const barHeight = Math.max((point.lookupCount / maxCount) * 100, 4);
              const isLatest = index === points.length - 1;

              return (
                <View
                  key={point.date}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                  }}
                  accessibilityLabel={`Week of ${formatWeekLabel(point.date)}: ${point.lookupCount} lookups`}>
                  <View
                    style={{
                      width: '70%',
                      height: barHeight,
                      backgroundColor: isLatest ? theme.accent : theme.accentLight,
                      borderRadius: Radius.inner / 2,
                      minHeight: 4,
                    }}
                  />
                </View>
              );
            })}
          </View>

          {/* X-axis labels — show first, middle, and last */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: Spacing.sm,
            }}>
            <Text style={{ ...Typography.caption, color: theme.textSecondary, fontSize: 10 }}>
              {formatWeekLabel(points[0]?.date)}
            </Text>
            {points.length > 2 && (
              <Text style={{ ...Typography.caption, color: theme.textSecondary, fontSize: 10 }}>
                {formatWeekLabel(points[Math.floor(points.length / 2)]?.date)}
              </Text>
            )}
            <Text style={{ ...Typography.caption, color: theme.textSecondary, fontSize: 10 }}>
              {formatWeekLabel(points[points.length - 1]?.date)}
            </Text>
          </View>
        </View>
      </NeuInset>
    </View>
  );
}

function formatWeekLabel(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// --- Main Screen ---

function InsightsContent() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErr,
    refetch: refetchSummary,
  } = useInsightsSummary();

  const {
    data: trends,
    isLoading: trendsLoading,
    isError: trendsError,
    refetch: refetchTrends,
  } = useInsightsTrends();

  const isLoading = summaryLoading || trendsLoading;
  const isError = summaryError && trendsError;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchTrends()]);
    setRefreshing(false);
  }, [refetchSummary, refetchTrends]);

  const topDrugsItems = useMemo(
    () =>
      (summary?.topDrugs ?? []).map((d: TopDrug) => ({
        name: d.drugName,
        count: d.searchCount,
      })),
    [summary?.topDrugs],
  );

  const topInsurersItems = useMemo(
    () =>
      (summary?.topInsurers ?? []).map((i: TopInsurer) => ({
        name: i.insurerName,
        count: i.count,
      })),
    [summary?.topInsurers],
  );

  const topPlansItems = useMemo(
    () =>
      (summary?.topPlans ?? []).map((p: TopPlan) => ({
        name: p.planName,
        count: p.count,
      })),
    [summary?.topPlans],
  );

  // Loading
  if (isLoading && !summary) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <LoadingState variant="skeleton" layout="card" rows={4} />
      </View>
    );
  }

  // Full error — both failed and no cached data
  if (isError && !summary) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <View style={{ padding: Spacing.xl, flex: 1, justifyContent: 'center' }}>
          <ErrorState
            variant="fullscreen"
            title={(summaryErr as any)?.displayMessage ?? 'Unable to load insights'}
            description="Check your connection and try again."
            onRetry={onRefresh}
          />
        </View>
      </View>
    );
  }

  // Empty — data returned but nothing to show
  if (summary && summary.totalLookups === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
          }>
          <Text
            style={{
              ...Typography.title1,
              color: theme.textPrimary,
              marginTop: Spacing.xxl,
              marginBottom: Spacing.xl,
            }}
            accessibilityRole="header">
            Insights
          </Text>
          <EmptyState
            icon="📊"
            headline="No insights yet"
            description="Start searching for drug coverage to see trends, top drugs, and success rates here."
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }>
        {/* Screen title */}
        <Text
          style={{
            ...Typography.title1,
            color: theme.textPrimary,
            marginTop: Spacing.xxl,
            marginBottom: Spacing.xl,
          }}
          accessibilityRole="header">
          Insights
        </Text>

        {/* Hero stats */}
        {summary && (
          <HeroSection
            totalLookups={summary.totalLookups}
            coverageSuccessRate={summary.coverageSuccessRate}
            theme={theme}
          />
        )}

        {/* Weekly trends chart */}
        {trends && trends.dataPoints.length > 0 && (
          <View style={{ marginTop: Spacing.xxl }}>
            <WeeklyTrendsChart dataPoints={trends.dataPoints} theme={theme} />
          </View>
        )}

        {/* Trends error — partial failure shown inline */}
        {trendsError && !trends && (
          <View style={{ marginTop: Spacing.xxl }}>
            <ErrorState
              variant="card"
              title="Unable to load trends"
              description="Pull down to try again."
              onRetry={() => refetchTrends()}
            />
          </View>
        )}

        {/* Top drugs */}
        {topDrugsItems.length > 0 && (
          <View style={{ marginTop: Spacing.xxl }}>
            <RankedListSection title="Top Drugs" items={topDrugsItems} theme={theme} />
          </View>
        )}

        {/* Top insurers */}
        {topInsurersItems.length > 0 && (
          <View style={{ marginTop: Spacing.xxl }}>
            <RankedListSection title="Top Insurers" items={topInsurersItems} theme={theme} />
          </View>
        )}

        {/* Top plans */}
        {topPlansItems.length > 0 && (
          <View style={{ marginTop: Spacing.xxl }}>
            <RankedListSection title="Top Plans" items={topPlansItems} theme={theme} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function InsightsScreen() {
  return (
    <GuestGate feature="Insights">
      <InsightsContent />
    </GuestGate>
  );
}
