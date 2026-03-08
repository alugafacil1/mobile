import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppTabs from './AppTabs';
import CreatePropertyScreen from '../screens/CreatePropertyScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="Main"
        component={AppTabs}
        options={{ headerShown: false }}
      />

      {/* <Stack.Screen
        name="CreateProperty"
        component={CreatePropertyScreen}
        options={{ title: "Novo Imóvel" }}
      /> */}

    </Stack.Navigator>
  );
}