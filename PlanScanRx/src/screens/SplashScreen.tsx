import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StatusBar, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import { AppIcon } from '../components/primitives/Icon';
import { Typography } from '../theme/typography';
import { queryClient } from '../stores/queryClient';
import { queryKeys } from '../stores/queryClient';
import { formularyService } from '../api/services/formulary.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const SPLASH_MIN_MS = 1800;
const SPLASH_MAX_MS = 2500;

export default function SplashScreen({ navigation }: Props) {
  const { theme } = useTheme();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const hasNavigated = useRef(false);

  const navigateAway = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    // Fade out before navigating
    Animated.timing(exitOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('AuthLanding');
    });
  }, [navigation, exitOpacity]);

  useEffect(() => {
    const startTime = Date.now();

    // --- Animation sequence ---
    // Phase 1: Logo fades in and scales up with spring
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 14,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: Neumorphic ring pulses outward (200ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1.3,
          damping: 10,
          stiffness: 60,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 200);

    // Phase 3: Tagline fades in (600ms delay)
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600);

    // --- Prefetch data in background ---
    const prefetch = async () => {
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: queryKeys.articles.all,
            queryFn: () => formularyService.getArticles(),
          }),
        ]);
      } catch {
        // Silent — prefetch is best-effort
      }
    };
    prefetch();

    // --- Navigate after minimum time ---
    const minTimer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= SPLASH_MIN_MS) {
        navigateAway();
      }
    }, SPLASH_MIN_MS);

    // Hard max timeout
    const maxTimer = setTimeout(navigateAway, SPLASH_MAX_MS);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [logoScale, logoOpacity, taglineOpacity, ringScale, ringOpacity, navigateAway]);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.surface, opacity: exitOpacity }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.surface}
      />

      {/* Neumorphic pulse ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: theme.accent,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* Logo icon with neumorphic well */}
      <Animated.View
        style={[
          styles.logoWell,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.shadowDark,
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}>
        {/* Light shadow layer */}
        <View
          style={[
            styles.logoInner,
            {
              backgroundColor: theme.surface,
              shadowColor: theme.shadowLight,
              shadowOffset: { width: -6, height: -6 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
            },
          ]}>
          <AppIcon name="pill" size={44} color={theme.accent} />
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: logoOpacity, marginTop: 24 }}>
        <Text style={[Typography.title1, { color: theme.textPrimary, textAlign: 'center' }]}>
          PlanScanRx
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity, marginTop: 8 }}>
        <Text
          style={[
            Typography.caption,
            { color: theme.textSecondary, textAlign: 'center' },
          ]}>
          Formulary coverage, instantly.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
  },
  logoWell: {
    width: 96,
    height: 96,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 96,
    height: 96,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
