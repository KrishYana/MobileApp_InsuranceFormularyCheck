import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
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
        tabBarStyle: { display: 'none' },
      }}>
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="DiscoverTab" component={DiscoverScreen} />
      <Tab.Screen name="InsightsTab" component={InsightsScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} />
    </Tab.Navigator>
  );
}
