import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { Insurer, Plan } from '../../types/domain';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useAppStore } from '../../stores/appStore';
import { usePlans } from '../../hooks/queries/usePlans';
import { useMedicareLookup, useHiosLookup, useGroupLookup } from '../../hooks/queries/usePlanLookup';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import {
  Tabs,
  SearchBar,
  TextInput,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
  NeuInset,
} from '../../components/primitives';
import { PlanConfirmCard } from '../../components/composites/PlanConfirmCard';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'PlanSelection'>;

const TABS = [
  { id: 'search', label: 'Search' },
  { id: 'medicare', label: 'Medicare' },
  { id: 'hios', label: 'HIOS' },
  { id: 'group', label: 'Group ID' },
];

export default function PlanSelectionScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const selectedState = useAppStore((s) => s.selectedState);

  const { selectedInsurers } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedPlans, setConfirmedPlans] = useState<Map<number, Plan>>(new Map());
  const [activeTab, setActiveTab] = useState('search');
  const [foundPlan, setFoundPlan] = useState<Plan | null>(null);

  // Search tab state
  const [planSearch, setPlanSearch] = useState('');
  const debouncedSearch = useDebounce(planSearch, 200);

  // Medicare tab state
  const [contractId, setContractId] = useState('');
  const [medicarePlanId, setMedicarePlanId] = useState('');
  const [segmentId, setSegmentId] = useState('');

  // HIOS tab state
  const [hiosId, setHiosId] = useState('');

  // Group tab state
  const [groupId, setGroupId] = useState('');

  // Current insurer being processed
  const remainingInsurers = selectedInsurers.filter(
    (ins) => !confirmedPlans.has(ins.insurerId),
  );
  const currentInsurer: Insurer | undefined = remainingInsurers[currentIndex] ?? remainingInsurers[0];
  const totalSteps = selectedInsurers.length;
  const currentStep = selectedInsurers.length - remainingInsurers.length + 1;

  // Fetch plans for current insurer (Search tab)
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch } = usePlans(
    currentInsurer?.insurerId ?? null,
    selectedState?.code ?? null,
  );

  // Mutations for ID lookups
  const medicareMutation = useMedicareLookup();
  const hiosMutation = useHiosLookup();
  const groupMutation = useGroupLookup();

  // Client-side filter for search tab
  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    if (!debouncedSearch) return plans;
    const q = debouncedSearch.toLowerCase();
    return plans.filter((p) => p.planName.toLowerCase().includes(q));
  }, [plans, debouncedSearch]);

  const resetInputs = useCallback(() => {
    setPlanSearch('');
    setContractId('');
    setMedicarePlanId('');
    setSegmentId('');
    setHiosId('');
    setGroupId('');
    setFoundPlan(null);
    setActiveTab('search');
  }, []);

  const handleConfirmPlan = useCallback((plan: Plan) => {
    if (!currentInsurer) return;
    setConfirmedPlans((prev) => {
      const next = new Map(prev);
      next.set(currentInsurer.insurerId, plan);
      return next;
    });
    resetInputs();

    // Check if all done
    const totalConfirmed = confirmedPlans.size + 1;
    if (totalConfirmed >= remainingInsurers.length) {
      // All insurers processed — navigate forward
      const planIds = [...confirmedPlans.values(), plan].map((p) => p.planId);
      navigation.navigate('DrugSearch', {
        planIds,
        mode: planIds.length > 1 ? 'multi' : 'single',
      });
    }
  }, [currentInsurer, confirmedPlans, remainingInsurers, resetInputs, navigation]);

  const handleSkip = useCallback(() => {
    if (!currentInsurer) return;
    const newRemaining = remainingInsurers.filter(
      (i) => i.insurerId !== currentInsurer.insurerId,
    );

    if (newRemaining.length === 0 && confirmedPlans.size === 0) {
      showToast({ message: 'No insurers remaining. Going back.', variant: 'warning' });
      navigation.goBack();
      return;
    }

    if (newRemaining.length === 0) {
      const planIds = [...confirmedPlans.values()].map((p) => p.planId);
      navigation.navigate('DrugSearch', {
        planIds,
        mode: planIds.length > 1 ? 'multi' : 'single',
      });
      return;
    }

    resetInputs();
  }, [currentInsurer, remainingInsurers, confirmedPlans, resetInputs, navigation, showToast]);

  const handleMedicareLookup = () => {
    medicareMutation.mutate(
      { contractId, planId: medicarePlanId, segmentId },
      {
        onSuccess: (plan) => setFoundPlan(plan),
        onError: () => showToast({ message: 'Plan not found. Check the IDs.', variant: 'error' }),
      },
    );
  };

  const handleHiosLookup = () => {
    hiosMutation.mutate(
      { hiosId },
      {
        onSuccess: (plan) => setFoundPlan(plan),
        onError: () => showToast({ message: 'Plan not found. Check the HIOS ID.', variant: 'error' }),
      },
    );
  };

  const handleGroupLookup = () => {
    groupMutation.mutate(
      { groupId },
      {
        onSuccess: (plan) => setFoundPlan(plan),
        onError: () => showToast({ message: 'Plan not found. Check the Group ID.', variant: 'error' }),
      },
    );
  };

  if (!currentInsurer) {
    return <EmptyState icon="⚠" headline="No insurers to process" />;
  }

  const anyLookupLoading = medicareMutation.isPending || hiosMutation.isPending || groupMutation.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled">

        {/* Header + stepper */}
        <View style={{ paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
          <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
            Plan for {currentInsurer.insurerName}
          </Text>
          <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {/* Skip button */}
        <View style={{ marginBottom: Spacing.lg }}>
          <Button
            variant="tertiary"
            size="sm"
            label={`Skip ${currentInsurer.insurerName}`}
            onPress={handleSkip}
          />
        </View>

        {/* Tabs */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setFoundPlan(null); }} />
        </View>

        {/* Tab content */}
        {activeTab === 'search' && (
          <View style={{ gap: Spacing.md }}>
            <SearchBar
              placeholder={`Search ${currentInsurer.insurerName} plans...`}
              value={planSearch}
              onChangeText={setPlanSearch}
              onClear={() => setPlanSearch('')}
            />
            {plansLoading && <LoadingState variant="skeleton" rows={4} layout="list" />}
            {plansError && (
              <ErrorState
                variant="card"
                title="Unable to load plans"
                onRetry={() => refetch()}
              />
            )}
            {!plansLoading && !plansError && filteredPlans.length === 0 && (
              <EmptyState
                icon="📋"
                headline={debouncedSearch ? `No plans matching "${debouncedSearch}"` : 'No plans found'}
              />
            )}
            {!plansLoading && filteredPlans.map((plan) => (
              <NeuSurface key={plan.planId} level="extrudedSmall" cornerRadius={Radius.base}>
                <Pressable
                  onPress={() => setFoundPlan(plan)}
                  style={{
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.xl,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={plan.planName}>
                  <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
                    {plan.planName}
                  </Text>
                  {plan.planType && (
                    <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
                      {plan.planType} {plan.marketType ? `· ${plan.marketType.replace('_', ' ')}` : ''} · {plan.planYear}
                    </Text>
                  )}
                </Pressable>
              </NeuSurface>
            ))}
          </View>
        )}

        {activeTab === 'medicare' && (
          <View style={{ gap: Spacing.lg }}>
            <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
              Enter Medicare Plan IDs
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
              <View style={{ flex: 2 }}>
                <TextInput
                  label="Contract ID"
                  placeholder="H1234"
                  value={contractId}
                  onChangeText={setContractId}
                  autoCapitalize="characters"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Plan ID"
                  placeholder="001"
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
                />
              </View>
            </View>
            <Button
              variant="primary"
              size="md"
              label="Look Up"
              onPress={handleMedicareLookup}
              loading={medicareMutation.isPending}
              disabled={!contractId || !medicarePlanId || anyLookupLoading}
              fullWidth
            />
          </View>
        )}

        {activeTab === 'hios' && (
          <View style={{ gap: Spacing.lg }}>
            <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
              Enter HIOS Plan ID
            </Text>
            <TextInput
              label="HIOS Plan ID"
              placeholder="12345TX0010001"
              value={hiosId}
              onChangeText={setHiosId}
              autoCapitalize="characters"
              maxLength={14}
            />
            <Button
              variant="primary"
              size="md"
              label="Look Up"
              onPress={handleHiosLookup}
              loading={hiosMutation.isPending}
              disabled={hiosId.length < 10 || anyLookupLoading}
              fullWidth
            />
          </View>
        )}

        {activeTab === 'group' && (
          <View style={{ gap: Spacing.lg }}>
            <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
              Enter Group ID
            </Text>
            <TextInput
              label="Group ID"
              placeholder="Group number from insurance card"
              value={groupId}
              onChangeText={setGroupId}
            />
            <Button
              variant="primary"
              size="md"
              label="Look Up"
              onPress={handleGroupLookup}
              loading={groupMutation.isPending}
              disabled={!groupId || anyLookupLoading}
              fullWidth
            />
          </View>
        )}

        {/* Found plan confirmation card */}
        {foundPlan && (
          <View style={{ marginTop: Spacing.xxl }}>
            <PlanConfirmCard
              plan={foundPlan}
              onConfirm={() => handleConfirmPlan(foundPlan)}
            />
          </View>
        )}

        {/* Already confirmed plans */}
        {confirmedPlans.size > 0 && (
          <View style={{ marginTop: Spacing.xxxl }}>
            <Text style={{ ...Typography.label, color: theme.textSecondary, marginBottom: Spacing.md }}>
              Confirmed Plans
            </Text>
            {[...confirmedPlans.entries()].map(([insurerId, plan]) => {
              const insurer = selectedInsurers.find((i) => i.insurerId === insurerId);
              return (
                <NeuInset key={insurerId} level="insetSmall" cornerRadius={Radius.base}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: Spacing.lg,
                      borderRadius: Radius.base,
                      backgroundColor: theme.surface,
                      gap: Spacing.sm,
                    }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: theme.success,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{ color: theme.textInverse, fontSize: 14, fontWeight: '700' }}>✓</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...Typography.label, color: theme.textPrimary }}>
                        {insurer?.insurerName}
                      </Text>
                      <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
                        {plan.planName}
                      </Text>
                    </View>
                  </View>
                </NeuInset>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
