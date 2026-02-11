import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '../components/Button';
import { useAuth } from '../lib/auth/AuthContext';
import { createProperty } from '../services/propertyService';

export default function CreatePropertyScreen({ navigation }: any) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priceInCents: 0,
    phoneNumber: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      postalCode: '',
    },
    geolocation: {
      latitude: 0,
      longitude: 0,
    },
    numberOfRooms: 0,
    numberOfBedrooms: 0,
    numberOfBathrooms: 0,
    furnished: false,
    petFriendly: false,
    garage: false,
    isOwner: true,
    type: 'APARTMENT',
    userId: user?.user_id
  });

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    try {
      await createProperty(form);
      Alert.alert('Sucesso', 'Imóvel cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível cadastrar o imóvel');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* <Text style={styles.title}>Novo Imóvel</Text> */}

        <TextInput style={styles.input} placeholder="Título"
          onChangeText={v => update('title', v)}
        />

        <TextInput style={styles.input} placeholder="Descrição"
          onChangeText={v => update('description', v)}
        />

        <TextInput style={styles.input} placeholder="Valor (R$)" keyboardType="numeric"
          onChangeText={v => update('priceInCents', Number(v) * 100)}
        />

        <TextInput style={styles.input} placeholder="Telefone para contato"
          onChangeText={v => update('phoneNumber', v)}
        />

        <Text style={styles.section}>Endereço</Text>

        <TextInput style={styles.input} placeholder="Rua"
          onChangeText={v => update('address', { ...form.address, street: v })}
        />
        <TextInput style={styles.input} placeholder="Número"
          onChangeText={v => update('address', { ...form.address, number: v })}
        />
        <TextInput style={styles.input} placeholder="Bairro"
          onChangeText={v => update('address', { ...form.address, neighborhood: v })}
        />
        <TextInput style={styles.input} placeholder="Cidade"
          onChangeText={v => update('address', { ...form.address, city: v })}
        />
        <TextInput style={styles.input} placeholder="CEP"
          onChangeText={v => update('address', { ...form.address, postalCode: v })}
        />

        <Text style={styles.section}>Geolocalização</Text>

        <TextInput style={styles.input} placeholder="Latitude" keyboardType="numeric"
          onChangeText={v =>
            update('geolocation', { ...form.geolocation, latitude: Number(v) })
          }
        />
        <TextInput style={styles.input} placeholder="Longitude" keyboardType="numeric"
          onChangeText={v =>
            update('geolocation', { ...form.geolocation, longitude: Number(v) })
          }
        />

        <Text style={styles.section}>Detalhes</Text>

        <TextInput style={styles.input} placeholder="Cômodos" keyboardType="numeric"
          onChangeText={v => update('numberOfRooms', Number(v))}
        />
        <TextInput style={styles.input} placeholder="Quartos" keyboardType="numeric"
          onChangeText={v => update('numberOfBedrooms', Number(v))}
        />
        <TextInput style={styles.input} placeholder="Banheiros" keyboardType="numeric"
          onChangeText={v => update('numberOfBathrooms', Number(v))}
        />
        <Button 
            label="Criar"
            onPress={handleSubmit}>
        </Button>

        {/* Espaço extra pro botão não ficar colado */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  section: { marginTop: 5, marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 3,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
});
