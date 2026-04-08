import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { NeuShadows } from '../theme/shadows';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import HomeStack from './HomeStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

function PlaceholderScreen({ label, description }: { label: string; description: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, paddingHorizontal: Spacing.xxl }}>
      <Text style={{ ...Typography.title2, color: theme.textPrimary, marginBottom: Spacing.sm }}>{label}</Text>
      <Text style={{ ...Typography.body, color: theme.textSecondary, textAlign: 'center' }}>{description}</Text>
    </View>
  );
}

function InsightsScreen() {
  return (
    <PlaceholderScreen
      label="Key Insights"
      description="Prescription tendencies and insurer-level alternative recommendations. Coming soon."
    />
  );
}

export default function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          paddingTop: Spacing.sm,
          height: 85,
          ...NeuShadows.extrudedSmall.light,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          ...Typography.badge,
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'\uD83D\uDCF0'}</Text>,
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'\uD83C\uDFE0'}</Text>,
        }}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'\uD83D\uDCCA'}</Text>,
        }}
      />
      {/* Settings: hidden from tab bar, accessed via gear icon on Home screen */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarItemStyle: { display: 'none' },
          tabBarLabel: 'Settings',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
