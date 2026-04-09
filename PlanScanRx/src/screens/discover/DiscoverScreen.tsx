import React from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/primitives';
import { ArticleCard } from '../../components/composites/ArticleCard';
import { useArticles } from '../../hooks/queries/useArticles';

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
