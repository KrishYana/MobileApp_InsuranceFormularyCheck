import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, Pressable, StatusBar } from 'react-native';
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
  AppIcon,
} from '../../components/primitives';
import { InsurerCard } from '../../components/composites/InsurerCard';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'InsurerSelection'>;

export default function InsurerSelectionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const selectedState = useAppStore((s) => s.selectedState);

  const [search, setSearch] = useState('');
  const [showNational, setShowNational] = useState(false);
  const debouncedSearch = useDebounce(search, 200);

  const { data: sectionedData, isLoading, isError, error, refetch } = useInsurers(
    selectedState?.code ?? null,
  );

  // Consume pre-sectioned data directly from the API response
  const localInsurers = sectionedData?.localInsurers ?? [];
  const nationalInsurers = sectionedData?.nationalInsurers ?? [];

  // Apply search filter
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

  // Build SectionList sections from API-provided local/national buckets
  const sections = useMemo(() => {
    const result: { title: string; data: Insurer[] }[] = [];

    if (filteredLocal.length > 0) {
      result.push({
        title: `Plans in ${selectedState?.name ?? 'your state'}`,
        data: filteredLocal,
      });
    }

    // Show national section if expanded, actively searching, or no local results
    const showNationalSection = showNational || !!debouncedSearch || filteredLocal.length === 0;
    if (filteredNational.length > 0 && showNationalSection) {
      result.push({
        title: 'National Plans (Medicare Part D)',
        data: filteredNational,
      });
    }

    return result;
  }, [filteredLocal, filteredNational, selectedState, showNational, debouncedSearch]);

  const totalCount = localInsurers.length + nationalInsurers.length;
  const hasData = totalCount > 0;

  // Render content based on state
  const renderContent = () => {
    if (!selectedState) {
      return (
        <EmptyState
          icon="location"
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
          <NeuSurface level="flat" cornerRadius={Radius.sm}>
            <View
              style={{
                paddingVertical: Spacing.md,
                paddingHorizontal: Spacing.sm,
                marginTop: Spacing.md,
                marginBottom: Spacing.sm,
              }}>
              <Text style={{ ...Typography.label, color: theme.textSecondary }}>
                {title}
              </Text>
            </View>
          </NeuSurface>
        )}
        renderSectionFooter={({ section }) => {
          // Show toggle button after local section when national insurers exist
          if (
            section.title !== 'National Plans (Medicare Part D)' &&
            filteredNational.length > 0 &&
            !debouncedSearch &&
            filteredLocal.length > 0
          ) {
            return (
              <Pressable
                onPress={() => setShowNational((v) => !v)}
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
                      {showNational
                        ? 'Hide national plans'
                        : `Show ${filteredNational.length} national plans`}
                    </Text>
                    <AppIcon
                      name={showNational ? 'collapse' : 'expand'}
                      size={12}
                      color={theme.textAccent}
                    />
                  </View>
                </NeuSurface>
              </Pressable>
            );
          }
          return null;
        }}
        renderItem={({ item }) => (
          <InsurerCard
            name={item.insurerName}
            selected={false}
            onPress={() => handleInsurerPress(item)}
          />
        )}
      />
    );
  };

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
          {localInsurers.length > 0
            ? `${localInsurers.length} insurers in ${selectedState?.name ?? 'your state'}`
            : 'Choose your insurance provider to get started'}
        </Text>
      </View>

      {/* Search bar */}
      {selectedState && hasData && (
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
