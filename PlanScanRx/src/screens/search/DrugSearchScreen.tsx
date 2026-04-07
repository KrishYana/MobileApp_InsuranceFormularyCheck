import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { Drug } from '../../types/domain';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useDrugSearch } from '../../hooks/queries/useDrugSearch';
import { useDebounce } from '../../hooks/useDebounce';
import {
  SearchBar,
  Tabs,
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
  NeuInset,
  Button,
} from '../../components/primitives';
import { DrugAutocompleteItem } from '../../components/composites/DrugAutocompleteItem';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'DrugSearch'>;

const SEARCH_TABS = [
  { id: 'search', label: 'Search' },
  { id: 'recent', label: 'Recent' },
];

export default function DrugSearchScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { planIds, mode } = route.params;

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [formulationDrug, setFormulationDrug] = useState<Drug | null>(null);
  const [formulations, setFormulations] = useState<Drug[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  const {
    data: searchResults,
    isLoading: searching,
    isError: searchError,
    error,
    refetch,
  } = useDrugSearch(debouncedQuery);

  // Group drugs by base name to detect multiple formulations
  const groupedResults = useMemo(() => {
    if (!searchResults) return [];

    const groups = new Map<string, Drug[]>();
    for (const drug of searchResults) {
      const baseName = drug.genericName ?? drug.drugName;
      const existing = groups.get(baseName) ?? [];
      existing.push(drug);
      groups.set(baseName, existing);
    }

    // Return unique drugs for display. If a base name has multiple formulations,
    // we'll show the formulation picker when tapped.
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

  const handleDrugSelect = useCallback(
    (drug: Drug) => {
      if (!searchResults) return;

      const baseName = drug.genericName ?? drug.drugName;
      const variants = groupedResults.groups?.get(baseName) ?? [drug];

      if (variants.length > 1) {
        // Multiple formulations — show picker
        setFormulationDrug(drug);
        setFormulations(variants);
      } else {
        // Single formulation — go straight to results
        navigateToResults(drug);
      }
    },
    [searchResults, groupedResults],
  );

  const navigateToResults = useCallback(
    (drug: Drug) => {
      setFormulationDrug(null);
      setFormulations([]);

      if (mode === 'single' && planIds.length === 1) {
        navigation.navigate('CoverageResult', {
          planId: planIds[0],
          drugId: drug.drugId,
        });
      } else {
        navigation.navigate('CoverageComparison', {
          planIds,
          drugId: drug.drugId,
        });
      }
    },
    [mode, planIds, navigation],
  );

  const showResults = activeTab === 'search' && debouncedQuery.length >= 2;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Search Drug
        </Text>
        <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
          {mode === 'single' ? '1 plan selected' : `${planIds.length} plans selected`}
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg }}>
        <Tabs tabs={SEARCH_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      {/* Search bar — auto-focused */}
      {activeTab === 'search' && (
        <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.md }}>
          <SearchBar
            placeholder="Search by drug name, generic, or class..."
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            autoFocus
          />
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'search' && (
          <>
            {/* Prompt */}
            {!showResults && !searching && (
              <EmptyState
                icon="💊"
                headline="Start typing a drug name"
                description="Search by brand name, generic name, or drug class. Minimum 2 characters."
              />
            )}

            {/* Loading */}
            {showResults && searching && (
              <LoadingState variant="skeleton" rows={5} layout="list" />
            )}

            {/* Error */}
            {showResults && searchError && (
              <View style={{ padding: Spacing.xl }}>
                <ErrorState
                  variant="card"
                  title={(error as any)?.displayMessage ?? 'Search unavailable'}
                  description="Check your connection and try again."
                  onRetry={() => refetch()}
                />
              </View>
            )}

            {/* No results */}
            {showResults && !searching && !searchError && groupedResults.unique?.length === 0 && (
              <EmptyState
                icon="🔍"
                headline={`No drugs matching "${debouncedQuery}"`}
                description="Check the spelling, or try searching by generic name."
              />
            )}

            {/* Results */}
            {showResults && !searching && !searchError && groupedResults.unique && groupedResults.unique.length > 0 && (
              <FlatList
                data={groupedResults.unique.slice(0, 10)}
                keyExtractor={(item) => String(item.drugId)}
                contentContainerStyle={{
                  paddingHorizontal: Spacing.xl,
                  paddingBottom: 40,
                }}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
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
          </>
        )}

        {activeTab === 'recent' && (
          <EmptyState
            icon="🕐"
            headline="No recent searches"
            description="Your recently searched drugs will appear here."
          />
        )}
      </View>

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
                <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
                  {formulationDrug.genericName ?? formulationDrug.drugName}
                </Text>
              )}
            </View>
            <Pressable onPress={() => setFormulationDrug(null)}>
              <Text style={{ ...Typography.bodyBold, color: theme.textAccent }}>Cancel</Text>
            </Pressable>
          </View>

          <FlatList
            data={formulations}
            keyExtractor={(item) => String(item.drugId)}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
            renderItem={({ item }) => (
              <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
                <Pressable
                  onPress={() => navigateToResults(item)}
                  style={{
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.xl,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.drugName} ${item.strength ?? ''} ${item.doseForm ?? ''}`}>
                  <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
                    {item.drugName}
                  </Text>
                  <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
                    {[item.strength, item.doseForm, item.route].filter(Boolean).join(' · ')}
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
