import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { NeuSurface } from './NeuSurface';

type LoadingStateProps = {
  variant: 'skeleton' | 'spinner' | 'overlay';
  rows?: number;
  layout?: 'list' | 'card' | 'detail';
};

function SkeletonBar({ width, height = 16 }: { width: string; height?: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height,
        width,
        backgroundColor: theme.shadowDark,
        borderRadius: Radius.inner,
        opacity: 0.15,
      }}
    />
  );
}

function SkeletonList({ rows }: { rows: number }) {
  return (
    <View style={{ padding: Spacing.xl, gap: Spacing.xl }}>
      {Array.from({ length: rows }).map((_, i) => (
        <NeuSurface key={i} level="extrudedSmall" cornerRadius={Radius.base}>
          <View style={{ padding: Spacing.lg, flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: Radius.inner, backgroundColor: 'rgba(163,177,198,0.15)' }} />
            <View style={{ flex: 1, gap: Spacing.sm }}>
              <SkeletonBar width="70%" />
              <SkeletonBar width="45%" height={12} />
            </View>
          </View>
        </NeuSurface>
      ))}
    </View>
  );
}

function SkeletonCard({ rows }: { rows: number }) {
  return (
    <View style={{ padding: Spacing.xl, gap: Spacing.xl }}>
      {Array.from({ length: rows }).map((_, i) => (
        <NeuSurface key={i} level="extruded" cornerRadius={Radius.container}>
          <View style={{ height: 120, borderRadius: Radius.container, padding: Spacing.xxl, justifyContent: 'space-between' }}>
            <SkeletonBar width="50%" height={20} />
            <SkeletonBar width="80%" />
            <SkeletonBar width="35%" height={12} />
          </View>
        </NeuSurface>
      ))}
    </View>
  );
}

function SkeletonDetail() {
  return (
    <View style={{ padding: Spacing.xl, gap: Spacing.xxl }}>
      <SkeletonBar width="60%" height={28} />
      <NeuSurface level="extruded" cornerRadius={Radius.container}>
        <View style={{ padding: Spacing.xxl, gap: Spacing.md }}>
          <SkeletonBar width="100%" />
          <SkeletonBar width="85%" />
          <SkeletonBar width="90%" />
        </View>
      </NeuSurface>
      <NeuSurface level="extrudedSmall" cornerRadius={Radius.base}>
        <View style={{ padding: Spacing.lg, height: 80 }} />
      </NeuSurface>
    </View>
  );
}

export function LoadingState({ variant, rows = 5, layout = 'list' }: LoadingStateProps) {
  const { theme } = useTheme();

  if (variant === 'spinner') {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface }}
        accessibilityState={{ busy: true }}
        accessibilityLabel="Loading">
        <NeuSurface level="extruded" cornerRadius={Radius.full}>
          <View style={{ width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        </NeuSurface>
      </View>
    );
  }

  if (variant === 'overlay') {
    return (
      <View
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: theme.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 100 }}
        accessibilityState={{ busy: true }}>
        <NeuSurface level="extruded" cornerRadius={Radius.base}>
          <View style={{ padding: Spacing.xxl, backgroundColor: theme.surface, borderRadius: Radius.base }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        </NeuSurface>
      </View>
    );
  }

  switch (layout) {
    case 'card': return <SkeletonCard rows={rows} />;
    case 'detail': return <SkeletonDetail />;
    default: return <SkeletonList rows={rows} />;
  }
}
