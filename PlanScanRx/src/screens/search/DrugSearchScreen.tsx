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
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
} from '../../components/primitives';
import { DrugAutocompleteItem } from '../../components/composites/DrugAutocompleteItem';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'DrugSearch'>;

export default function DrugSearchScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { planId, planName } = route.params;

  const [query, setQuery] = useState('');
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

  const handleDrugSelect = useCallback(
    (drug: Drug) => {
      if (!searchResults || !Array.isArray(searchResults)) return;

      const baseName = drug.genericName ?? drug.drugName;
      const variants = groupedResults.groups?.get(baseName) ?? [drug];

      if (variants.length > 1) {
        // Multiple formulations -- show picker
        setFormulationDrug(drug);
        setFormulations(variants);
      } else {
        // Single formulation -- go straight to results
        navigateToResults(drug);
      }
    },
    [searchResults, groupedResults],
  );

  const navigateToResults = useCallback(
    (drug: Drug) => {
      setFormulationDrug(null);
      setFormulations([]);
      navigation.navigate('CoverageResult', {
        planId,
        drugId: drug.drugId,
      });
    },
    [planId, navigation],
  );

  const showResults = debouncedQuery.length >= 2;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Search Drug
        </Text>
        <Text
          style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}
          numberOfLines={1}>
          {planName}
        </Text>
      </View>

      {/* Search bar -- auto-focused */}
      <View style={{ paddingHorizontal: Spacing.xl, marginBottom: Spacing.md }}>
        <SearchBar
          placeholder="Search by drug name, generic, or class..."
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          autoFocus
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Prompt */}
        {!showResults && !searching && (
          <EmptyState
            icon="pill"
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
        {showResults && !searching && !searchError && groupedResults.unique.length === 0 && (
          <EmptyState
            icon="search"
            headline={`No drugs matching "${debouncedQuery}"`}
            description="Check the spelling, or try searching by generic name."
          />
        )}

        {/* Results */}
        {showResults && !searching && !searchError && groupedResults.unique.length > 0 && (
          <FlatList
            data={groupedResults.unique.slice(0, 20)}
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
                    {[item.strength, item.doseForm, item.route].filter(Boolean).join(' \u00B7 ')}
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
