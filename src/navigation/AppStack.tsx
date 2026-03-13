import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppTabs from './AppTabs';
import CreatePropertyScreen from '../screens/CreatePropertyScreen';
import CreateSimplePropertyScreen from '../screens/CreateSimplePropertyScreen';
import SimplePropertyRegisterScreen from '../screens/SimplePropertyRegisterScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="Main"
        component={AppTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateSimpleProperty"
        component={CreateSimplePropertyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SimplePropertyRegister"
        component={SimplePropertyRegisterScreen}
        options={{ title: 'Cadastrar Imóvel Simples', headerShown: false }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown:false }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}