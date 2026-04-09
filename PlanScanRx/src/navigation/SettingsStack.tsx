import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from './types';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import DataRetentionScreen from '../screens/settings/DataRetentionScreen';
import AboutLegalScreen from '../screens/settings/AboutLegalScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="DataRetention" component={DataRetentionScreen} />
      <Stack.Screen name="AboutLegal" component={AboutLegalScreen} />
    </Stack.Navigator>
  );
}
