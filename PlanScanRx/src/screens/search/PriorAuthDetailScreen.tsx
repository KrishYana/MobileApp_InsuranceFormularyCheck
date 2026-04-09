import React from 'react';
import { View, Text, ScrollView, StatusBar, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
import type { PriorAuthCriteria } from '../../types/domain';
import type { ThemeTokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { usePriorAuthCriteria } from '../../hooks/queries/usePriorAuthCriteria';
import {
  Button,
  NeuSurface,
  NeuInset,
  NeuIconWell,
  EmptyState,
  ErrorState,
  LoadingState,
  AppIcon,
} from '../../components/primitives';
import type { AppIcons } from '../../components/primitives/Icon';

type Props = NativeStackScreenProps<SearchStackParamList, 'PriorAuthDetail'>;

type CriteriaConfig = {
  icon: keyof typeof AppIcons;
  color: (t: ThemeTokens) => string;
  label: string;
};

const CRITERIA_CONFIG: Record<string, CriteriaConfig> = {
  AGE: {
    icon: 'cake',
    color: (t) => t.statusPriorAuth,
    label: 'Age Requirement',
  },
  GENDER: {
    icon: 'gender',
    color: (t) => t.statusSpecialty,
    label: 'Gender Restriction',
  },
  DIAGNOSIS: {
    icon: 'hospital',
    color: (t) => t.statusStepTherapy,
    label: 'Required Diagnoses',
  },
  PRIOR_MEDICATION: {
    icon: 'pill',
    color: (t) => t.statusStepTherapy,
    label: 'Prior Medication',
  },
  LAB_RESULT: {
    icon: 'flask',
    color: (t) => t.info,
    label: 'Lab Results',
  },
  PROVIDER_TYPE: {
    icon: 'doctor',
    color: (t) => t.statusSpecialty,
    label: 'Provider Requirement',
  },
  QUANTITY: {
    icon: 'timer',
    color: (t) => t.statusQuantityLimit,
    label: 'Quantity Requirement',
  },
};

const DEFAULT_CONFIG: CriteriaConfig = {
  icon: 'clipboard',
  color: (t) => t.statusPriorAuth,
  label: 'Requirement',
};

function formatAgeRange(ageMin: number | null, ageMax: number | null): string {
  if (ageMin != null && ageMax != null) return `Patient must be between ${ageMin} and ${ageMax} years old`;
  if (ageMin != null) return `Patient must be ${ageMin} years or older`;
  if (ageMax != null) return `Patient must be ${ageMax} years old or younger`;
  return 'Age requirement applies';
}

function CriteriaCard({
  criteria,
  theme,
}: {
  criteria: PriorAuthCriteria;
  theme: ThemeTokens;
}) {
  const config = CRITERIA_CONFIG[criteria.criteriaType] ?? DEFAULT_CONFIG;
  const borderColor = config.color(theme);

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <NeuSurface level="extruded" cornerRadius={Radius.container}>
        <View
          style={{
            padding: Spacing.xxl,
            borderRadius: Radius.container,
            backgroundColor: theme.surface,
            borderLeftWidth: 5,
            borderLeftColor: borderColor,
          }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg }}>
            <NeuIconWell icon={config.icon} size={44} iconColor={borderColor} />
            <Text style={{ ...Typography.title3, color: theme.textPrimary, flex: 1 }}>
              {config.label}
            </Text>
          </View>

          {/* Content by type */}
          <CriteriaContent criteria={criteria} theme={theme} />
        </View>
      </NeuSurface>
    </View>
  );
}

