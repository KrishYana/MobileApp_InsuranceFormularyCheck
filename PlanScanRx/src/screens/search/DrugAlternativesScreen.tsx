import React, { useMemo } from 'react';
import { View, Text, ScrollView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { DrugAlternative } from '../../types/domain';
import type { ThemeTokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useAlternatives } from '../../hooks/queries/useAlternatives';
import { useAlternativeCoverage } from '../../hooks/queries/useAlternativeCoverage';
import {
  Button,
  Badge,
  NeuSurface,
  NeuInset,
  EmptyState,
  ErrorState,
  LoadingState,
  ExpandableSection,
  AppIcon,
} from '../../components/primitives';

type Props = NativeStackScreenProps<SearchStackParamList, 'DrugAlternatives'>;

const GROUP_CONFIG: Record<string, { label: string; order: number }> = {
  GENERIC_EQUIVALENT: { label: 'Generic Equivalents', order: 0 },
  THERAPEUTIC_ALTERNATIVE: { label: 'Therapeutic Alternatives', order: 1 },
  BIOSIMILAR: { label: 'Biosimilars', order: 2 },
};

function CoverageBadge({
  isLoading,
  isCovered,
  isError,
  theme,
}: {
  isLoading: boolean;
  isCovered: boolean | undefined;
  isError: boolean;
  theme: ThemeTokens;
}) {
  if (isLoading) {
    return <ActivityIndicator size="small" color={theme.accent} />;
  }

  if (isError || isCovered === undefined) {
    return <Badge variant="info" label="Unknown" size="sm" />;
  }

  return isCovered ? (
    <Badge
      variant="coverage"
      label="Covered"
      size="sm"
      color={theme.statusCovered}
      backgroundColor={theme.statusCoveredBg}
    />
  ) : (
    <Badge
      variant="coverage"
      label="Not Covered"
      size="sm"
      color={theme.statusNotCovered}
      backgroundColor={theme.statusNotCoveredBg}
    />
  );
}

export default function DrugAlternativesScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { drugId, planId, drugName } = route.params;

  const { data: alternatives, isLoading, isError, error, refetch } = useAlternatives(drugId, planId);

  // Parallel coverage queries for each alternative
  const coverageResults = useAlternativeCoverage(alternatives ?? [], planId);

  // Group alternatives by relationship type
  const groups = useMemo(() => {
    if (!alternatives) return [];

    const grouped: Record<string, DrugAlternative[]> = {};
    for (const alt of alternatives) {
      const type = alt.relationshipType;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(alt);
    }

    return Object.entries(grouped)
      .map(([type, alts]) => ({
        type,
        label: GROUP_CONFIG[type]?.label ?? type,
        order: GROUP_CONFIG[type]?.order ?? 99,
        alternatives: alts,
      }))
      .sort((a, b) => a.order - b.order);
  }, [alternatives]);

  // Detect all-not-covered state
  const allNotCovered = useMemo(() => {
    if (!planId || !alternatives?.length || coverageResults.length === 0) return false;
    return coverageResults.every((q) => q.isSuccess && !q.data?.isCovered);
  }, [planId, alternatives, coverageResults]);

  // Map from alternativeDrugId to coverage result index
  const coverageIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    if (alternatives) {
      alternatives.forEach((alt, i) => map.set(alt.alternativeDrugId, i));
    }
    return map;
  }, [alternatives]);

  // Loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <LoadingState variant="skeleton" layout="list" rows={6} />
      </View>
    );
  }

  // Error
  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <View style={{ padding: Spacing.xl, flex: 1, justifyContent: 'center' }}>
          <ErrorState
            variant="card"
            title={(error as any)?.displayMessage ?? 'Unable to load alternatives'}
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </View>
    );
  }

  // Empty
  if (!alternatives || alternatives.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.xl }}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                    <AppIcon name="back" size={16} color={theme.textAccent} />
                    <Text style={{ ...Typography.body, color: theme.textAccent }}>Back</Text>
                  </View>
                </View>
              </NeuSurface>
            </Pressable>
          </View>
          <EmptyState
            icon="pill"
            headline="No known alternatives"
            description={`We don't have alternative drug data for ${drugName} in our database.`}
          />
        </ScrollView>
      </View>
    );
  }

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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <AppIcon name="back" size={16} color={theme.textAccent} />
                  <Text style={{ ...Typography.body, color: theme.textAccent }}>Back</Text>
                </View>
              </View>
            </NeuSurface>
          </Pressable>
        </View>

        {/* Header */}
        <View style={{ marginTop: Spacing.xl }}>
          <Text
            style={{ ...Typography.title1, color: theme.textPrimary }}
            accessibilityRole="header">
            Alternatives for {drugName}
          </Text>
          {planId && (
            <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
              Showing coverage status on the current plan
            </Text>
          )}
        </View>

        {/* All-not-covered callout */}
        {allNotCovered && (
          <View style={{ marginTop: Spacing.xl }}>
            <NeuInset level="insetSmall" cornerRadius={Radius.base}>
              <View
                style={{
                  padding: Spacing.lg,
                  borderRadius: Radius.base,
                  backgroundColor: theme.surface,
                }}>
                <Text style={{ ...Typography.bodyMedium, color: theme.statusNotCovered, lineHeight: 22 }}>
                  None of the known alternatives are covered under this plan.
                </Text>
              </View>
            </NeuInset>
          </View>
        )}

        {/* Grouped sections */}
        <View style={{ marginTop: Spacing.xxl }}>
          {groups.map((group) => (
            <View key={group.type} style={{ marginBottom: Spacing.xl }}>
              <ExpandableSection
                title={group.label}
                defaultExpanded
                rightContent={
                  <Badge variant="count" label={String(group.alternatives.length)} size="sm" />
                }>
                <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
                  {group.alternatives.map((alt) => {
                    const idx = coverageIndexMap.get(alt.alternativeDrugId);
                    const coverageQuery = idx != null ? coverageResults[idx] : undefined;
                    const drug = alt.alternativeDrug;
                    const altDrugName = drug?.drugName ?? `Alternative #${alt.alternativeDrugId}`;
                    const details = [drug?.strength, drug?.doseForm, drug?.route]
                      .filter(Boolean)
                      .join(' · ');

                    return (
                      <NeuSurface key={alt.alternativeId} level="extrudedSmall" cornerRadius={Radius.base}>
                        <View
                          style={{
                            padding: Spacing.lg,
                            borderRadius: Radius.base,
                            backgroundColor: theme.surface,
                          }}>
                          {/* Drug info + coverage badge */}
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ ...Typography.title3, color: theme.textPrimary }}>
                                {altDrugName}
                              </Text>
                              {details ? (
                                <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
                                  {details}
                                </Text>
                              ) : null}
                            </View>
                            {planId && coverageQuery && (
                              <CoverageBadge
                                isLoading={coverageQuery.isLoading}
                                isCovered={coverageQuery.data?.isCovered}
                                isError={coverageQuery.isError}
                                theme={theme}
                              />
                            )}
                          </View>

                          {/* Notes */}
                          {alt.notes && (
                            <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.sm }}>
                              {alt.notes}
                            </Text>
                          )}

                          {/* View Full Coverage button */}
                          {planId && (
                            <View style={{ marginTop: Spacing.md }}>
                              <Button
                                variant="tertiary"
                                size="sm"
                                label="View Full Coverage"
                                onPress={() =>
                                  navigation.navigate('CoverageResult', {
                                    planId,
                                    drugId: alt.alternativeDrugId,
                                  })
                                }
                              />
                            </View>
                          )}
                        </View>
                      </NeuSurface>
                    );
                  })}
                </View>
              </ExpandableSection>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
