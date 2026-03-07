import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, AuthContext } from '../src/lib/auth/AuthContext';
import AuthStack from '../src/navigation/AuthStack';
import AppStack from '../src/navigation/AppStack';

function RootNavigation() {
  const { isAuthenticated, loading, logout } = React.useContext(AuthContext);

  // Verifica se o token foi removido pelo interceptor
  useEffect(() => {
    const checkToken = async () => {
      try {
        if (isAuthenticated) {
          const token = await SecureStore.getItemAsync('token');
          
          // Se estava autenticado mas o token foi removido, faz logout
          if (!token) {
            await logout();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      }
    };

    const interval = setInterval(checkToken, 1000); // Verifica a cada segundo

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <RootNavigation />
    </AuthProvider>
  );
}