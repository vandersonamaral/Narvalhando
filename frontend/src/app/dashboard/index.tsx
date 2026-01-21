import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { authService } from "@/services/authService";
import { dashboardService } from "@/services/dashboardService";
import { appointmentService } from "@/services/appointmentService";
import { ErrorHandler } from "@/services/errorHandler";
import { styles } from "./styles";

interface Stats {
  totalClients: number;
  totalServices: number;
  totalAppointments: number;
  completedAppointments: number;
}

interface Revenue {
  totalRevenue: number;
  monthRevenue: number;
}

interface TodayAppointment {
  id: number;
  date: string;
  status: string;
  client: { name: string };
  service: { name: string; price: number };
}

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<
    TodayAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para o modal de detalhes
  const [selectedAppointment, setSelectedAppointment] =
    useState<TodayAppointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animação para o modal de sucesso
  const successScale = new Animated.Value(0);
  const successFade = new Animated.Value(0);

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  async function loadUserData() {
    const userData = await authService.getUser();
    setUser(userData);
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, revenueData, appointmentsData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRevenue(),
        appointmentService.getToday(),
      ]);

      setStats(statsData);
      setRevenue(revenueData);
      setTodayAppointments(
        Array.isArray(appointmentsData) ? appointmentsData : []
      );
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao carregar dashboard");
      // Garantir que todayAppointments seja sempre um array
      setTodayAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          router.replace("/login");
        },
      },
    ]);
  }

  async function handleAppointmentPress(appointment: TodayAppointment) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  }

  async function handleCompleteAppointment() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDetailsModal(false);
    setShowPaymentModal(true);
  }

  async function handlePaymentSelected(paymentType: string) {
    if (!selectedAppointment) return;

    try {
      await appointmentService.updatePayment(
        selectedAppointment.id,
        paymentType
      );
      await appointmentService.complete(selectedAppointment.id);
      setShowPaymentModal(false);

      // Vibração forte de sucesso
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Vibração adicional para reforçar
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);

      // Mostrar modal de sucesso animado
      setShowSuccessModal(true);

      // Animar entrada do modal
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(successFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Fechar modal automaticamente após 2.5 segundos
      setTimeout(() => {
        handleCloseSuccessModal();
      }, 2500);

      loadDashboardData();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      ErrorHandler.showAlert(error, "Erro ao concluir");
    }
  }

  function handleCloseSuccessModal() {
    Animated.parallel([
      Animated.timing(successScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(successFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      successScale.setValue(0);
      successFade.setValue(0);
    });
  }

  async function handleCancelAppointment() {
    if (!selectedAppointment) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDetailsModal(false);
    Alert.alert(
      "Cancelar Agendamento",
      "Deseja realmente cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentService.updateStatus(
                selectedAppointment.id,
                "CANCELED"
              );
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
              Alert.alert("Sucesso", "Agendamento cancelado!");
              loadDashboardData();
            } catch (error) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
              );
              ErrorHandler.showAlert(error, "Erro ao cancelar");
            }
          },
        },
      ]
    );
  }

  async function handleDeleteAppointment() {
    if (!selectedAppointment) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowDetailsModal(false);
    Alert.alert(
      "Excluir Agendamento",
      "ATENÇÃO: Esta ação é irreversível!\n\nAo excluir, este agendamento será removido permanentemente e não aparecerá em nenhum relatório ou contabilidade.\n\nDeseja realmente excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentService.delete(selectedAppointment.id);
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              Alert.alert("Sucesso", "Agendamento excluído permanentemente!");
              loadDashboardData();
            } catch (error) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
              );
              ErrorHandler.showAlert(error, "Erro ao excluir");
            }
          },
        },
      ]
    );
  }

  function handleEditAppointment() {
    if (!selectedAppointment) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDetailsModal(false);
    router.push({
      pathname: "/editar-agendamento",
      params: { id: selectedAppointment.id },
    });
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
      default:
        return "schedule";
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
      default:
        return "#FFA500";
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  const todayRevenue = Array.isArray(todayAppointments)
    ? todayAppointments
        .filter((a) => a.status === "COMPLETED")
        .reduce((sum, a) => sum + (a.service?.price || 0), 0)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={48} color="#000" />
          </View>
          <View style={styles.userInfoRow}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Olá, {user?.name || "Barbeiro"}
              </Text>
              <Text style={styles.subtitle}>
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <MaterialIcons name="logout" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cards de estatísticas - Grid 2x2 */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statCard, styles.statCardRevenue]}>
            <View style={styles.statIcon}>
              <MaterialIcons name="payments" size={28} color="#FFF" />
            </View>
            <Text style={styles.statValue}>{formatCurrency(todayRevenue)}</Text>
            <Text style={styles.statLabel}>Ganho Hoje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardAppointments]}
            onPress={() => router.push("/agendamentos")}
          >
            <View style={styles.statIcon}>
              <MaterialIcons name="event" size={28} color="#FFF" />
            </View>
            <Text style={styles.statValue}>
              {Array.isArray(todayAppointments) ? todayAppointments.length : 0}
            </Text>
            <Text style={styles.statLabel}>Hoje</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.statCard, styles.statCardMonth]}>
            <View style={styles.statIcon}>
              <MaterialIcons name="trending-up" size={28} color="#FFF" />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(revenue?.monthRevenue || 0)}
            </Text>
            <Text style={styles.statLabel}>Mês</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.statCard, styles.statCardCompleted]}>
            <View style={styles.statIcon}>
              <MaterialIcons name="check-circle" size={28} color="#FFF" />
            </View>
            <Text style={styles.statValue}>
              {stats?.completedAppointments || 0}
            </Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </TouchableOpacity>
        </View>

        {/* Botões de ação rápida */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/novo-agendamento")}
          >
            <View style={styles.actionButtonIcon}>
              <MaterialIcons name="add" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionButtonText}>Novo Agendamento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/agendamentos")}
          >
            <View style={styles.actionButtonIcon}>
              <MaterialIcons name="list" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionButtonText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>

        {/* Agendamentos de hoje */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="today" size={24} color="#8B4513" />
            <Text style={styles.sectionTitle}>Agendamentos de Hoje</Text>
          </View>

          {!Array.isArray(todayAppointments) ||
          todayAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={64} color="#DDD" />
              <Text style={styles.emptyStateText}>
                Nenhum agendamento para hoje
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push("/novo-agendamento")}
              >
                <MaterialIcons name="add" size={20} color="#8B4513" />
                <Text style={styles.emptyStateButtonText}>
                  Criar Agendamento
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => handleAppointmentPress(appointment)}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentTimeContainer}>
                    <MaterialIcons name="schedule" size={18} color="#FFF" />
                    <Text style={styles.appointmentTimeText}>
                      {formatTime(appointment.date)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.appointmentStatusBadge,
                      { backgroundColor: getStatusColor(appointment.status) },
                    ]}
                  >
                    <Text style={styles.appointmentStatusText}>
                      {getStatusText(appointment.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentBody}>
                  <View style={styles.appointmentRow}>
                    <MaterialIcons name="person" size={20} color="#8B4513" />
                    <Text style={styles.appointmentClient}>
                      {appointment.client?.name || "Cliente não identificado"}
                    </Text>
                  </View>
                  <View style={styles.appointmentRow}>
                    <MaterialIcons name="content-cut" size={20} color="#666" />
                    <Text style={styles.appointmentService}>
                      {appointment.service?.name || "Serviço não identificado"}
                    </Text>
                  </View>
                  <View style={styles.appointmentRow}>
                    <MaterialIcons
                      name="attach-money"
                      size={20}
                      color="#4CAF50"
                    />
                    <Text style={styles.appointmentPrice}>
                      {formatCurrency(appointment.service?.price || 0)}
                    </Text>
                    {appointment.status === "COMPLETED" &&
                      appointment.paymentType &&
                      appointment.paymentType !== "PENDING" && (
                        <View style={styles.paymentBadgeSmall}>
                          <MaterialIcons
                            name={
                              getPaymentIcon(appointment.paymentType) as any
                            }
                            size={12}
                            color={getPaymentColor(appointment.paymentType)}
                          />
                        </View>
                      )}
                  </View>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color="#DDD"
                  style={styles.appointmentChevron}
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Menu de Acesso Rápido */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Acesso Rápido</Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/relatorios")}
            activeOpacity={0.7}
          >
            <View style={styles.menuButtonIcon}>
              <MaterialIcons name="assessment" size={22} color="#8B4513" />
            </View>
            <Text style={styles.menuButtonText}>Relatórios Completos</Text>
            <MaterialIcons name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/servicos")}
            activeOpacity={0.7}
          >
            <View style={styles.menuButtonIcon}>
              <MaterialIcons name="content-cut" size={22} color="#8B4513" />
            </View>
            <Text style={styles.menuButtonText}>Gerenciar Serviços</Text>
            <MaterialIcons name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Espaço Extra */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal de Detalhes do Agendamento */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="person" size={28} color="#156778" />
              <Text style={styles.modalTitle}>
                {selectedAppointment?.client?.name || "Cliente"}
              </Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <MaterialIcons name="content-cut" size={20} color="#5D6D7E" />
                <View style={styles.modalRowContent}>
                  <Text style={styles.modalLabel}>Serviço</Text>
                  <Text style={styles.modalValue}>
                    {selectedAppointment?.service?.name || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.modalRow}>
                <MaterialIcons name="schedule" size={20} color="#5D6D7E" />
                <View style={styles.modalRowContent}>
                  <Text style={styles.modalLabel}>Horário</Text>
                  <Text style={styles.modalValue}>
                    {selectedAppointment
                      ? formatTime(selectedAppointment.date)
                      : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.modalRow}>
                <MaterialIcons name="attach-money" size={20} color="#27AE60" />
                <View style={styles.modalRowContent}>
                  <Text style={styles.modalLabel}>Valor</Text>
                  <Text style={styles.modalValueHighlight}>
                    {selectedAppointment
                      ? formatCurrency(selectedAppointment.service?.price || 0)
                      : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.modalRow}>
                <MaterialIcons name="info" size={20} color="#5D6D7E" />
                <View style={styles.modalRowContent}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      {
                        backgroundColor: selectedAppointment
                          ? getStatusColor(selectedAppointment.status)
                          : "#757575",
                      },
                    ]}
                  >
                    <Text style={styles.modalStatusText}>
                      {selectedAppointment
                        ? getStatusText(selectedAppointment.status)
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {selectedAppointment?.status === "SCHEDULED" && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={handleEditAppointment}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={20} color="#156778" />
                  <Text style={styles.modalActionButtonText}>EDITAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalActionButtonPrimary,
                  ]}
                  onPress={handleCompleteAppointment}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="check-circle" size={20} color="#FFF" />
                  <Text style={styles.modalActionButtonTextPrimary}>
                    CONCLUIR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalActionButtonDanger,
                  ]}
                  onPress={handleCancelAppointment}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="cancel" size={20} color="#E74C3C" />
                  <Text style={styles.modalActionButtonTextDanger}>
                    CANCELAR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.modalActionButtonDelete,
                  ]}
                  onPress={handleDeleteAppointment}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="delete-forever"
                    size={20}
                    color="#C0392B"
                  />
                  <Text style={styles.modalActionButtonTextDelete}>
                    EXCLUIR
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailsModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Forma de Pagamento */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="payment" size={28} color="#156778" />
              <Text style={styles.modalTitle}>Forma de Pagamento</Text>
            </View>

            <Text style={styles.paymentSubtitle}>
              Como o cliente realizou o pagamento?
            </Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handlePaymentSelected("PIX");
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="qr-code" size={32} color="#156778" />
                <Text style={styles.paymentOptionText}>PIX</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentOption}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handlePaymentSelected("CARD");
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="credit-card" size={32} color="#156778" />
                <Text style={styles.paymentOptionText}>Cartão</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentOption}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handlePaymentSelected("CASH");
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="money" size={32} color="#156778" />
                <Text style={styles.paymentOptionText}>Dinheiro</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPaymentModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso - Agendamento Concluído */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.successModalOverlay}>
          <Animated.View
            style={[
              styles.successModalContent,
              {
                opacity: successFade,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={80} color="#FFF" />
            </View>

            <Text style={styles.successTitle}>Agendamento Concluído!</Text>
            <Text style={styles.successMessage}>
              O atendimento foi finalizado com sucesso
            </Text>

            <View style={styles.successDecorative}>
              <MaterialIcons name="celebration" size={32} color="#FFF" />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
