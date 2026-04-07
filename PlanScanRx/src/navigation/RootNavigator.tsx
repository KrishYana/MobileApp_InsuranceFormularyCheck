import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import { LoadingState } from '../components/primitives';

export default function RootNavigator() {
  const { mode, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState variant="spinner" />;
  }

  return (
    <NavigationContainer>
      {mode ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

// Re-export for backward compat with SplashScreen/AuthLanding
// that still reference RootStackParamList
export type RootStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
  Home: undefined;
};
