import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (err) {
              console.error('Erro ao fazer logout:', err);
              Alert.alert('Erro', 'Falha ao fazer logout');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'account',
      label: 'Informações da Conta',
      icon: 'person-outline',
      onPress: () => console.log('Ir para informações da conta'),
    },
    {
      id: 'properties',
      label: 'Imóveis Cadastrados',
      icon: 'home-outline',
      onPress: () => navigation.navigate('MyProperties'),
    },
    {
      id: 'support',
      label: 'Suporte ao Cliente',
      icon: 'help-circle-outline',
      onPress: () => console.log('Abrir suporte'),
    },
    {
      id: 'logout',
      label: 'Sair',
      icon: 'log-out-outline',
      color: '#EF4444',
      onPress: handleLogout,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header com botão voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Foto do usuário */}
        <View style={styles.profilePhotoContainer}>
          <View style={styles.profilePhoto}>
            <Ionicons name="person" size={60} color="#9CA3AF" />
          </View>
          <TouchableOpacity style={styles.editPhotoButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Informações do usuário */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu itens */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
              disabled={loading}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.color || '#6B7280'}
              />
              <Text
                style={[
                  styles.menuLabel,
                  item.color && { color: item.color },
                ]}
              >
                {item.label}
              </Text>
              {item.id !== 'logout' && (
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 8,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  menuContainer: {
    marginTop: 8,
    marginHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    marginBottom: 1,
    borderRadius: 8,
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
});
