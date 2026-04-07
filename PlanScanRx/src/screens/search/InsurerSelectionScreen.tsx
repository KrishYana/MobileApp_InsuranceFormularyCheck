import React, { useState, useMemo, useCallback } from 'react';
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
import { useToast } from '../../context/ToastContext';
import {
  SearchBar,
  EmptyState,
  ErrorState,
  LoadingState,
  Button,
  NeuSurface,
} from '../../components/primitives';
import { InsurerCard } from '../../components/composites/InsurerCard';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

const MAX_INSURERS = 3;

type Props = NativeStackScreenProps<SearchStackParamList, 'InsurerSelection'>;

export default function InsurerSelectionScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const selectedState = useAppStore((s) => s.selectedState);

  const [search, setSearch] = useState('');
  const [selectedInsurers, setSelectedInsurers] = useState<Insurer[]>([]);
  const debouncedSearch = useDebounce(search, 200);

  const { data: insurers, isLoading, isError, error, refetch } = useInsurers(
    selectedState?.code ?? null,
  );

  // Client-side filter
  const filteredInsurers = useMemo(() => {
    if (!insurers) return [];
    if (!debouncedSearch) return insurers;
    const q = debouncedSearch.toLowerCase();
    return insurers.filter((i) => i.insurerName.toLowerCase().includes(q));
  }, [insurers, debouncedSearch]);

  const isSelected = useCallback(
    (insurer: Insurer) => selectedInsurers.some((s) => s.insurerId === insurer.insurerId),
    [selectedInsurers],
  );

  const toggleInsurer = useCallback(
    (insurer: Insurer) => {
      setSelectedInsurers((prev) => {
        const exists = prev.some((s) => s.insurerId === insurer.insurerId);
        if (exists) {
          return prev.filter((s) => s.insurerId !== insurer.insurerId);
        }
        if (prev.length >= MAX_INSURERS) {
          showToast({ message: `Maximum ${MAX_INSURERS} insurers`, variant: 'warning' });
          return prev;
        }
        return [...prev, insurer];
      });
    },
    [showToast],
  );

  const removeInsurer = useCallback((insurerId: number) => {
    setSelectedInsurers((prev) => prev.filter((s) => s.insurerId !== insurerId));
  }, []);

  const handleContinue = () => {
    navigation.navigate('PlanSelection', { selectedInsurers });
  };

  // Render content based on state
  const renderContent = () => {
    if (!selectedState) {
      return (
        <EmptyState
          icon="📍"
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

    if (!insurers || insurers.length === 0) {
      return (
        <EmptyState
          icon="🏥"
          headline={`No insurer data for ${selectedState.name} yet`}
          description="We currently cover Medicare Part D plans. More coverage coming soon."
        />
      );
    }

    if (debouncedSearch && filteredInsurers.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          headline={`No insurers matching "${debouncedSearch}"`}
          description="Check the spelling or try a different search."
          ctaLabel="Clear search"
          onCtaPress={() => setSearch('')}
        />
      );
    }

    return (
      <FlatList
        data={filteredInsurers}
        keyExtractor={(item) => String(item.insurerId)}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.sm,
          paddingBottom: 120,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <InsurerCard
            name={item.insurerName}
            selected={isSelected(item)}
            onPress={() => toggleInsurer(item)}
            disabled={
              !isSelected(item) && selectedInsurers.length >= MAX_INSURERS
            }
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
          Select Insurers
        </Text>
        <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
          Up to {MAX_INSURERS} insurers
        </Text>
      </View>

      {/* Selected chips */}
      {selectedInsurers.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.xl,
            paddingBottom: Spacing.md,
          }}>
          {selectedInsurers.map((insurer) => (
            <NeuSurface
              key={insurer.insurerId}
              level="extrudedSmall"
              cornerRadius={Radius.full}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.sm,
                  paddingLeft: Spacing.md,
                  paddingRight: Spacing.xs,
                  paddingVertical: Spacing.xs,
                  borderRadius: Radius.full,
                  backgroundColor: theme.surface,
                }}>
                <Text style={{ ...Typography.label, color: theme.textAccent }}>
                  {insurer.insurerName}
                </Text>
                <Pressable
                  onPress={() => removeInsurer(insurer.insurerId)}
                  hitSlop={8}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme.accent,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  accessibilityLabel={`Remove ${insurer.insurerName}`}>
                  <Text style={{ color: theme.textInverse, fontSize: 12, fontWeight: '700' }}>✕</Text>
                </Pressable>
              </View>
            </NeuSurface>
          ))}
        </View>
      )}

      {/* Search bar */}
      {selectedState && insurers && insurers.length > 0 && (
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

      {/* Sticky continue button */}
      {selectedInsurers.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: Spacing.xl,
            paddingTop: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.surface,
          }}>
          <Button
            variant="primary"
            size="lg"
            label={`Continue with ${selectedInsurers.length} insurer${selectedInsurers.length > 1 ? 's' : ''} →`}
            onPress={handleContinue}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}
