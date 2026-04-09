import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SectionList, Pressable, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { Insurer, Plan } from '../../types/domain';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useAppStore } from '../../stores/appStore';
import { useInsurers } from '../../hooks/queries/useInsurers';
import { useMedicareLookup, useHiosLookup, useGroupLookup } from '../../hooks/queries/usePlanLookup';
import { useDebounce } from '../../hooks/useDebounce';
import {
  SearchBar,
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
  NeuInset,
  Tabs,
  TextInput,
  Button,
  AppIcon,
} from '../../components/primitives';
import { InsurerCard } from '../../components/composites/InsurerCard';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'InsurerSelection'>;

const SEARCH_TABS = [
  { id: 'browse', label: 'Browse' },
  { id: 'group', label: 'Group ID' },
  { id: 'medicare', label: 'Medicare' },
  { id: 'hios', label: 'HIOS' },
];

// ------------------------------------------------------------------
// Browse Tab (existing insurer browse flow)
// ------------------------------------------------------------------
function BrowseTab({ navigation }: { navigation: Props['navigation'] }) {
  const { theme } = useTheme();
  const selectedState = useAppStore((s) => s.selectedState);
  const [search, setSearch] = useState('');
  const [showNational, setShowNational] = useState(false);
  const debouncedSearch = useDebounce(search, 200);

  const { data: sectionedData, isLoading, isError, error, refetch } = useInsurers(
    selectedState?.code ?? null,
  );

  const localInsurers = sectionedData?.localInsurers ?? [];
  const nationalInsurers = sectionedData?.nationalInsurers ?? [];

  const filteredLocal = useMemo(() => {
    if (!debouncedSearch) return localInsurers;
    const q = debouncedSearch.toLowerCase();
    return localInsurers.filter((i: Insurer) => i.insurerName.toLowerCase().includes(q));
  }, [localInsurers, debouncedSearch]);

  const filteredNational = useMemo(() => {
    if (!debouncedSearch) return nationalInsurers;
    const q = debouncedSearch.toLowerCase();
    return nationalInsurers.filter((i: Insurer) => i.insurerName.toLowerCase().includes(q));
  }, [nationalInsurers, debouncedSearch]);

  const handleInsurerPress = (insurer: Insurer) => {
    navigation.navigate('PlanSelection', { insurer });
  };

  const sections = useMemo(() => {
    const result: { title: string; data: Insurer[] }[] = [];
    if (filteredLocal.length > 0) {
      result.push({ title: `Plans in ${selectedState?.name ?? 'your state'}`, data: filteredLocal });
    }
    const showNationalSection = showNational || !!debouncedSearch || filteredLocal.length === 0;
    if (filteredNational.length > 0 && showNationalSection) {
      result.push({ title: 'National Plans (Medicare Part D)', data: filteredNational });
    }
    return result;
  }, [filteredLocal, filteredNational, selectedState, showNational, debouncedSearch]);

  const totalCount = localInsurers.length + nationalInsurers.length;
  const hasData = totalCount > 0;

  if (!selectedState) {
    return (
      <EmptyState
        icon="location"
        headline="Select a state first"
        description="Choose your state from the bar above to see available insurers."
      />
    );
  }

  if (isLoading) return <LoadingState variant="skeleton" rows={6} layout="list" />;

  if (isError) {
    return (
      <View style={{ padding: Spacing.xl }}>
        <ErrorState
          variant="card"
          title={(error as any)?.displayMessage ?? 'Unable to load insurers'}
          description="Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon="hospital"
        headline={`No insurer data for ${selectedState.name} yet`}
        description="Insurer and plan data is still being ingested. Please check back shortly."
      />
    );
  }

  if (debouncedSearch && filteredLocal.length === 0 && filteredNational.length === 0) {
    return (
      <EmptyState
        icon="search"
        headline={`No insurers matching "${debouncedSearch}"`}
        description="Check the spelling or try a different search."
        ctaLabel="Clear search"
        onCtaPress={() => setSearch('')}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md }}>
        <SearchBar
          placeholder={`Search insurers in ${selectedState.name}...`}
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.insurerId)}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.sm,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section: { title } }) => (
          <NeuSurface level="none" cornerRadius={Radius.inner}>
            <View style={{ paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.sm }}>
              <Text style={{ ...Typography.label, color: theme.textSecondary }}>{title}</Text>
            </View>
          </NeuSurface>
        )}
        renderSectionFooter={({ section }) => {
          if (
            section.title !== 'National Plans (Medicare Part D)' &&
            filteredNational.length > 0 &&
            !debouncedSearch &&
            filteredLocal.length > 0
          ) {
            return (
              <Pressable
                onPress={() => setShowNational((v) => !v)}
                style={{ paddingVertical: Spacing.lg, marginTop: Spacing.md, alignItems: 'center' }}>
                <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl, borderRadius: Radius.base, backgroundColor: theme.surface, gap: Spacing.sm }}>
                    <Text style={{ ...Typography.label, color: theme.textAccent }}>
                      {showNational ? 'Hide national plans' : `Show ${filteredNational.length} national plans`}
                    </Text>
                    <AppIcon name={showNational ? 'collapse' : 'expand'} size={12} color={theme.textAccent} />
                  </View>
                </NeuSurface>
              </Pressable>
            );
          }
          return null;
        }}
        renderItem={({ item }) => (
          <InsurerCard name={item.insurerName} selected={false} onPress={() => handleInsurerPress(item)} />
        )}
      />
    </View>
  );
}

