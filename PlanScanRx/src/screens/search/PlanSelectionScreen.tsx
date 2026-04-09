import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { Plan } from '../../types/domain';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { useAppStore } from '../../stores/appStore';
import { usePlans } from '../../hooks/queries/usePlans';
import { useDebounce } from '../../hooks/useDebounce';
import {
  SearchBar,
  EmptyState,
  ErrorState,
  LoadingState,
  NeuSurface,
} from '../../components/primitives';
import StateSelectorBar from '../../components/composites/StateSelectorBar';

type Props = NativeStackScreenProps<SearchStackParamList, 'PlanSelection'>;

export default function PlanSelectionScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const selectedState = useAppStore((s) => s.selectedState);

  const { insurer } = route.params;

  const [planSearch, setPlanSearch] = useState('');
  const debouncedSearch = useDebounce(planSearch, 200);

  // Fetch plans for the selected insurer
  const { data: plans, isLoading, isError, error, refetch } = usePlans(
    insurer.insurerId,
    selectedState?.code ?? null,
  );

  // Client-side filter
  const filteredPlans = useMemo(() => {
    if (!plans || !Array.isArray(plans)) return [];
    if (!debouncedSearch) return plans;
    const q = debouncedSearch.toLowerCase();
    return plans.filter((p: Plan) => p.planName.toLowerCase().includes(q));
  }, [plans, debouncedSearch]);

  const handlePlanPress = (plan: Plan) => {
    navigation.navigate('DrugSearch', {
      planId: plan.planId,
      planName: plan.planName,
    });
  };

  const planCount = plans && Array.isArray(plans) ? plans.length : 0;

  const renderPlanItem = ({ item }: { item: Plan }) => {
    // Build subtitle from available metadata
    const subtitleParts: string[] = [];
    if (item.planType) subtitleParts.push(item.planType);
    if (item.marketType) subtitleParts.push(item.marketType.replace('_', ' '));
    if (item.planYear && item.planYear > 0) subtitleParts.push(String(item.planYear));

    return (
      <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
        <Pressable
          onPress={() => handlePlanPress(item)}
          style={{
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing.xl,
            borderRadius: Radius.base,
            backgroundColor: theme.surface,
          }}
          accessibilityRole="button"
          accessibilityLabel={item.planName}>
          <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary }}>
            {item.planName}
          </Text>
          {subtitleParts.length > 0 && (
            <Text
              style={{
                ...Typography.caption,
                color: theme.textSecondary,
                marginTop: Spacing.xs,
              }}>
              {subtitleParts.join(' \u00B7 ')}
            </Text>
          )}
        </Pressable>
      </NeuSurface>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState variant="skeleton" rows={6} layout="list" />;
    }

    if (isError) {
      const appError = error as any;
      return (
        <View style={{ padding: Spacing.xl }}>
          <ErrorState
            variant="card"
            title={appError?.displayMessage ?? 'Unable to load plans'}
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      );
    }

    if (!plans || !Array.isArray(plans) || plans.length === 0) {
      return (
        <EmptyState
          icon="clipboard"
          headline={`No plans found for ${insurer.insurerName}`}
          description="This insurer may not have plans loaded yet. Try a different insurer."
        />
      );
    }

    if (debouncedSearch && filteredPlans.length === 0) {
      return (
        <EmptyState
          icon="search"
          headline={`No plans matching "${debouncedSearch}"`}
          description="Check the spelling or try a different search."
          ctaLabel="Clear search"
          onCtaPress={() => setPlanSearch('')}
        />
      );
    }

    return (
      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => String(item.planId)}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.sm,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        keyboardShouldPersistTaps="handled"
        renderItem={renderPlanItem}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      <StateSelectorBar />

      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Select Plan
        </Text>
        <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
          {insurer.insurerName}
          {planCount > 0 ? ` \u00B7 ${planCount} plans` : ''}
        </Text>
      </View>

      {/* Search bar */}
      {plans && Array.isArray(plans) && plans.length > 0 && (
        <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md }}>
          <SearchBar
            placeholder={`Search ${insurer.insurerName} plans...`}
            value={planSearch}
            onChangeText={setPlanSearch}
            onClear={() => setPlanSearch('')}
          />
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>{renderContent()}</View>
    </View>
  );
}
