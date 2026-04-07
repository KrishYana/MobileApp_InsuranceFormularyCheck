import React, { useMemo } from 'react';
import { View, Text, ScrollView, StatusBar, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../navigation/types';
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
} from '../../components/primitives';

type Props = NativeStackScreenProps<SearchStackParamList, 'StepTherapyDetail'>;

export default function StepTherapyDetailScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { entryId, drugName, planName } = route.params;

  const { data, isLoading, isError, error, refetch } = usePriorAuthCriteria(entryId);

  // Extract step therapy data from all criteria
  const { uniqueDrugNames, description, sourceUrl } = useMemo(() => {
    if (!data) return { uniqueDrugNames: [] as string[], description: '', sourceUrl: undefined };

    const stepCriteria = data.filter(
      (c) => (c.stepTherapyDrugs ?? []).length > 0 || c.stepTherapyDescription,
    );

    const allDrugNames = stepCriteria.flatMap((c) => c.stepTherapyDrugs ?? []);
    const unique = [...new Set(allDrugNames)];

    const desc = stepCriteria
      .map((c) => c.stepTherapyDescription)
      .filter(Boolean)
      .join('\n\n');

    const url = stepCriteria.find((c) => c.sourceDocumentUrl)?.sourceDocumentUrl;

    return { uniqueDrugNames: unique, description: desc, sourceUrl: url };
  }, [data]);

  const hasContent = uniqueDrugNames.length > 0 || description;

  const handleOpenSourceDoc = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // URL failed to open
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
            title={(error as any)?.displayMessage ?? 'Unable to load step therapy details'}
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </View>
    );
  }

  // Empty — no data at all, or no step therapy content extractable
  if (!data || !hasContent) {
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
                  <Text style={{ ...Typography.body, color: theme.textAccent }}>{'← Back'}</Text>
                </View>
              </NeuSurface>
            </Pressable>
          </View>
          <EmptyState
            icon="💊"
            headline="Step therapy required"
            description={`Specific prerequisite medications are not identified in our data. Contact ${planName} for step therapy requirements.`}
          />
        </ScrollView>
      </View>
    );
  }

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
            Step Therapy Requirements
          </Text>
          <Text style={{ ...Typography.caption, color: theme.textSecondary, marginTop: Spacing.xs }}>
            {drugName} on {planName}
          </Text>
        </View>

        {/* Explanation banner */}
        <View style={{ marginTop: Spacing.xl }}>
          <NeuInset level="insetSmall" cornerRadius={Radius.base}>
            <View
              style={{
                padding: Spacing.lg,
                borderRadius: Radius.base,
                backgroundColor: theme.surface,
              }}>
              <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, lineHeight: 22 }}>
                Patient must first try and fail on these medications before {drugName} can be approved:
              </Text>
            </View>
          </NeuInset>
        </View>

        {/* Prerequisite drug list */}
        {uniqueDrugNames.length > 0 && (
          <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
            {uniqueDrugNames.map((drugNameItem, index) => (
              <NeuSurface key={index} level="extrudedSmall" cornerRadius={Radius.base}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: Spacing.lg,
                    borderRadius: Radius.base,
                    backgroundColor: theme.surface,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.statusStepTherapy,
                    gap: Spacing.md,
                  }}>
                  <NeuIconWell icon="💊" size={40} iconColor={theme.statusStepTherapy} />
                  <Text style={{ ...Typography.bodyMedium, color: theme.textPrimary, flex: 1 }}>
                    {drugNameItem}
                  </Text>
                </View>
              </NeuSurface>
            ))}
          </View>
        )}

        {/* Free text description callout */}
        {description ? (
          <View style={{ marginTop: Spacing.xl }}>
            <NeuInset level="insetSmall" cornerRadius={Radius.base}>
              <View
                style={{
                  padding: Spacing.lg,
                  borderRadius: Radius.base,
                  backgroundColor: theme.surface,
                }}>
                <Text style={{ ...Typography.label, color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Additional Information
                </Text>
                <Text style={{ ...Typography.body, color: theme.textPrimary, lineHeight: 22, fontStyle: 'italic' }}>
                  {description}
                </Text>
              </View>
            </NeuInset>
          </View>
        ) : null}

        {/* Source document link */}
        {sourceUrl && (
          <View style={{ marginTop: Spacing.xl }}>
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
