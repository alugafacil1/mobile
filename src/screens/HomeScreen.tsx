import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../lib/auth/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {user?.name}!</Text>
      <Text style={styles.subtitle}>Perfil: {user?.role}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Sair do App" onPress={logout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 30, color: '#555' },
  buttonContainer: { width: '100%', maxWidth: 200 }
});