function CriteriaContent({
  criteria,
  theme,
}: {
  criteria: PriorAuthCriteria;
  theme: ThemeTokens;
}) {
  switch (criteria.criteriaType) {
    case 'AGE':
      return (
        <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 24 }}>
          {formatAgeRange(criteria.ageMin, criteria.ageMax)}
        </Text>
      );

    case 'GENDER':
      return (
        <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 24 }}>
          Restricted to {criteria.genderRestriction ?? 'specific'} patients
        </Text>
      );

    case 'DIAGNOSIS':
      return (
        <View style={{ gap: Spacing.sm }}>
          <Text style={{ ...Typography.label, color: theme.textSecondary, marginBottom: Spacing.xs }}>
            Approved for the following diagnoses:
          </Text>
          {(criteria.requiredDiagnoses ?? []).map((code, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, paddingLeft: Spacing.sm }}>
              <Text style={{ ...Typography.body, color: theme.textSecondary }}>{'•'}</Text>
              <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, flex: 1 }}>{code}</Text>
            </View>
          ))}
          {(!criteria.requiredDiagnoses || criteria.requiredDiagnoses.length === 0) && (
            <Text style={{ ...Typography.body, color: theme.textSecondary }}>
              Specific diagnoses required — see source document for details.
            </Text>
          )}
        </View>
      );

    case 'PRIOR_MEDICATION':
      return (
        <View style={{ gap: Spacing.sm }}>
          <Text style={{ ...Typography.label, color: theme.textSecondary, marginBottom: Spacing.xs }}>
            Must have tried and failed:
          </Text>
          {(criteria.stepTherapyDrugs ?? []).map((drug, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, paddingLeft: Spacing.sm }}>
              <Text style={{ ...Typography.body, color: theme.textSecondary }}>{'•'}</Text>
              <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, flex: 1 }}>{drug}</Text>
            </View>
          ))}
          {(!criteria.stepTherapyDrugs || criteria.stepTherapyDrugs.length === 0) && criteria.criteriaDescription && (
            <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 24 }}>
              {criteria.criteriaDescription}
            </Text>
          )}
        </View>
      );

    case 'LAB_RESULT':
    case 'PROVIDER_TYPE':
      return (
        <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 24 }}>
          {criteria.criteriaDescription ?? 'Details not available — see source document.'}
        </Text>
      );

    case 'QUANTITY':
      return (
        <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 24 }}>
          {criteria.maxQuantity != null && criteria.quantityPeriodDays != null
            ? `Maximum ${criteria.maxQuantity} units per ${criteria.quantityPeriodDays} days`
            : criteria.criteriaDescription ?? 'Quantity restriction applies'}
        </Text>
      );

    default:
      return (
        <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 24 }}>
          {criteria.criteriaDescription ?? 'Details not available.'}
        </Text>
      );
  }
}

export default function PriorAuthDetailScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { entryId, drugName, planName } = route.params;

  const { data, isLoading, isError, error, refetch } = usePriorAuthCriteria(entryId);

  const handleOpenSourceDoc = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // URL failed to open — silently fail
    }
  };

  // Loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <LoadingState variant="skeleton" layout="detail" />
      </View>
    );
  }

  // Error
  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <View style={{ padding: Spacing.xl, flex: 1, justifyContent: 'center' }}>
          <ErrorState
            variant="card"
            title={(error as any)?.displayMessage ?? 'Unable to load prior auth criteria'}
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </View>
    );
  }

  // Empty
  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.xl }}>
          <View style={{ marginTop: Spacing.lg }}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={{ alignSelf: 'flex-start' }}>
              <NeuSurface level="extrudedSmall" cornerRadius={Radius.full}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: Radius.full,
                    backgroundColor: theme.surface,
                    gap: Spacing.sm,
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                    <AppIcon name="back" size={16} color={theme.textAccent} />
                    <Text style={{ ...Typography.body, color: theme.textAccent }}>Back</Text>
                  </View>
                </View>
              </NeuSurface>
            </Pressable>
          </View>
          <EmptyState
            icon="clipboard"
            headline="Prior authorization required"
            description={`Detailed criteria are not available for this drug. Contact ${planName} for PA requirements.`}
          />
        </ScrollView>
      </View>
    );
  }

  const sourceUrl = data.find((c) => c.sourceDocumentUrl)?.sourceDocumentUrl;

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}>
        {/* Back button */}
        <View style={{ marginTop: Spacing.lg }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ alignSelf: 'flex-start' }}>
            <NeuSurface level="extrudedSmall" cornerRadius={Radius.full}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.lg,
                  borderRadius: Radius.full,
                  backgroundColor: theme.surface,
                  gap: Spacing.sm,
                }}>
                <Text style={{ ...Typography.body, color: theme.textAccent }}>{'← Back'}</Text>
              </View>
            </NeuSurface>
          </Pressable>
        </View>

        {/* Header */}
        <View style={{ marginTop: Spacing.xl }}>
          <Text
            style={{ ...Typography.title1, color: theme.textPrimary }}
            accessibilityRole="header">
            Prior Authorization Requirements
          </Text>
          <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
            {drugName} on {planName}
          </Text>
        </View>

        {/* Summary banner */}
        <View style={{ marginTop: Spacing.xl }}>
          <NeuInset level="insetSmall" cornerRadius={Radius.base}>
            <View
              style={{
                padding: Spacing.lg,
                borderRadius: Radius.base,
                backgroundColor: theme.surface,
              }}>
              <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, lineHeight: 22 }}>
                Prior authorization must be approved before {drugName} can be dispensed under {planName}.
              </Text>
            </View>
          </NeuInset>
        </View>

        {/* Criteria cards */}
        <View style={{ marginTop: Spacing.xxl }}>
          {data.map((criteria) => (
            <CriteriaCard key={criteria.criteriaId} criteria={criteria} theme={theme} />
          ))}
        </View>

        {/* Source document link */}
        {sourceUrl && (
          <View style={{ marginTop: Spacing.md }}>
            <Button
              variant="tertiary"
              size="md"
              label="View Source Document"
              onPress={() => handleOpenSourceDoc(sourceUrl)}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
