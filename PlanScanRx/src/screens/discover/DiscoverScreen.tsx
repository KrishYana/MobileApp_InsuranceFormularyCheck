import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import {
  NeuSurface,
  Badge,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/primitives';
import { useArticles } from '../../hooks/queries/useArticles';
import type { Article } from '../../types/domain';

const sourceColors: Record<string, string> = {
  'FDA Safety': '#E53E3E',
  'FDA': '#E53E3E',
  'PubMed': '#3182CE',
  'STAT News': '#2D3748',
  'FiercePharma': '#DD6B20',
  'Healio Pharmacy': '#38A169',
  'NEJM': '#C53030',
  'JAMA': '#2B6CB0',
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ArticleCard({ article }: { article: Article }) {
  const { theme } = useTheme();
  const badgeColor = sourceColors[article.sourceName] ?? theme.accent;

  const handlePress = () => {
    if (article.sourceUrl) {
      Linking.openURL(article.sourceUrl);
    }
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <NeuSurface level="extruded" cornerRadius={Radius.container}>
        <View style={{ padding: Spacing.xl }}>
          {/* Source badge + date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: Spacing.md,
            }}>
            <View
              style={{
                backgroundColor: badgeColor,
                paddingHorizontal: Spacing.sm,
                paddingVertical: Spacing.xxs,
                borderRadius: Radius.base,
              }}>
              <Text
                style={{
                  ...Typography.badge,
                  color: '#FFFFFF',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                {article.sourceName}
              </Text>
            </View>
            <Text style={{ ...Typography.caption, color: theme.textSecondary }}>
              {formatRelativeDate(article.publishedAt)}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              ...Typography.bodyMedium,
              color: theme.textPrimary,
              lineHeight: 22,
            }}
            numberOfLines={3}>
            {article.title}
          </Text>

          {/* Summary */}
          {article.summary && (
            <Text
              style={{
                ...Typography.caption,
                color: theme.textSecondary,
                marginTop: Spacing.sm,
                lineHeight: 18,
              }}
              numberOfLines={3}>
              {article.summary}
            </Text>
          )}

          {/* Drug class chips */}
          {article.drugClasses && article.drugClasses.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: Spacing.xs,
                marginTop: Spacing.md,
              }}>
              {article.drugClasses.slice(0, 3).map((cls) => (
                <View
                  key={cls}
                  style={{
                    backgroundColor: `${theme.accent}1A`,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xxs,
                    borderRadius: Radius.base,
                  }}>
                  <Text style={{ ...Typography.badge, color: theme.accent, fontSize: 10 }}>
                    {cls}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </NeuSurface>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { data: articles, isLoading, isError, error, refetch, isRefetching } = useArticles();

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState variant="skeleton" rows={4} layout="list" />;
    }

    if (isError) {
      return (
        <View style={{ padding: Spacing.xl }}>
          <ErrorState
            variant="card"
            title="Unable to load articles"
            description="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      );
    }

    if (!articles || articles.length === 0) {
      return (
        <EmptyState
          icon={'\uD83D\uDCF0'}
          headline="No articles yet"
          description="Medical news and research articles will appear here once ingested."
        />
      );
    }

    return (
      <FlatList
        data={articles}
        keyExtractor={(item) => String(item.articleId)}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.sm,
          paddingBottom: insets.bottom + 40,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={theme.accent}
          />
        }
        renderItem={({ item }) => <ArticleCard article={item} />}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.md,
        }}>
        <Text style={{ ...Typography.title1, color: theme.textPrimary }}>
          Discover
        </Text>
        <Text
          style={{
            ...Typography.caption,
            color: theme.textSecondary,
            marginTop: Spacing.xs,
          }}>
          Latest medical news tailored to your practice
        </Text>
      </View>

      <View style={{ flex: 1 }}>{renderContent()}</View>
    </View>
  );
}
