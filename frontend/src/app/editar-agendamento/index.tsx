import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { appointmentService, Appointment } from "@/services/appointmentService";
import { serviceService, Service } from "@/services/serviceService";
import { ErrorHandler } from "@/services/errorHandler";
import { DatePicker } from "@/components/datePicker";
import { TimePicker } from "@/components/timePicker";
import { styles } from "./styles";

export default function EditarAgendamento() {
  const params = useLocalSearchParams();
  const appointmentId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [appointmentData, servicesData] = await Promise.all([
        appointmentService.getById(appointmentId),
        serviceService.getAll(),
      ]);

      setAppointment(appointmentData);
      setServices(Array.isArray(servicesData) ? servicesData : []);

      // Preencher campos
      const appointmentDate = new Date(appointmentData.date);
      setDate(appointmentDate);
      setTime(appointmentDate);
      setSelectedServiceId(appointmentData.serviceId);
      setNotes(appointmentData.notes || "");
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao carregar dados");
      setServices([]);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    if (!date) {
      Alert.alert("Erro", "Selecione uma data");
      return false;
    }
    if (!time) {
      Alert.alert("Erro", "Selecione um horário");
      return false;
    }
    if (!selectedServiceId) {
      Alert.alert("Erro", "Selecione um serviço");
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Combinar data e hora
      const appointmentDate = new Date(date);
      appointmentDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

      await appointmentService.update(appointmentId, {
        date: appointmentDate.toISOString(),
        serviceId: selectedServiceId!,
        notes: notes.trim() || undefined,
      });

      Alert.alert("Sucesso", "Agendamento atualizado!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao salvar");
    } finally {
      setSaving(false);
    }
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
        <ActivityIndicator size="large" color="#156778" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Agendamento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Cliente Info (não editável) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientRow}>
              <MaterialIcons name="person" size={24} color="#156778" />
              <Text style={styles.clientName}>{appointment?.client?.name}</Text>
            </View>
            {appointment?.client?.phone && (
              <View style={styles.clientRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <Text style={styles.clientInfo}>
                  {appointment.client.phone}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Data e Hora */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data e Hora</Text>

          <DatePicker
            label="Data"
            value={date}
            onChange={setDate}
            minimumDate={new Date()}
          />

          <TimePicker label="Horário" value={time} onChange={setTime} />
        </View>

        {/* Serviços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviço</Text>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedServiceId === service.id && styles.serviceCardSelected,
              ]}
              onPress={() => setSelectedServiceId(service.id)}
            >
              <View style={styles.serviceHeader}>
                <Text
                  style={[
                    styles.serviceName,
                    selectedServiceId === service.id &&
                      styles.serviceNameSelected,
                  ]}
                >
                  {service.name}
                </Text>
                {selectedServiceId === service.id && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#156778"
                  />
                )}
              </View>
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>
                  {formatCurrency(service.price)}
                </Text>
                <Text style={styles.serviceDuration}>
                  {formatDuration(service.duration)}
                </Text>
              </View>
              {service.description && (
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações (opcional)</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Adicione observações sobre o agendamento..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Resumo */}
        {selectedService && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Serviço:</Text>
              <Text style={styles.summaryValue}>{selectedService.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duração:</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(selectedService.duration)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={styles.summaryPrice}>
                {formatCurrency(selectedService.price)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialIcons name="check" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