// ------------------------------------------------------------------
// Group ID Tab
// ------------------------------------------------------------------
function GroupIdTab({ navigation, theme }: { navigation: Props['navigation']; theme: any }) {
  const [groupId, setGroupId] = useState('');
  const [planIdInput, setPlanIdInput] = useState('');
  const mutation = useGroupLookup();
  const addToBasket = useAppStore((s) => s.addToBasket);

  useEffect(() => { mutation.reset(); }, [groupId, planIdInput]);

  const handleLookup = () => {
    if (!groupId.trim()) return;
    mutation.mutate(
      { groupId: groupId.trim(), planId: planIdInput.trim() || undefined },
      {
        onSuccess: (plan) => {
          addToBasket(plan);
          if (planIdInput.trim()) {
            // Plan ID provided — skip plan selection, go straight to drug search
            navigation.navigate('DrugSearch', {
              planId: plan.planId,
              planName: plan.planName || 'Plan',
            });
          } else {
            // Group ID only — navigate to plan selection
            // The plan was added to basket; PlanSelection will show plans for this group
            navigation.navigate('PlanSelection', {
              insurer: {
                insurerId: plan.insurerId,
                insurerName: plan.planName || 'Group Plans',
                parentCompany: null,
                hiosIssuerId: null,
                fhirEndpointUrl: null,
                websiteUrl: null,
              },
            });
          }
        },
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={{ ...Typography.body, color: theme.textSecondary }}>
        Enter the Group ID from the patient's insurance card.
      </Text>
      <TextInput
        label="Group ID"
        value={groupId}
        onChangeText={setGroupId}
        placeholder="e.g. GRP-12345"
        autoCapitalize="characters"
        clearable
      />
      <TextInput
        label="Plan ID (optional)"
        value={planIdInput}
        onChangeText={setPlanIdInput}
        placeholder="e.g. 001"
        helperText="If provided, skips plan selection and goes straight to drug search."
        autoCapitalize="characters"
        returnKeyType="search"
        onSubmitEditing={handleLookup}
        clearable
      />
      <Button
        label="Find Plan"
        onPress={handleLookup}
        loading={mutation.isPending}
        disabled={!groupId.trim()}
        fullWidth
      />
      {mutation.isError && (
        <ErrorState
          variant="card"
          title="Plan not found"
          description="No plan matches that group ID. Check the ID and try again."
          onRetry={handleLookup}
        />
      )}
    </ScrollView>
  );
}

// ------------------------------------------------------------------
// Medicare Tab
// ------------------------------------------------------------------
function MedicareTab({ navigation, theme }: { navigation: Props['navigation']; theme: any }) {
  const [contractId, setContractId] = useState('');
  const [planId, setPlanId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const mutation = useMedicareLookup();
  const addToBasket = useAppStore((s) => s.addToBasket);

  useEffect(() => { mutation.reset(); }, [contractId, planId, segmentId]);

  const canSearch = contractId.trim() && planId.trim() && segmentId.trim();

  const handleLookup = () => {
    if (!canSearch) return;
    mutation.mutate(
      { contractId: contractId.trim(), planId: planId.trim(), segmentId: segmentId.trim() },
      {
        onSuccess: (plan) => {
          addToBasket(plan);
          navigation.navigate('DrugSearch', {
            planId: plan.planId,
            planName: plan.planName || 'Plan',
          });
        },
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={{ ...Typography.body, color: theme.textSecondary }}>
        Enter the Medicare plan identifiers from the patient's card or CMS records.
      </Text>
      <TextInput label="Contract ID" value={contractId} onChangeText={setContractId} placeholder="e.g. H1234" autoCapitalize="characters" clearable />
      <TextInput label="Plan ID" value={planId} onChangeText={setPlanId} placeholder="e.g. 001" clearable />
      <TextInput label="Segment ID" value={segmentId} onChangeText={setSegmentId} placeholder="e.g. 000" returnKeyType="search" onSubmitEditing={handleLookup} clearable />
      <Button label="Find Plan" onPress={handleLookup} loading={mutation.isPending} disabled={!canSearch} fullWidth />
      {mutation.isError && (
        <ErrorState variant="card" title="Plan not found" description="No plan matches those Medicare identifiers. Verify the contract ID, plan ID, and segment ID." onRetry={handleLookup} />
      )}
    </ScrollView>
  );
}

// ------------------------------------------------------------------
// HIOS Tab
// ------------------------------------------------------------------
function HiosTab({ navigation, theme }: { navigation: Props['navigation']; theme: any }) {
  const [hiosId, setHiosId] = useState('');
  const mutation = useHiosLookup();
  const addToBasket = useAppStore((s) => s.addToBasket);

  useEffect(() => { mutation.reset(); }, [hiosId]);

  const handleLookup = () => {
    if (!hiosId.trim()) return;
    mutation.mutate(
      { hiosId: hiosId.trim() },
      {
        onSuccess: (plan) => {
          addToBasket(plan);
          navigation.navigate('DrugSearch', {
            planId: plan.planId,
            planName: plan.planName || 'Plan',
          });
        },
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.xl }} keyboardShouldPersistTaps="handled">
      <Text style={{ ...Typography.body, color: theme.textSecondary }}>
        Enter the 14-character HIOS Plan ID for ACA marketplace plans.
      </Text>
      <TextInput label="HIOS Plan ID" value={hiosId} onChangeText={setHiosId} placeholder="e.g. 12345AZ0010001" maxLength={14} autoCapitalize="characters" returnKeyType="search" onSubmitEditing={handleLookup} clearable />
      <Button label="Find Plan" onPress={handleLookup} loading={mutation.isPending} disabled={!hiosId.trim()} fullWidth />
      {mutation.isError && (
        <ErrorState variant="card" title="Plan not found" description="No plan matches that HIOS ID. Check the 14-character ID and try again." onRetry={handleLookup} />
      )}
    </ScrollView>
  );
}

// ------------------------------------------------------------------
// Main Screen
// ------------------------------------------------------------------
export default function InsurerSelectionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const selectedState = useAppStore((s) => s.selectedState);
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Persistent state bar */}
      <StateSelectorBar />

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>Find Your Plan</Text>
        <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
          Browse insurers or look up a plan directly
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md }}>
        <Tabs tabs={SEARCH_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'browse' && <BrowseTab navigation={navigation} />}
        {activeTab === 'group' && <GroupIdTab navigation={navigation} theme={theme} />}
        {activeTab === 'medicare' && <MedicareTab navigation={navigation} theme={theme} />}
        {activeTab === 'hios' && <HiosTab navigation={navigation} theme={theme} />}
      </View>
    </View>
  );
}
