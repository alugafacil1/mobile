import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppTabs from './AppTabs';
import CreatePropertyScreen from '../screens/CreatePropertyScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={AppTabs}
        options={{ headerShown: false }}
      />

      {/* Outras telas fora da tabs */}
      <Stack.Screen
        name="CreateProperty"
        component={CreatePropertyScreen}
        options={{ title: 'Novo Imóvel' }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Mapa' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}