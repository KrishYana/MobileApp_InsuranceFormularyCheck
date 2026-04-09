import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import InsurerSelectionScreen from '../screens/search/InsurerSelectionScreen';
import PlanSelectionScreen from '../screens/search/PlanSelectionScreen';
import DrugSearchScreen from '../screens/search/DrugSearchScreen';
import CoverageResultScreen from '../screens/search/CoverageResultScreen';
import CoverageComparisonScreen from '../screens/search/CoverageComparisonScreen';
import PriorAuthDetailScreen from '../screens/search/PriorAuthDetailScreen';
import StepTherapyDetailScreen from '../screens/search/StepTherapyDetailScreen';
import QuantityLimitDetailScreen from '../screens/search/QuantityLimitDetailScreen';
import DrugAlternativesScreen from '../screens/search/DrugAlternativesScreen';
import DrugFirstSearchScreen from '../screens/search/DrugFirstSearchScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="InsurerSelection" component={InsurerSelectionScreen} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
      <Stack.Screen name="DrugSearch" component={DrugSearchScreen} />
      <Stack.Screen name="CoverageResult" component={CoverageResultScreen} />
      <Stack.Screen name="CoverageComparison" component={CoverageComparisonScreen} />
      <Stack.Screen name="PriorAuthDetail" component={PriorAuthDetailScreen} />
      <Stack.Screen name="StepTherapyDetail" component={StepTherapyDetailScreen} />
      <Stack.Screen name="QuantityLimitDetail" component={QuantityLimitDetailScreen} />
      <Stack.Screen name="DrugAlternatives" component={DrugAlternativesScreen} />
      <Stack.Screen name="DrugFirstSearch" component={DrugFirstSearchScreen} />
    </Stack.Navigator>
  );
}
