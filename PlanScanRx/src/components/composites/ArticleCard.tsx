import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface } from '../primitives';
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

export function ArticleCard({ article }: { article: Article }) {
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
