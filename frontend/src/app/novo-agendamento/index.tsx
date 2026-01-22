import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { appointmentService } from "@/services/appointmentService";
import { clientService, Client } from "@/services/clientService";
import { serviceService, Service } from "@/services/serviceService";
import { authService } from "@/services/authService";
import { ErrorHandler } from "@/services/errorHandler";
import { DatePicker } from "@/components/datePicker";
import { TimePicker } from "@/components/timePicker";
import { styles } from "./styles";

export default function NovoAgendamento() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Dados do formulário
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Listas
  const [services, setServices] = useState<Service[]>([]);
  const [barberId, setBarberId] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoadingData(true);
      const [servicesData, userData] = await Promise.all([
        serviceService.getAll(),
        authService.getUser(),
      ]);

      setServices(Array.isArray(servicesData) ? servicesData : []);

      // Validar se o usuário tem ID válido
      if (!userData?.id) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
      }

      setBarberId(userData.id);

      // Definir data/hora padrão (hoje, próxima hora)
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      setSelectedDate(now);
      setSelectedTime(now);
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao carregar dados");
      // Garantir que services seja sempre um array
      setServices([]);
    } finally {
      setLoadingData(false);
    }
  }

  // Funções auxiliares para serviços múltiplos
  function toggleServiceSelection(service: Service) {
    const isSelected = selectedServices.some((s) => s.id === service.id);

    if (isSelected) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  }

  function getTotalPrice() {
    return selectedServices.reduce(
      (total, service) => total + service.price,
      0
    );
  }

  function getTotalDuration() {
    return selectedServices.reduce(
      (total, service) => total + service.duration,
      0
    );
  }

  async function handleCreateAppointment() {
    // Validações de frontend
    if (!clientName.trim()) {
      Alert.alert("Atenção", "Digite o nome do cliente");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um serviço");
      return;
    }

    // Combinar data e hora em um único objeto
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    // Validação 1: Não pode ser no passado
    const now = new Date();
    if (appointmentDateTime <= now) {
      Alert.alert(
        "Data Inválida",
        "Não é possível agendar para datas passadas"
      );
      return;
    }

    // Validação 2: Horário de funcionamento (8h às 20h)
    const hour = appointmentDateTime.getHours();
    if (hour < 8 || hour >= 20) {
      Alert.alert(
        "Horário Inválido",
        "Horário de funcionamento: 08:00 às 20:00"
      );
      return;
    }

    // Validação 3: Não trabalha aos domingos
    const dayOfWeek = appointmentDateTime.getDay();
    if (dayOfWeek === 0) {
      Alert.alert(
        "Dia Inválido",
        "Não trabalhamos aos domingos. Escolha outro dia."
      );
      return;
    }

    // Validação 4: Mínimo de 30 minutos de antecedência
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
    if (appointmentDateTime < thirtyMinutesFromNow) {
      Alert.alert(
        "Horário Muito Próximo",
        "Agendamentos devem ser feitos com pelo menos 30 minutos de antecedência"
      );
      return;
    }

    // Validação 5: Máximo de 90 dias no futuro
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60000);
    if (appointmentDateTime > ninetyDaysFromNow) {
      Alert.alert(
        "Data Muito Distante",
        "Agendamentos podem ser feitos com até 90 dias de antecedência"
      );
      return;
    }

    try {
      setLoading(true);

      // Validar barberId antes de continuar
      if (!barberId || barberId <= 0) {
        Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
        return;
      }

      // 1. Criar ou buscar cliente
      let client: Client;
      const phoneValue = clientPhone.trim();

      if (phoneValue) {
        // Tentar buscar cliente existente pelo telefone
        try {
          const existingClients = await clientService.getAll();
          const found = existingClients.find((c) => c.phone === phoneValue);

          if (found) {
            client = found;
  
          } else {
            // Criar novo cliente com telefone
            client = await clientService.create({
              name: clientName.trim(),
              phone: phoneValue,
            });
          }
        } catch {
          // Em caso de erro, tentar criar novamente
          client = await clientService.create({
            name: clientName.trim(),
            phone: phoneValue,
          });
        }
      } else {
        // Criar cliente sem telefone
        client = await clientService.create({
          name: clientName.trim(),
        });
       
      }

      // 2. Criar agendamento para cada serviço selecionado
      let currentDateTime = new Date(appointmentDateTime);

      for (const service of selectedServices) {
        await appointmentService.create({
          date: currentDateTime.toISOString(),
          clientId: client.id,
          serviceId: service.id,
          barberId: barberId,
        });

        // Adicionar a duração do serviço atual para o próximo agendamento
        currentDateTime = new Date(
          currentDateTime.getTime() + service.duration * 60000
        );
      }

      // 3. Feedback nativo: Vibração de sucesso (forte)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Vibração adicional para reforçar o sucesso
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);

      // Redirecionar para tela de sucesso
      router.replace("/agendamento-sucesso");
    } catch (error) {
      // Vibração de erro
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      ErrorHandler.showAlert(error, "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name="event" size={24} color="#8B4513" />
          <Text style={styles.title}>Novo Agendamento</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={22} color="#8B4513" />
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#8B4513" />
            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              value={clientName}
              onChangeText={setClientName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="phone" size={20} color="#8B4513" />
            <TextInput
              style={styles.input}
              placeholder="Telefone (Opcional)"
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Serviço */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="content-cut" size={22} color="#8B4513" />
            <Text style={styles.sectionTitle}>Escolha os Serviços</Text>
            {selectedServices.length > 0 && (
              <View style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>
                  {selectedServices.length}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionSubtitle}>
            Selecione um ou mais serviços (toque para adicionar/remover)
          </Text>

          {services.map((service) => {
            const isSelected = selectedServices.some(
              (s) => s.id === service.id
            );

            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                ]}
                onPress={async () => {
                  toggleServiceSelection(service);
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.serviceInfo}>
                  <Text
                    style={[
                      styles.serviceName,
                      isSelected && styles.serviceNameSelected,
                    ]}
                  >
                    {service.name}
                  </Text>
                  <Text style={styles.serviceDuration}>
                    {service.duration} min
                  </Text>
                </View>

                <Text
                  style={[
                    styles.servicePrice,
                    isSelected && styles.servicePriceSelected,
                  ]}
                >
                  R$ {service.price.toFixed(2)}
                </Text>

                {isSelected && (
                  <MaterialIcons name="check-circle" size={24} color="#FFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Data e Hora */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="schedule" size={22} color="#8B4513" />
            <Text style={styles.sectionTitle}>Data e Horário</Text>
          </View>

          <DatePicker
            label="Data"
            value={selectedDate}
            onChange={setSelectedDate}
            minimumDate={new Date()}
          />

          <TimePicker
            label="Horário"
            value={selectedTime}
            onChange={setSelectedTime}
          />
        </View>

        {/* Resumo */}
        {selectedServices.length > 0 && clientName.trim() && (
          <View style={styles.summary}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="receipt" size={24} color="#8B4513" />
              <Text style={styles.summaryTitle}>Resumo do Agendamento</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <MaterialIcons name="person-outline" size={18} color="#666" />
                <Text style={styles.summaryLabel}>Cliente:</Text>
                <Text style={styles.summaryValue}>{clientName}</Text>
              </View>

              <View style={styles.summaryDivider} />
              <Text style={styles.summarySubtitle}>Serviços Selecionados:</Text>

              {selectedServices.map((service, index) => (
                <View key={service.id} style={styles.serviceListItem}>
                  <View style={styles.serviceListNumber}>
                    <Text style={styles.serviceListNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.serviceListContent}>
                    <Text style={styles.serviceListName}>{service.name}</Text>
                    <Text style={styles.serviceListDetails}>
                      {service.duration} min • R$ {service.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <MaterialIcons name="schedule" size={18} color="#666" />
                <Text style={styles.summaryLabel}>Duração Total:</Text>
                <Text style={styles.summaryValue}>
                  {getTotalDuration()} min
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
                <Text style={styles.summaryLabel}>Valor Total:</Text>
                <Text style={styles.summaryValueHighlight}>
                  R$ {getTotalPrice().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Espaço extra para o botão flutuante e navigation bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Botão Flutuante */}
      {selectedServices.length > 0 && clientName.trim() && (
        <TouchableOpacity
          style={[styles.fab, loading && styles.fabDisabled]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            handleCreateAppointment();
          }}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <MaterialIcons name="check" size={28} color="#FFF" />
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
