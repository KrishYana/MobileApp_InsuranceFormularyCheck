import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { Radius } from '../theme/radius';
import { NeuShadows } from '../theme/shadows';
import HomeScreen from '../screens/home/HomeScreen';
import SearchStack from './SearchStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for tabs not yet built
function PlaceholderScreen({ label, description }: { label: string; description: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, paddingHorizontal: Spacing.xxl }}>
      <Text style={{ ...Typography.title2, color: theme.textPrimary, marginBottom: Spacing.sm }}>{label}</Text>
      <Text style={{ ...Typography.body, color: theme.textSecondary, textAlign: 'center' }}>{description}</Text>
    </View>
  );
}

function DiscoverScreen() {
  return (
    <PlaceholderScreen
      label="Discover"
      description="Latest medical news tailored to your most prescribed drugs. Coming soon."
    />
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

function SettingsScreen() {
  return (
    <PlaceholderScreen
      label="Settings"
      description="Preferences, profile, and account management. Coming soon."
    />
  );
}

// Elevated center tab button
function ElevatedHomeIcon({ focused, color }: { focused: boolean; color: string }) {
  const { theme } = useTheme();

  return (
    <View style={styles.elevatedContainer}>
      {/* Dark shadow (bottom-right) */}
      <View style={[styles.elevatedCircle, {
        backgroundColor: focused ? theme.accent : theme.surface,
        ...NeuShadows.extruded.dark,
      }]}>
        {/* Light shadow (top-left) — inner view */}
        <View style={[styles.elevatedInner, {
          backgroundColor: focused ? theme.accent : theme.surface,
          ...NeuShadows.extruded.light,
        }]}>
          <Text style={{ fontSize: 26 }}>🏠</Text>
        </View>
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          paddingTop: Spacing.sm,
          height: 85,
          ...NeuShadows.extruded.light,
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
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📰</Text>,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <ElevatedHomeIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  elevatedContainer: {
    position: 'relative',
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevatedCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elevatedInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
