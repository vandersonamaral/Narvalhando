import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { serviceService, Service } from "@/services/serviceService";
import { ErrorHandler } from "@/services/errorHandler";
import { styles } from "./styles";

export default function Servicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await serviceService.getAll();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao carregar serviços");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }

  function openCreateModal() {
    setEditingService(null);
    setName("");
    setPrice("");
    setDuration("");
    setModalVisible(true);
  }

  function openEditModal(service: Service) {
    setEditingService(service);
    setName(service.name);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingService(null);
    setName("");
    setPrice("");
    setDuration("");
  }

  function validateForm() {
    if (!name.trim()) {
      Alert.alert("Erro", "Digite o nome do serviço");
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert("Erro", "Digite um preço válido");
      return false;
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert("Erro", "Digite uma duração válida (em minutos)");
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const serviceData = {
        name: name.trim(),
        price: Number(price),
        duration: Number(duration),
      };

      if (editingService) {
        await serviceService.update(editingService.id, serviceData);
        Alert.alert("Sucesso", "Serviço atualizado!");
      } else {
        await serviceService.create(serviceData);
        Alert.alert("Sucesso", "Serviço criado!");
      }

      closeModal();
      loadServices();
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao salvar serviço");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service: Service) {
    Alert.alert(
      "Excluir Serviço",
      `Tem certeza que deseja excluir "${service.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await serviceService.delete(service.id);
              Alert.alert("Sucesso", "Serviço excluído!");
              loadServices();
            } catch (error) {
              ErrorHandler.showAlert(error, "Erro ao excluir serviço");
            }
          },
        },
      ]
    );
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Carregando serviços...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Serviços</Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="content-cut" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>Nenhum serviço cadastrado</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={openCreateModal}
            >
              <Text style={styles.emptyStateButtonText}>
                Criar Primeiro Serviço
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(service)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons name="edit" size={20} color="#156778" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(service)}
                    style={styles.iconButton}
                  >
                    <MaterialIcons name="delete" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.serviceDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="attach-money"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.detailText}>
                    {formatCurrency(service.price)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="access-time" size={20} color="#2196F3" />
                  <Text style={styles.detailText}>
                    {formatDuration(service.duration)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Criar/Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Serviço *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Corte + Barba"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.label}>Preço (R$) *</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.label}>Duração (min) *</Text>
                  <TextInput
                    style={styles.input}
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="30"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingService ? "Salvar" : "Criar"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
