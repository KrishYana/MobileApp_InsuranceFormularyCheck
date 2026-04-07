import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import AuthLandingScreen from '../screens/AuthLandingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="AuthLanding"
        component={AuthLandingScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
