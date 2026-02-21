import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { PropertyFilterRequest, PropertyType, PropertyStatus } from '../types/property';
import { getCurrentLocation } from '../utils/utils';

interface PropertyFiltersProps {
  onApplyFilters: (filters: PropertyFilterRequest) => void;
  onClearFilters: () => void;
  onStartFiltering?: () => void;
  onStopFiltering?: () => void;
}

const { height } = Dimensions.get('window');

const PropertyFilters = forwardRef<{ openModal: () => void }, PropertyFiltersProps>(
  ({ onApplyFilters, onClearFilters, onStartFiltering, onStopFiltering }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState<PropertyFilterRequest>({});

    useImperativeHandle(ref, () => ({
      openModal: () => setShowModal(true),
    }));

    const handleApply = async () => {
      try {
        onStartFiltering?.();

        let updatedFilters = { ...filters };

        if (filters.radius) {
          try {
            const { lat, lon } = await getCurrentLocation();
            updatedFilters.lat = lat;
            updatedFilters.lon = lon;
          } catch (error: any) {
            console.log('Erro ao pegar localização:', error);
            onStopFiltering?.();
            return;
          }
        }

        onApplyFilters(updatedFilters);
        setShowModal(false);
      } catch (error) {
        console.log('Erro ao aplicar filtros:', error);
        onStopFiltering?.();
      }
    };

    const handleClear = () => {
      setFilters({});
      onClearFilters();
      setShowModal(false);
    };

    const updateFilter = (key: keyof PropertyFilterRequest, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === '' || value === null ? undefined : value,
      }));
    };

    const hasActiveFilters = Object.values(filters).some(
      (v) => v !== undefined && v !== null && v !== ''
    );

    return (
    <>
        <Modal
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros de Propriedades</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Preço */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preço</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Mín (R$)"
                  keyboardType="numeric"
                  value={filters.minPrice ? String(filters.minPrice) : ''}
                  onChangeText={(text) =>
                    updateFilter('minPrice', text ? parseInt(text) : undefined)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Máx (R$)"
                  keyboardType="numeric"
                  value={filters.maxPrice ? String(filters.maxPrice) : ''}
                  onChangeText={(text) =>
                    updateFilter('maxPrice', text ? parseInt(text) : undefined)
                  }
                />
              </View>
            </View>

            {/* Quartos e Banheiros */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cômodos</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Mín Quartos"
                  keyboardType="numeric"
                  value={filters.minBedrooms ? String(filters.minBedrooms) : ''}
                  onChangeText={(text) =>
                    updateFilter('minBedrooms', text ? parseInt(text) : undefined)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mín Cômodos"
                  keyboardType="numeric"
                  value={filters.minRooms ? String(filters.minRooms) : ''}
                  onChangeText={(text) =>
                    updateFilter('minRooms', text ? parseInt(text) : undefined)
                  }
                />
              </View>
            </View>

            {/* Comodidades */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comodidades</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>Garagem</Text>
                <Switch
                  value={filters.garage ?? false}
                  onValueChange={(value) =>
                    updateFilter('garage', value ? true : undefined)
                  }
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>Mobiliado</Text>
                <Switch
                  value={filters.furnished ?? false}
                  onValueChange={(value) =>
                    updateFilter('furnished', value ? true : undefined)
                  }
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>Permite animais</Text>
                <Switch
                  value={filters.petFriendly ?? false}
                  onValueChange={(value) =>
                    updateFilter('petFriendly', value ? true : undefined)
                  }
                />
              </View>
            </View>

            {/* Tipo e Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Propriedade</Text>
              <View style={styles.buttonGroup}>
                {['APARTMENT', 'HOUSE', 'COMMERCIAL'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      filters.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      updateFilter('type', filters.type === type ? undefined : (type as PropertyType))
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        filters.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type === 'APARTMENT' ? 'Apto'
                       : type === 'HOUSE' ? 'Casa'
                       : 'Comercial'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.buttonGroup}>
                {['ACTIVE', 'PAUSED', 'PLACED'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      filters.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() =>
                      updateFilter('status', filters.status === status ? undefined : (status as PropertyStatus))
                    }
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        filters.status === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status === 'ACTIVE' ? 'Ativa'
                       : status === 'PAUSED' ? 'Pausada'
                       : 'Ocupada'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Localização */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Localização</Text>
              <TextInput
                style={styles.fullInput}
                placeholder="Cidade"
                value={filters.city ?? ''}
                onChangeText={(text) => updateFilter('city', text || undefined)}
              />
              <TextInput
                style={styles.fullInput}
                placeholder="Bairro"
                value={filters.neighborhood ?? ''}
                onChangeText={(text) => updateFilter('neighborhood', text || undefined)}
              />
              <TextInput
                style={styles.fullInput}
                placeholder="Raio (km)"
                keyboardType="numeric"
                value={filters.radius ? String(filters.radius) : ''}
                onChangeText={(text) =>
                  updateFilter('radius', text ? parseFloat(text) : undefined)
                }
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Limpar Filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
    );
  }
);

PropertyFilters.displayName = 'PropertyFilters';

export default PropertyFilters;

const styles = StyleSheet.create({
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonTextActive: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  fullInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  statusButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#F0FDF4',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#2563EB',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
