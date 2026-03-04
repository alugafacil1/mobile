import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/lib/auth/AuthContext';
import Logo from '../../assets/logo.png';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'locatario'| ''>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  async function handleRegister() {
    if (!name || !email || !password || !phone || !cpf) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, phone, cpf, 'locatario', password);
      
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "Fazer Login", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#2563EB" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="Nome Completo"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#2563EB" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#2563EB" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#2563EB" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="card-outline" size={20} color="#2563EB" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.actionButtonText}>
            {loading ? "Criando..." : "Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoContainer}>
            <Image 
                source={Logo} 
                style={{ width: 320, height: 250 }} 
                resizeMode="contain"
              />
            </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => navigation.navigate("Login")} 
          >
            <Text style={styles.tabText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
            <Text style={styles.activeTabText}>Register</Text>
          </TouchableOpacity>
        </View>

        {renderStep1()}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 30 }, 
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#2563EB', marginTop: 10 },

  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 30, 
    padding: 4, 
    marginBottom: 10 
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#333', fontWeight: 'bold' },

  stepContainer: { width: '100%', alignItems: 'center' },

  typeButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF', 
  },
  typeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#2563EB',
    fontWeight: 'bold',
  },

  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 30, 
    paddingHorizontal: 15, 
    marginBottom: 16,
    height: 55,
    width: '100%'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 16 },

  actionButton: { 
    backgroundColor: '#2563EB', 
    borderRadius: 30, 
    paddingVertical: 16, 
    alignItems: 'center', 
    width: '100%',
    marginTop: 10
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});