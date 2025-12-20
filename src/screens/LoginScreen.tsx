import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import Checkbox from 'expo-checkbox'; 
import { useAuth } from '../lib/auth/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('Login');

  async function handleLogin() {
    try {
      const emailClean = email.trim().toLowerCase();
      const passwordClean = password.trim(); 

      console.log("Tentando logar com:", emailClean); 

      await login(emailClean, passwordClean);
      
    } catch (error) {
      alert("Falha no login. Verifique email e senha.");
      console.error(error);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={{ width: 100, height: 100 }} 
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Aluga<Text style={{color: '#4ADE80'}}>Fácil</Text></Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Login' && styles.activeTab]}
            onPress={() => setActiveTab('Login')}
          >
            <Text style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Register' && styles.activeTab]} 
            onPress={() => {
              setActiveTab('Register'); 
              navigation.navigate('Register');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'Register' && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail ID"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.rememberContainer}>
            <Checkbox
              style={styles.checkbox}
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? '#2563EB' : undefined}
            />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forget Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>
            {loading ? 'Carregando...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or login with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color="black" />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#2563EB', marginTop: 10 },

  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 30, 
    padding: 4, 
    marginBottom: 30 
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#333' },

  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 30, 
    paddingHorizontal: 15, 
    marginBottom: 16,
    height: 50
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#333' },

  optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { marginRight: 8, borderRadius: 4 },
  rememberText: { color: '#666', fontSize: 13 },
  forgotText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },

  loginButton: { backgroundColor: '#2563EB', borderRadius: 30, paddingVertical: 15, alignItems: 'center', marginBottom: 30 },
  loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 10, color: '#666', fontSize: 12 },

  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  socialButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 30, 
    paddingVertical: 12, 
    gap: 8 
  },
  socialText: { color: '#333', fontWeight: '500' }
});