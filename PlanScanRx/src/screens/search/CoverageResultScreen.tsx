import React from 'react';
import { View, Text, ScrollView, StatusBar, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useCoverage } from '../../hooks/queries/useCoverage';
import {
  Button,
  NeuSurface,
  NeuInset,
  NeuIconWell,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/primitives';
import { RestrictionBadgeRow } from '../../components/composites/RestrictionBadgeRow';
import { TierDisplay } from '../../components/composites/TierDisplay';
import { CostDisplay } from '../../components/composites/CostDisplay';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'CoverageResult'>;

export default function CoverageResultScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { planId, drugId } = route.params;

  const { data: entry, isLoading, isError, error, refetch } = useCoverage(planId, drugId);

  const handleViewAlternatives = () => {
    navigation.navigate('DrugAlternatives', {
      drugId,
      planId,
      drugName: entry?.drugId ? `Drug #${drugId}` : 'this drug',
    });
  };

  const handleShare = async () => {
    if (!entry) return;
    const status = entry.isCovered ? 'COVERED' : 'NOT COVERED';
    const tier = entry.tierName ? ` — ${entry.tierName}` : '';
    await Share.share({
      message: `PlanScanRx: Drug #${drugId} is ${status}${tier} on Plan #${planId}.`,
    });
  };

  // Loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <StateSelectorBar />
        <LoadingState variant="skeleton" layout="detail" />
      </View>
    );
  }

  // Error (C2)
  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <StateSelectorBar />
        <View style={{ padding: Spacing.xl, flex: 1, justifyContent: 'center' }}>
          <ErrorState
            variant="card"
            title={(error as any)?.displayMessage ?? 'Unable to retrieve coverage info'}
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </View>
    );
  }

  // Not found (B2)
  if (!entry) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <StateSelectorBar />
        <EmptyState
          icon="?"
          headline="Not Found on Formulary"
          description="We don't have formulary data for this drug on this plan. The drug may not be covered, or our data doesn't include it yet."
          ctaLabel="View Alternatives"
          onCtaPress={handleViewAlternatives}
        />
      </View>
    );
  }

  const isCovered = entry.isCovered;
  const hasRestrictions = entry.priorAuthRequired || entry.stepTherapy || entry.quantityLimit;

  // Header text
  const statusText = isCovered
    ? hasRestrictions
      ? 'COVERED — Restrictions Apply'
      : 'COVERED'
    : 'NOT COVERED';

  const statusColor = isCovered ? theme.statusCovered : theme.statusNotCovered;
  const statusBg = isCovered ? theme.statusCoveredBg : theme.statusNotCoveredBg;
  const statusIcon = isCovered ? '✓' : '✗';

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}>

        {/* Status card */}
        <View style={{ marginTop: Spacing.lg }} />
        <NeuSurface level="extruded" cornerRadius={Radius.container}>
          <View
            style={{
              padding: Spacing.xxl,
              borderRadius: Radius.container,
              backgroundColor: theme.surface,
              borderLeftWidth: 5,
              borderLeftColor: statusColor,
            }}>
            {/* Status header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: statusBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 22, color: statusColor, fontWeight: '700' }}>{statusIcon}</Text>
              </View>
              <Text style={{ ...Typography.title2, color: statusColor, flex: 1 }}>
                {statusText}
              </Text>
            </View>

            {/* Tier display (covered only) */}
            {isCovered && entry.tierLevel && (
              <View style={{ marginBottom: Spacing.lg }}>
                <TierDisplay tierLevel={entry.tierLevel} tierName={entry.tierName} />
              </View>
            )}

            {/* Cost display (covered only) */}
            {isCovered && (
              <View style={{ marginBottom: Spacing.lg }}>
                <CostDisplay
                  copayAmount={entry.copayAmount}
                  coinsurancePct={entry.coinsurancePct}
                  copayMailOrder={entry.copayMailOrder}
                />
              </View>
            )}

            {/* Restriction badges */}
            {hasRestrictions && (
              <View style={{ marginBottom: Spacing.lg }}>
                <RestrictionBadgeRow
                  priorAuth={entry.priorAuthRequired}
                  stepTherapy={entry.stepTherapy}
                  quantityLimit={entry.quantityLimit}
                  specialtyDrug={entry.specialtyDrug}
                  isControlled={false}
                  deaSchedule={null}
                />
              </View>
            )}

            {/* Specialty drug info */}
            {entry.specialtyDrug && (
              <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                <View style={{ padding: Spacing.lg, borderRadius: Radius.base, backgroundColor: theme.surface }}>
                  <Text style={{ ...Typography.label, color: theme.statusSpecialty, marginBottom: Spacing.xs }}>
                    Specialty Medication
                  </Text>
                  <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
                    May require dispensing through a specialty pharmacy, clinical management, or temperature-controlled shipping.
                  </Text>
                </View>
              </NeuInset>
            )}

            {/* Quantity limit detail */}
            {entry.quantityLimit && entry.quantityLimitDetail && (
              <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                <View style={{ padding: Spacing.lg, borderRadius: Radius.base, backgroundColor: theme.surface, marginTop: Spacing.md }}>
                  <Text style={{ ...Typography.label, color: theme.textSecondary, marginBottom: Spacing.xs }}>
                    Quantity Limit
                  </Text>
                  <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
                    {entry.quantityLimitDetail}
                  </Text>
                </View>
              </NeuInset>
            )}

            {/* Not covered — alternatives prompt */}
            {!isCovered && (
              <View style={{ marginTop: Spacing.lg }}>
                <Text style={{ ...Typography.body, color: theme.textSecondary, marginBottom: Spacing.lg }}>
                  This drug is not on the formulary. Covered alternatives may be available.
                </Text>
                <Button
                  variant="primary"
                  size="md"
                  label="View Covered Alternatives"
                  onPress={handleViewAlternatives}
                  fullWidth
                />
              </View>
            )}
          </View>
        </NeuSurface>

        {/* Action buttons */}
        <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
          {/* Restriction detail links */}
          {entry.priorAuthRequired && (
            <Button
              variant="secondary"
              size="md"
              label="View Prior Auth Details"
              onPress={() => navigation.navigate('PriorAuthDetail', {
                entryId: entry.entryId,
                drugName: `Drug #${drugId}`,
                planName: `Plan #${planId}`,
              })}
              fullWidth
            />
          )}
          {entry.stepTherapy && (
            <Button
              variant="secondary"
              size="md"
              label="View Step Therapy Details"
              onPress={() => navigation.navigate('StepTherapyDetail', {
                entryId: entry.entryId,
                drugName: `Drug #${drugId}`,
                planName: `Plan #${planId}`,
              })}
              fullWidth
            />
          )}
          {entry.quantityLimit && (
            <Button
              variant="secondary"
              size="md"
              label="View Quantity Limit Details"
              onPress={() => navigation.navigate('QuantityLimitDetail', {
                entryId: entry.entryId,
                drugName: `Drug #${drugId}`,
                planName: `Plan #${planId}`,
                quantityLimitDetail: entry.quantityLimitDetail,
              })}
              fullWidth
            />
          )}

          {/* Always available */}
          <Button
            variant="secondary"
            size="md"
            label="View Alternatives"
            onPress={handleViewAlternatives}
            fullWidth
          />
          <Button
            variant="tertiary"
            size="md"
            label="Share Results"
            onPress={handleShare}
            fullWidth
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}
