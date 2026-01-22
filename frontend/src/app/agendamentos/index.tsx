import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  appointmentService,
  Appointment,
  PaymentType,
} from "@/services/appointmentService";
import { ErrorHandler } from "@/services/errorHandler";
import { styles } from "./styles";

type FilterType =
  | "all"
  | "today"
  | "future"
  | "scheduled"
  | "completed"
  | "canceled";

export default function Agendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchText, setSearchText] = useState("");

  // Estados para o modal de pagamento
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<PaymentType>("CASH");

  // Opções de pagamento
  const paymentOptions = [
    { value: "PIX" as PaymentType, label: "PIX", icon: "pix" },
    { value: "CARD" as PaymentType, label: "Cartão", icon: "credit-card" },
    { value: "CASH" as PaymentType, label: "Dinheiro", icon: "money" },
  ];

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchText]);

  function filterAppointments() {
    if (!searchText.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const search = searchText.toLowerCase();
    const filtered = appointments.filter((appointment) => {
      const clientName = appointment.client?.name?.toLowerCase() || "";
      const serviceName = appointment.service?.name?.toLowerCase() || "";
      const status = getStatusText(appointment.status).toLowerCase();

      return (
        clientName.includes(search) ||
        serviceName.includes(search) ||
        status.includes(search)
      );
    });

    setFilteredAppointments(filtered);
  }

  async function loadAppointments() {
    try {
      setLoading(true);
      let data: Appointment[];

      switch (filter) {
        case "today":
          data = await appointmentService.getToday();
          break;
        case "future":
          data = await appointmentService.getFuture();
          break;
        case "scheduled":
          data = await appointmentService.getByStatus("SCHEDULED");
          break;
        case "completed":
          data = await appointmentService.getByStatus("COMPLETED");
          break;
        case "canceled":
          data = await appointmentService.getByStatus("CANCELED");
          break;
        default:
          data = await appointmentService.getAll();
      }

      // Ordenar por data e hora
      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  }

  async function handleCancelAppointment(id: number) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Cancelar Agendamento",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentService.updateStatus(id, "CANCELED");
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
              Alert.alert("Sucesso", "Agendamento cancelado!");
              loadAppointments();
            } catch (error) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
              );
              ErrorHandler.showAlert(error, "Erro ao cancelar");
            }
          },
        },
      ],
    );
  }

  async function handleDeleteAppointment(id: number) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Excluir Agendamento",
      "⚠️ ATENÇÃO: Esta ação é irreversível!\n\nAo excluir, este agendamento será removido permanentemente e não aparecerá em nenhum relatório ou contabilidade.\n\nDeseja realmente excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentService.delete(id);
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Alert.alert("Sucesso", "Agendamento excluído permanentemente!");
              loadAppointments();
            } catch (error) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
              );
              ErrorHandler.showAlert(error, "Erro ao excluir");
            }
          },
        },
      ],
    );
  }

  async function handleCompleteAppointment(id: number) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Abrir modal para selecionar forma de pagamento
    setSelectedAppointmentId(id);
    setSelectedPaymentType("CASH"); // Valor padrão
    setShowPaymentModal(true);
  }

  async function confirmComplete() {
    if (!selectedAppointmentId) return;

    try {
      // Primeiro atualiza o tipo de pagamento
      await appointmentService.updatePayment(
        selectedAppointmentId,
        selectedPaymentType,
      );

      // Depois marca como concluído
      await appointmentService.complete(selectedAppointmentId);

      // Vibração forte de sucesso
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Vibração adicional para reforçar
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);

      setShowPaymentModal(false);
      Alert.alert("Sucesso", "Agendamento concluído!");
      loadAppointments();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      ErrorHandler.showAlert(error, "Erro ao concluir");
    }
  }

  function handleEditAppointment(appointment: Appointment) {
    router.push({
      pathname: "/editar-agendamento",
      params: { id: appointment.id },
    });
  }

  function handleViewClient(appointment: Appointment) {
    if (appointment.client) {
      Alert.alert(
        appointment.client.name,
        `Telefone: ${appointment.client.phone || "Não informado"}\nEmail: ${
          appointment.client.email || "Não informado"
        }`,
      );
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "SCHEDULED":
        return "#FFA500";
      case "COMPLETED":
        return "#4CAF50";
      case "CANCELED":
        return "#F44336";
      default:
        return "#757575";
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case "SCHEDULED":
        return "Agendado";
      case "COMPLETED":
        return "Concluído";
      case "CANCELED":
        return "Cancelado";
      default:
        return status;
    }
  }

  function getPaymentIcon(paymentType?: string) {
    switch (paymentType) {
      case "PIX":
        return "pix";
      case "CARD":
        return "credit-card";
      case "CASH":
        return "money";
      case "PENDING":
        return "schedule";
      default:
        return "help-outline";
    }
  }

  function getPaymentText(paymentType?: string) {
    switch (paymentType) {
      case "PIX":
        return "PIX";
      case "CARD":
        return "Cartão";
      case "CASH":
        return "Dinheiro";
      case "PENDING":
        return "Pendente";
      default:
        return "Não definido";
    }
  }

  function getPaymentColor(paymentType?: string) {
    switch (paymentType) {
      case "PIX":
        return "#00A859";
      case "CARD":
        return "#FF6B35";
      case "CASH":
        return "#4CAF50";
      case "PENDING":
        return "#FFA500";
      default:
        return "#999";
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Carregando agendamentos...</Text>
      </View>
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
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Agendamentos</Text>
        <TouchableOpacity
          onPress={() => router.push("/novo-agendamento")}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color="#5D6D7E" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, serviço ou status..."
          placeholderTextColor="#95A5A6"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <MaterialIcons name="close" size={20} color="#95A5A6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros Modernos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "all" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "today" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("today")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === "today" && styles.filterTextActive,
            ]}
          >
            Hoje
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "future" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("future")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === "future" && styles.filterTextActive,
            ]}
          >
            Próximos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "scheduled" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("scheduled")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === "scheduled" && styles.filterTextActive,
            ]}
          >
            Agendados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "completed" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("completed")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === "completed" && styles.filterTextActive,
            ]}
          >
            Concluídos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "canceled" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("canceled")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              filter === "canceled" && styles.filterTextActive,
            ]}
          >
            Cancelados
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de agendamentos */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              {searchText
                ? "Nenhum agendamento encontrado para sua busca"
                : "Nenhum agendamento encontrado"}
            </Text>
          </View>
        ) : (
          filteredAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.date);
            return (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentDateTime}>
                    <View style={styles.dateTimeRow}>
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.dateText}>{date}</Text>
                    </View>
                    <View style={styles.dateTimeRow}>
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.timeText}>{time}</Text>
                    </View>
                  </View>
                  <View style={styles.badgesContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appointment.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(appointment.status)}
                      </Text>
                    </View>
                    {appointment.status === "COMPLETED" &&
                      appointment.paymentType &&
                      appointment.paymentType !== "PENDING" && (
                        <View
                          style={[
                            styles.paymentBadge,
                            {
                              backgroundColor: getPaymentColor(
                                appointment.paymentType,
                              ),
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={
                              getPaymentIcon(appointment.paymentType) as any
                            }
                            size={12}
                            color="#FFF"
                          />
                          <Text style={styles.paymentBadgeText}>
                            {getPaymentText(appointment.paymentType)}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>

                <View style={styles.appointmentBody}>
                  <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => handleViewClient(appointment)}
                  >
                    <MaterialIcons name="person" size={20} color="#8B4513" />
                    <Text style={styles.clientName}>
                      {appointment.client?.name || "N/A"}
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={16}
                      color="#999"
                    />
                  </TouchableOpacity>

                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="content-cut"
                      size={20}
                      color="#8B4513"
                    />
                    <Text style={styles.serviceName}>
                      {appointment.service?.name || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="attach-money"
                      size={20}
                      color="#4CAF50"
                    />
                    <Text style={styles.priceText}>
                      {formatCurrency(appointment.service?.price || 0)}
                    </Text>
                  </View>
                </View>

                {appointment.status === "SCHEDULED" && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditAppointment(appointment)}
                    >
                      <MaterialIcons name="edit" size={18} color="#8B4513" />
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleCompleteAppointment(appointment.id)}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.completeButtonText}>Concluir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelAppointment(appointment.id)}
                    >
                      <MaterialIcons name="cancel" size={18} color="#F44336" />
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAppointment(appointment.id)}
                    >
                      <MaterialIcons
                        name="delete-forever"
                        size={18}
                        color="#C0392B"
                      />
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal de Forma de Pagamento */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forma de Pagamento</Text>
            <Text style={styles.modalSubtitle}>
              Como o cliente realizou o pagamento?
            </Text>

            <View style={styles.paymentOptionsContainer}>
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.paymentOptionButton,
                    selectedPaymentType === option.value &&
                      styles.paymentOptionButtonSelected,
                  ]}
                  onPress={() => setSelectedPaymentType(option.value)}
                >
                  <MaterialIcons
                    name={option.icon as any}
                    size={32}
                    color={
                      selectedPaymentType === option.value ? "#FFF" : "#8B4513"
                    }
                  />
                  <Text
                    style={[
                      styles.paymentOptionLabel,
                      selectedPaymentType === option.value &&
                        styles.paymentOptionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmComplete}
              >
                <MaterialIcons name="check-circle" size={20} color="#FFF" />
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
