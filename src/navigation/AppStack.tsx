import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import CreatePropertyScreen from '../screens/CreatePropertyScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Tela Inicial', headerLeft: () => null }}
      />
      <Stack.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: 'Propriedades' }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{ title: 'Detalhes da Propriedade' }}
      />
      <Stack.Screen
        name="CreateProperty"
        component={CreatePropertyScreen}
        options={{ title: 'Criar Propriedade' }}
      />
    </Stack.Navigator>
  );
}