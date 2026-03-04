import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '../lib/auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../assets/logo.png';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation: any = useNavigation();

  function renderButtonsByRole() {
    switch (user?.role) {
      case 'TENANT':
        return (
          <>
            <MenuButton
              icon="search-outline"
              label="Procurar Imóveis"
              onPress={() => navigation.navigate('Properties')}
            />
            <MenuButton
              icon="heart-outline"
              label="Favoritos"
              onPress={() => navigation.navigate('Favorites')}
            />
            <MenuButton
              icon="person-outline"
              label="Minha Conta"
              onPress={() => navigation.navigate('Profile')}
            />
          </>
        );

      case 'OWNER':
        return (
          <>
            <MenuButton
              icon="home-outline"
              label="Meus Imóveis"
              onPress={() => navigation.navigate('Properties', {
                user_id: user?.user_id,
                role: user?.role,
              })}
            />
            <MenuButton
              icon="chatbubble-ellipses-outline"
              label="Meus Chats"
              onPress={() => navigation.navigate('Chats')}
            />
            <MenuButton
              icon="person-outline"
              label="Minha Conta"
              onPress={() => navigation.navigate('Profile')}
            />
          </>
        );

      default:
        return null;
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={Logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcome}>
          Olá, <Text style={styles.highlight}>{user?.name}</Text>!
        </Text>
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <MenuButton
          icon="map-outline"
          label="Abrir Mapa"
          onPress={() => navigation.navigate('Map', { latitude: -23.55052, longitude: -46.633308 })}
        />
        {renderButtonsByRole()}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sair do App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* Botão reutilizável */
function MenuButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#2563EB" />
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'space-between',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },

  logo: {
    width: 400,
    height: 180,
    marginBottom: 10,
  },

  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  highlight: {
    color: '#2563EB',
  },

  role: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  menuContainer: {
    gap: 16,
  },

  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },

  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    gap: 8,
  },

  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});