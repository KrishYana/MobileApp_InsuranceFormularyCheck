/**
 * DrugFirstSearchScreen — Secondary search flow (drug-first).
 *
 * The primary search flow is insurer-first (InsurerSelection -> PlanSelection -> DrugSearch).
 * This screen provides an alternative drug-first entry point and is registered in SearchStack
 * but is NOT the initial route and is not currently navigated to from any other screen.
 * Preserved for future use as an alternate search flow option.
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { Drug, Plan } from '../../types/domain';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
// Animation module available for press interactions via DrugAutocompleteItem
import { useQuery } from '@tanstack/react-query';
import { useDrugSearch } from '../../hooks/queries/useDrugSearch';
import { useMedicareLookup } from '../../hooks/queries/usePlanLookup';
import { queryKeys } from '../../stores/queryClient';
import { formularyService } from '../../api/services/formulary.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import {
  SearchBar,
  TextInput,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
  NeuInset,
  FreshnessIndicator,
  AppIcon,
} from '../../components/primitives';
import { DrugAutocompleteItem } from '../../components/composites/DrugAutocompleteItem';
import { RestrictionBadgeRow } from '../../components/composites/RestrictionBadgeRow';
import { TierDisplay } from '../../components/composites/TierDisplay';
import { CostDisplay } from '../../components/composites/CostDisplay';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'DrugFirstSearch'>;

type FlowStep = 'drug' | 'plan' | 'coverage';

export default function DrugFirstSearchScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const scrollRef = useRef<ScrollView>(null);

  // -- Step tracking --
  const [currentStep, setCurrentStep] = useState<FlowStep>('drug');

  // -- Step 1: Drug search --
  const [drugQuery, setDrugQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [formulationDrug, setFormulationDrug] = useState<Drug | null>(null);
  const [formulations, setFormulations] = useState<Drug[]>([]);
  const debouncedQuery = useDebounce(drugQuery, 300);

  const {
    data: searchResults,
    isLoading: searching,
    isError: searchError,
    error: searchErr,
    refetch: refetchDrugs,
  } = useDrugSearch(debouncedQuery);

  // Group drugs by base name to detect multiple formulations
  const groupedResults = useMemo(() => {
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      return { unique: [] as Drug[], groups: new Map<string, Drug[]>() };
    }

    const groups = new Map<string, Drug[]>();
    for (const drug of searchResults) {
      const baseName = drug.genericName ?? drug.drugName;
      const existing = groups.get(baseName) ?? [];
      existing.push(drug);
      groups.set(baseName, existing);
    }

    const unique: Drug[] = [];
    const seen = new Set<string>();
    for (const drug of searchResults) {
      const baseName = drug.genericName ?? drug.drugName;
      if (!seen.has(baseName)) {
        seen.add(baseName);
        unique.push(drug);
      }
    }
    return { unique, groups };
  }, [searchResults]);

  // -- Step 2: Medicare plan lookup --
  const [contractId, setContractId] = useState('');
  const [medicarePlanId, setMedicarePlanId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [foundPlan, setFoundPlan] = useState<Plan | null>(null);
  const medicareMutation = useMedicareLookup();

  // -- Step 3: Coverage result (inline, gated by both selections) --
  const coverageEnabled = !!foundPlan && !!selectedDrug;
  const coverageQuery = useQuery({
    queryKey: queryKeys.coverage.single(foundPlan?.planId ?? 0, selectedDrug?.drugId ?? 0),
    queryFn: () => formularyService.getCoverage(foundPlan!.planId, selectedDrug!.drugId),
    enabled: coverageEnabled,
  });

  // -- Handlers --

  const confirmDrug = useCallback((drug: Drug) => {
    setSelectedDrug(drug);
    setFormulationDrug(null);
    setFormulations([]);
    setCurrentStep('plan');
    Keyboard.dismiss();
    // Scroll to top so the plan section is visible
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
  }, []);

  const handleDrugSelect = useCallback(
    (drug: Drug) => {
      if (!searchResults?.length) return;

      const baseName = drug.genericName ?? drug.drugName;
      const variants = groupedResults.groups?.get(baseName) ?? [drug];

      if (variants.length > 1) {
        setFormulationDrug(drug);
        setFormulations(variants);
      } else {
        confirmDrug(drug);
      }
    },
    [searchResults, groupedResults, confirmDrug],
  );

  const handleMedicareLookup = useCallback(() => {
    Keyboard.dismiss();
    medicareMutation.mutate(
      { contractId, planId: medicarePlanId, segmentId: segmentId || '000' },
      {
        onSuccess: (plan) => {
          setFoundPlan(plan);
          setCurrentStep('coverage');
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
        },
        onError: () => {
          showToast({
            message: 'Plan not found. Check Contract ID and Plan ID.',
            variant: 'error',
          });
        },
      },
    );
  }, [contractId, medicarePlanId, segmentId, medicareMutation, showToast]);

  const handleChangeDrug = useCallback(() => {
    setSelectedDrug(null);
    setFoundPlan(null);
    setCurrentStep('drug');
    setContractId('');
    setMedicarePlanId('');
    setSegmentId('');
    setDrugQuery('');
  }, []);

  const handleChangePlan = useCallback(() => {
    setFoundPlan(null);
    setCurrentStep('plan');
    setContractId('');
    setMedicarePlanId('');
    setSegmentId('');
  }, []);

  const handleViewDetails = useCallback(() => {
    if (!foundPlan || !selectedDrug) return;
    navigation.navigate('CoverageResult', {
      planId: foundPlan.planId,
      drugId: selectedDrug.drugId,
    });
  }, [foundPlan, selectedDrug, navigation]);

  const handleViewAlternatives = useCallback(() => {
    if (!selectedDrug) return;
    navigation.navigate('DrugAlternatives', {
      drugId: selectedDrug.drugId,
      planId: foundPlan?.planId,
      drugName: selectedDrug.drugName,
    });
  }, [selectedDrug, foundPlan, navigation]);

  const showDrugResults = debouncedQuery.length >= 2;

  // -- Step indicator --
  const renderStepIndicator = () => {
    const steps: { key: FlowStep; label: string; number: number }[] = [
      { key: 'drug', label: 'Drug', number: 1 },
      { key: 'plan', label: 'Plan', number: 2 },
      { key: 'coverage', label: 'Coverage', number: 3 },
    ];

    const stepIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          gap: Spacing.sm,
        }}>
        {steps.map((step, idx) => {
          const isActive = idx === stepIndex;
          const isCompleted = idx < stepIndex;
          const circleColor = isActive
            ? theme.accent
            : isCompleted
              ? theme.success
              : theme.shadowDark;
          const textColor = isActive || isCompleted ? theme.textInverse : theme.textSecondary;
          const labelColor = isActive ? theme.textAccent : isCompleted ? theme.success : theme.textDisabled;

          return (
            <React.Fragment key={step.key}>
              {idx > 0 && (
                <View
                  style={{
                    height: 2,
                    flex: 1,
                    backgroundColor: isCompleted ? theme.success : theme.shadowDark,
                    borderRadius: 1,
                    opacity: 0.4,
                  }}
                />
              )}
              <View style={{ alignItems: 'center', gap: Spacing.xs }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: circleColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {isCompleted ? (
                    <AppIcon name="check" size={14} color={textColor} />
                  ) : (
                    <Text style={{ ...Typography.badge, color: textColor, fontSize: 12 }}>
                      {step.number}
                    </Text>
                  )}
                </View>
                <Text style={{ ...Typography.badge, color: labelColor }}>
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  // -- Selected drug summary chip --
  const renderDrugChip = () => {
    if (!selectedDrug) return null;

    const subtitle = [selectedDrug.strength, selectedDrug.doseForm, selectedDrug.route]
      .filter(Boolean)
      .join(' \u00B7 ');

    return (
      <NeuInset level="insetSmall" cornerRadius={Radius.base}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.lg,
            borderRadius: Radius.base,
            backgroundColor: theme.surface,
            gap: Spacing.md,
          }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.accentLight,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AppIcon name="pill" size={18} color={theme.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
              {selectedDrug.drugName}
            </Text>
            {subtitle.length > 0 && (
              <Text
                style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xxs }}
                numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleChangeDrug}
            hitSlop={8}
            accessibilityLabel="Change selected drug">
            <Text style={{ ...Typography.label, color: theme.textAccent }}>Change</Text>
          </Pressable>
        </View>
      </NeuInset>
    );
  };

  // -- Found plan summary chip --
  const renderPlanChip = () => {
    if (!foundPlan) return null;

    return (
      <NeuInset level="insetSmall" cornerRadius={Radius.base}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: Spacing.lg,
            borderRadius: Radius.base,
            backgroundColor: theme.surface,
            gap: Spacing.md,
          }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.statusStepTherapyBg,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AppIcon name="clipboard" size={18} color={theme.statusStepTherapy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }} numberOfLines={2}>
              {foundPlan.planName}
            </Text>
            <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xxs }}>
              {foundPlan.planType ?? 'Medicare'} {'\u00B7'} {foundPlan.planYear}
            </Text>
          </View>
          <Pressable
            onPress={handleChangePlan}
            hitSlop={8}
            accessibilityLabel="Change selected plan">
            <Text style={{ ...Typography.label, color: theme.textAccent }}>Change</Text>
          </Pressable>
        </View>
      </NeuInset>
    );
  };

  // -- Coverage result card (inline) --
  const renderCoverageResult = () => {
    if (!coverageEnabled) return null;

    if (coverageQuery.isLoading) {
      return <LoadingState variant="skeleton" layout="detail" />;
    }

    if (coverageQuery.isError) {
      return (
        <ErrorState
          variant="card"
          title={
            (coverageQuery.error as any)?.displayMessage ??
            'Unable to retrieve coverage info'
          }
          description="Check your connection and try again."
          onRetry={() => coverageQuery.refetch()}
        />
      );
    }

    const entry = coverageQuery.data;

    if (!entry) {
      return (
        <NeuSurface level="extruded" cornerRadius={Radius.container}>
          <View
            style={{
              padding: Spacing.xxl,
              borderRadius: Radius.container,
              backgroundColor: theme.surface,
              borderLeftWidth: 5,
              borderLeftColor: theme.statusNotCovered,
              gap: Spacing.lg,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.statusNotCoveredBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 20, color: theme.statusNotCovered, fontWeight: '700' }}>?</Text>
              </View>
              <Text style={{ ...Typography.title3, color: theme.statusNotCovered, flex: 1 }}>
                Not Found on Formulary
              </Text>
            </View>
            <Text style={{ ...Typography.body, color: theme.textSecondary }}>
              This drug was not found on this plan's formulary. It may not be covered, or our data does not include it yet.
            </Text>
            <Button
              variant="primary"
              size="md"
              label="View Alternatives"
              onPress={handleViewAlternatives}
              fullWidth
            />
          </View>
        </NeuSurface>
      );
    }

    const isCovered = entry.isCovered;
    const hasRestrictions = entry.priorAuthRequired || entry.stepTherapy || entry.quantityLimit;
    const statusText = isCovered
      ? hasRestrictions
        ? 'COVERED \u2014 Restrictions Apply'
        : 'COVERED'
      : 'NOT COVERED';
    const statusColor = isCovered ? theme.statusCovered : theme.statusNotCovered;
    const statusBg = isCovered ? theme.statusCoveredBg : theme.statusNotCoveredBg;
    return (
      <View style={{ gap: Spacing.lg }}>
        {/* Freshness banner */}
        <FreshnessIndicator sourceDate={entry.sourceDate} variant="banner" />

        {/* Main coverage card */}
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.md,
                marginBottom: Spacing.lg,
              }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: statusBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AppIcon
                  name={isCovered ? 'check' : 'close'}
                  size={22}
                  color={statusColor}
                />
              </View>
              <Text style={{ ...Typography.title2, color: statusColor, flex: 1 }}>
                {statusText}
              </Text>
            </View>

            {/* Tier display */}
            {isCovered && entry.tierLevel && (
              <View style={{ marginBottom: Spacing.lg }}>
                <TierDisplay tierLevel={entry.tierLevel} tierName={entry.tierName} />
              </View>
            )}

            {/* Cost display */}
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

            {/* Quantity limit detail */}
            {entry.quantityLimit && entry.quantityLimitDetail && (
              <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                <View
                  style={{
                    padding: Spacing.lg,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                  }}>
                  <Text
                    style={{
                      ...Typography.label,
                      color: theme.textSecondary,
                      marginBottom: Spacing.xs,
                    }}>
                    Quantity Limit
                  </Text>
                  <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
                    {entry.quantityLimitDetail}
                  </Text>
                </View>
              </NeuInset>
            )}

            {/* Not covered alternatives */}
            {!isCovered && (
              <View style={{ marginTop: Spacing.lg }}>
                <Text
                  style={{
                    ...Typography.body,
                    color: theme.textSecondary,
                    marginBottom: Spacing.lg,
                  }}>
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
        <View style={{ gap: Spacing.md }}>
          <Button
            variant="secondary"
            size="md"
            label="View Full Details"
            onPress={handleViewDetails}
            fullWidth
          />
          {isCovered && (
            <Button
              variant="secondary"
              size="md"
              label="View Alternatives"
              onPress={handleViewAlternatives}
              fullWidth
            />
          )}
        </View>

        {/* Start new search */}
        <View style={{ alignItems: 'center', marginTop: Spacing.md }}>
          <Button
            variant="tertiary"
            size="sm"
            label="Start New Search"
            onPress={handleChangeDrug}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Step 1: Drug search (active) */}
      {currentStep === 'drug' && (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: Spacing.xl,
              paddingBottom: Spacing.md,
            }}>
            <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
              Search Drug
            </Text>
            <Text
              style={{
                ...Typography.caption,
                color: theme.textSecondary,
                marginTop: Spacing.xs,
              }}>
              Start by finding the medication you want to check
            </Text>
          </View>

          {/* Search bar */}
          <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.md }}>
            <SearchBar
              placeholder="Search by drug name, generic, or class..."
              value={drugQuery}
              onChangeText={setDrugQuery}
              onClear={() => setDrugQuery('')}
              autoFocus
            />
          </View>

          {/* Results */}
          <View style={{ flex: 1 }}>
            {/* Prompt */}
            {!showDrugResults && !searching && (
              <EmptyState
                icon="pill"
                headline="Start typing a drug name"
                description="Search by brand name, generic name, or drug class. Minimum 2 characters."
              />
            )}

            {/* Loading */}
            {showDrugResults && searching && (
              <LoadingState variant="skeleton" rows={5} layout="list" />
            )}

            {/* Error */}
            {showDrugResults && searchError && (
              <View style={{ padding: Spacing.xl }}>
                <ErrorState
                  variant="card"
                  title={
                    (searchErr as any)?.displayMessage ?? 'Search unavailable'
                  }
                  description="Check your connection and try again."
                  onRetry={() => refetchDrugs()}
                />
              </View>
            )}

            {/* No results */}
            {showDrugResults &&
              !searching &&
              !searchError &&
              groupedResults.unique.length === 0 && (
                <EmptyState
                  icon="search"
                  headline={`No drugs matching "${debouncedQuery}"`}
                  description="Check the spelling, or try searching by generic name."
                />
              )}

            {/* Results list */}
            {showDrugResults &&
              !searching &&
              !searchError &&
              groupedResults.unique.length > 0 && (
                <FlatList
                  data={groupedResults.unique.slice(0, 15)}
                  keyExtractor={(item) => String(item.drugId)}
                  contentContainerStyle={{
                    paddingHorizontal: Spacing.xl,
                    paddingBottom: 40,
                  }}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: Spacing.md }} />
                  )}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <DrugAutocompleteItem
                      drug={item}
                      searchQuery={debouncedQuery}
                      onPress={handleDrugSelect}
                    />
                  )}
                />
              )}
          </View>
        </View>
      )}

      {/* Steps 2 & 3: Plan lookup + Coverage (scrollable) */}
      {currentStep !== 'drug' && (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: Spacing.xl,
            paddingBottom: insets.bottom + 40,
          }}
          keyboardShouldPersistTaps="handled">
          {/* Selected drug chip */}
          <View style={{ marginBottom: Spacing.xl }}>
            <Text
              style={{
                ...Typography.label,
                color: theme.textSecondary,
                marginBottom: Spacing.sm,
              }}>
              Selected Drug
            </Text>
            {renderDrugChip()}
          </View>

          {/* Step 2: Plan lookup */}
          {currentStep === 'plan' && (
            <View style={{ gap: Spacing.lg }}>
              <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
                Look Up Plan
              </Text>
              <Text style={{ ...Typography.body, color: theme.textSecondary }}>
                Enter your Medicare Part D plan identifiers. You can find these on your plan card or in your enrollment documents.
              </Text>

              {/* Medicare ID fields */}
              <NeuSurface level="extrudedSmall" cornerRadius={Radius.container}>
                <View
                  style={{
                    padding: Spacing.xxl,
                    borderRadius: Radius.container,
                    backgroundColor: theme.surface,
                    gap: Spacing.lg,
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <AppIcon name="hospital" size={18} color={theme.accent} />
                    <Text style={{ ...Typography.title3, color: theme.textPrimary }}>
                      Medicare Plan Lookup
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                    <View style={{ flex: 2 }}>
                      <TextInput
                        label="Contract ID"
                        placeholder="H0028"
                        value={contractId}
                        onChangeText={(t) => setContractId(t.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={5}
                        helperText="e.g. H0028"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        label="Plan ID"
                        placeholder="062"
                        value={medicarePlanId}
                        onChangeText={setMedicarePlanId}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        label="Segment"
                        placeholder="000"
                        value={segmentId}
                        onChangeText={setSegmentId}
                        keyboardType="number-pad"
                        maxLength={3}
                        helperText="Optional"
                      />
                    </View>
                  </View>

                  <Button
                    variant="primary"
                    size="lg"
                    label="Look Up Plan"
                    onPress={handleMedicareLookup}
                    loading={medicareMutation.isPending}
                    disabled={!contractId || !medicarePlanId || medicareMutation.isPending}
                    fullWidth
                  />
                </View>
              </NeuSurface>

              {/* Help text */}
              <NeuInset level="insetSmall" cornerRadius={Radius.base}>
                <View
                  style={{
                    padding: Spacing.lg,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                    gap: Spacing.sm,
                  }}>
                  <Text style={{ ...Typography.label, color: theme.textAccent }}>
                    Where to find your plan IDs
                  </Text>
                  <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
                    Your Contract ID (starts with H, S, or R) and Plan ID (3 digits) are printed on your Medicare Part D card. The Segment ID defaults to 000 if not specified.
                  </Text>
                </View>
              </NeuInset>
            </View>
          )}

          {/* Step 3: Coverage results */}
          {currentStep === 'coverage' && (
            <View style={{ gap: Spacing.lg }}>
              {/* Plan chip */}
              <View>
                <Text
                  style={{
                    ...Typography.label,
                    color: theme.textSecondary,
                    marginBottom: Spacing.sm,
                  }}>
                  Selected Plan
                </Text>
                {renderPlanChip()}
              </View>

              {/* Coverage header */}
              <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
                Coverage Result
              </Text>

              {/* Coverage data */}
              {renderCoverageResult()}
            </View>
          )}
        </ScrollView>
      )}

      {/* Formulation picker bottom sheet */}
      <Modal
        visible={formulationDrug !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFormulationDrug(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: Spacing.xxl,
              paddingVertical: Spacing.xl,
            }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...Typography.title2, color: theme.textPrimary }}>
                Select Formulation
              </Text>
              {formulationDrug && (
                <Text
                  style={{
                    ...Typography.caption,
                    color: theme.textSecondary,
                    marginTop: Spacing.xs,
                  }}>
                  {formulationDrug.genericName ?? formulationDrug.drugName}
                </Text>
              )}
            </View>
            <Pressable onPress={() => setFormulationDrug(null)}>
              <Text style={{ ...Typography.bodyBold, color: theme.textAccent }}>
                Cancel
              </Text>
            </Pressable>
          </View>

          <FlatList
            data={formulations}
            keyExtractor={(item) => String(item.drugId)}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            ItemSeparatorComponent={() => (
              <View style={{ height: Spacing.md }} />
            )}
            renderItem={({ item }) => (
              <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
                <Pressable
                  onPress={() => confirmDrug(item)}
                  style={{
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.xl,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.drugName} ${item.strength ?? ''} ${item.doseForm ?? ''}`}>
                  <Text
                    style={{
                      ...Typography.bodyMedium,
                      color: theme.textPrimary,
                    }}>
                    {item.drugName}
                  </Text>
                  <Text
                    style={{
                      ...Typography.caption,
                      color: theme.textSecondary,
                      marginTop: Spacing.xs,
                    }}>
                    {[item.strength, item.doseForm, item.route]
                      .filter(Boolean)
                      .join(' \u00B7 ')}
                  </Text>
                </Pressable>
              </NeuSurface>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
