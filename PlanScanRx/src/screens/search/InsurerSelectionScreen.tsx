import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { Insurer } from '../../types/domain';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useAppStore } from '../../stores/appStore';
import { useInsurers } from '../../hooks/queries/useInsurers';
import { useDebounce } from '../../hooks/useDebounce';
import {
  SearchBar,
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
} from '../../components/primitives';
import { InsurerCard } from '../../components/composites/InsurerCard';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'InsurerSelection'>;

export default function InsurerSelectionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const selectedState = useAppStore((s) => s.selectedState);

  const [search, setSearch] = useState('');
  const [showAllInsurers, setShowAllInsurers] = useState(false);
  const debouncedSearch = useDebounce(search, 200);

  const { data: insurers, isLoading, isError, error, refetch } = useInsurers(
    selectedState?.code ?? null,
  );

  // Split insurers into state-relevant vs other based on name matching
  const { localInsurers, otherInsurers } = useMemo(() => {
    if (!insurers || !Array.isArray(insurers) || !selectedState) {
      return { localInsurers: [] as Insurer[], otherInsurers: [] as Insurer[] };
    }

    const stateName = selectedState.name.toUpperCase();
    const stateCode = selectedState.code.toUpperCase();
    // Match patterns like "OF FLORIDA", "(FL)", "OF FL,"
    const statePatterns = [
      ` ${stateName}`,
      `(${stateCode})`,
      ` ${stateCode},`,
      ` ${stateCode} `,
    ];

    const local: Insurer[] = [];
    const other: Insurer[] = [];

    for (const ins of insurers) {
      const name = ins.insurerName.toUpperCase();
      // Check if insurer name references the selected state
      const isLocal = statePatterns.some((p) => name.includes(p));
      // Also consider "national" insurers (names without any state reference) as local
      const hasAnyStateRef = /\b(OF [A-Z]{2,}|[\(][A-Z]{2}[\)])\b/.test(name);
      if (isLocal || !hasAnyStateRef) {
        local.push(ins);
      } else {
        other.push(ins);
      }
    }

    return { localInsurers: local, otherInsurers: other };
  }, [insurers, selectedState]);

  // Apply search filter to the active list
  const filteredLocal = useMemo(() => {
    if (!debouncedSearch) return localInsurers;
    const q = debouncedSearch.toLowerCase();
    return localInsurers.filter((i: Insurer) => i.insurerName.toLowerCase().includes(q));
  }, [localInsurers, debouncedSearch]);

  const filteredOther = useMemo(() => {
    if (!debouncedSearch) return otherInsurers;
    const q = debouncedSearch.toLowerCase();
    return otherInsurers.filter((i: Insurer) => i.insurerName.toLowerCase().includes(q));
  }, [otherInsurers, debouncedSearch]);

  // Auto-expand if no local insurers match the state
  useEffect(() => {
    if (localInsurers.length === 0 && otherInsurers.length > 0) {
      setShowAllInsurers(true);
    }
  }, [localInsurers.length, otherInsurers.length]);

  const handleInsurerPress = (insurer: Insurer) => {
    navigation.navigate('PlanSelection', { insurer });
  };

  // Render content based on state
  const renderContent = () => {
    if (!selectedState) {
      return (
        <EmptyState
          icon={'\uD83D\uDCCD'}
          headline="Select a state first"
          description="Choose your state from the bar above to see available insurers."
        />
      );
    }

    if (isLoading) {
      return <LoadingState variant="skeleton" rows={6} layout="list" />;
    }

    if (isError) {
      const appError = error as any;
      return (
        <View style={{ padding: Spacing.xl }}>
          <ErrorState
            variant="card"
            title={appError?.displayMessage ?? 'Unable to load insurers'}
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      );
    }

    if (!insurers || !Array.isArray(insurers) || insurers.length === 0) {
      return (
        <EmptyState
          icon={'\uD83C\uDFE5'}
          headline={`No insurer data for ${selectedState.name} yet`}
          description="Insurer and plan data is still being ingested. Please check back shortly."
        />
      );
    }


    if (debouncedSearch && filteredLocal.length === 0 && filteredOther.length === 0) {
      return (
        <EmptyState
          icon={'\uD83D\uDD0D'}
          headline={`No insurers matching "${debouncedSearch}"`}
          description="Check the spelling or try a different search."
          ctaLabel="Clear search"
          onCtaPress={() => setSearch('')}
        />
      );
    }

    // Build a combined list: local insurers + divider + other insurers
    type ListItem =
      | { type: 'insurer'; data: Insurer }
      | { type: 'divider' };

    const listData: ListItem[] = filteredLocal.map((i) => ({ type: 'insurer' as const, data: i }));

    if (filteredOther.length > 0) {
      listData.push({ type: 'divider' as const });
      if (showAllInsurers || debouncedSearch) {
        listData.push(...filteredOther.map((i) => ({ type: 'insurer' as const, data: i })));
      }
    }

    return (
      <FlatList
        data={listData}
        keyExtractor={(item, idx) =>
          item.type === 'insurer' ? String(item.data.insurerId) : `divider-${idx}`
        }
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.sm,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          if (item.type === 'divider') {
            return (
              <Pressable
                onPress={() => setShowAllInsurers((v) => !v)}
                style={{
                  paddingVertical: Spacing.lg,
                  marginTop: Spacing.md,
                  alignItems: 'center',
                }}>
                <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: Spacing.md,
                      paddingHorizontal: Spacing.xxl,
                      borderRadius: Radius.base,
                      backgroundColor: theme.surface,
                      gap: Spacing.sm,
                    }}>
                    <Text style={{ ...Typography.label, color: theme.textAccent }}>
                      {showAllInsurers
                        ? 'Hide out-of-state insurers'
                        : `Show ${filteredOther.length} out-of-state insurers`}
                    </Text>
                    <Text style={{ color: theme.textAccent, fontSize: 12 }}>
                      {showAllInsurers ? '\u25B2' : '\u25BC'}
                    </Text>
                  </View>
                </NeuSurface>
              </Pressable>
            );
          }

          return (
            <InsurerCard
              name={item.data.insurerName}
              selected={false}
              onPress={() => handleInsurerPress(item.data)}
            />
          );
        }}
      />
    );
  };

  const insurerCount = localInsurers.length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Persistent state bar */}
      <StateSelectorBar />

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Select Insurer
        </Text>
        <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
          {insurerCount > 0
            ? `${insurerCount} insurers in ${selectedState?.name ?? 'your state'}`
            : 'Choose your insurance provider to get started'}
        </Text>
      </View>

      {/* Search bar */}
      {selectedState && insurers && Array.isArray(insurers) && insurers.length > 0 && (
        <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md }}>
          <SearchBar
            placeholder={`Search insurers in ${selectedState.name}...`}
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
          />
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>{renderContent()}</View>
    </View>
  );
}
