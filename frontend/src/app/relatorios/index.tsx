import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { reportsService } from "@/services/reportsService";
import { appointmentService } from "@/services/appointmentService";
import { ErrorHandler } from "@/services/errorHandler";
import { styles } from "./styles";

interface ReportData {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  averageTicket: number;
}

interface ServiceReport {
  serviceName: string;
  count: number;
  revenue: number;
}

interface AppointmentHistory {
  id: number;
  date: string;
  status: string;
  client: { name: string };
  service: { name: string; price: number };
}

type Period = "today" | "week" | "month" | "all";

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>("month");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([]);
  const [history, setHistory] = useState<AppointmentHistory[]>([]);

  useEffect(() => {
    loadReports();
  }, [period]);

  async function loadReports() {
    try {
      setLoading(true);

      let startDate: Date | undefined;
      const endDate = new Date();

      switch (period) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "all":
          startDate = undefined;
          break;
      }

      const [report, services, appointments] = await Promise.all([
        reportsService.getByPeriod(
          startDate?.toISOString(),
          endDate.toISOString()
        ),
        reportsService.getByService(
          startDate?.toISOString(),
          endDate.toISOString()
        ),
        appointmentService.getAll(),
      ]);

      // Mapear dados do backend para o formato esperado
      const mappedReport: ReportData = {
        totalRevenue: report?.totalRevenue || 0,
        totalAppointments: report?.totalAppointments || 0,
        completedAppointments: 0,
        canceledAppointments: 0,
        averageTicket:
          report?.totalRevenue && report?.totalAppointments
            ? report.totalRevenue / report.totalAppointments
            : 0,
      };

      // Mapear serviços para o formato esperado
      const mappedServices: ServiceReport[] = services.map((s: any) => ({
        serviceName: s.serviceName || s.name || "Serviço",
        count: s.appointmentCount || 0,
        revenue: s.totalRevenue || 0,
      }));

      setReportData(mappedReport);
      setServiceReports(mappedServices);

      // Filtrar histórico por período
      let filteredHistory = appointments as any[];
      if (startDate) {
        filteredHistory = filteredHistory.filter(
          (a) => new Date(a.date) >= startDate
        );
      }

      // Calcular cancelados e concluídos do histórico
      const completed = filteredHistory.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const canceled = filteredHistory.filter(
        (a) => a.status === "CANCELED"
      ).length;

      setReportData((prev) => ({
        ...mappedReport,
        completedAppointments: completed,
        canceledAppointments: canceled,
      }));

      setHistory(filteredHistory);
    } catch (error) {
      ErrorHandler.showAlert(error, "Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  function getPeriodText(p: Period) {
    switch (p) {
      case "today":
        return "Hoje";
      case "week":
        return "7 dias";
      case "month":
        return "30 dias";
      case "all":
        return "Tudo";
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Carregando relatórios...</Text>
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
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Relatórios & Histórico</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Filtros de Período */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {(["today", "week", "month", "all"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.filterChip, period === p && styles.filterChipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.filterText,
                period === p && styles.filterTextActive,
              ]}
            >
              {getPeriodText(p)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resumo Geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Geral</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="attach-money" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>
                {formatCurrency(reportData?.totalRevenue || 0)}
              </Text>
              <Text style={styles.statLabel}>Faturamento</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="event" size={32} color="#2196F3" />
              <Text style={styles.statValue}>
                {reportData?.totalAppointments || 0}
              </Text>
              <Text style={styles.statLabel}>Agendamentos</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>
                {reportData?.completedAppointments || 0}
              </Text>
              <Text style={styles.statLabel}>Concluídos</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="cancel" size={32} color="#F44336" />
              <Text style={styles.statValue}>
                {reportData?.canceledAppointments || 0}
              </Text>
              <Text style={styles.statLabel}>Cancelados</Text>
            </View>
          </View>

          <View style={styles.averageCard}>
            <Text style={styles.averageLabel}>Ticket Médio</Text>
            <Text style={styles.averageValue}>
              {formatCurrency(reportData?.averageTicket || 0)}
            </Text>
          </View>
        </View>

        {/* Relatório por Serviço */}
        {serviceReports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por Serviço</Text>
            {serviceReports.map((service, index) => (
              <View key={index} style={styles.serviceReportCard}>
                <View style={styles.serviceReportHeader}>
                  <Text style={styles.serviceName}>{service.serviceName}</Text>
                  <Text style={styles.serviceRevenue}>
                    {formatCurrency(service.revenue)}
                  </Text>
                </View>
                <View style={styles.serviceReportBody}>
                  <View style={styles.serviceReportStat}>
                    <MaterialIcons name="content-cut" size={16} color="#666" />
                    <Text style={styles.serviceReportText}>
                      {service.count} serviços
                    </Text>
                  </View>
                  <View style={styles.serviceReportStat}>
                    <MaterialIcons name="trending-up" size={16} color="#666" />
                    <Text style={styles.serviceReportText}>
                      {service.count > 0
                        ? formatCurrency(service.revenue / service.count)
                        : "R$ 0,00"}{" "}
                      média
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Histórico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Agendamentos</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>
                Nenhum agendamento neste período
              </Text>
            </View>
          ) : (
            history.map((appointment) => (
              <View key={appointment.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDate}>
                    <Text style={styles.historyDateText}>
                      {formatDate(appointment.date)}
                    </Text>
                    <Text style={styles.historyTimeText}>
                      {formatTime(appointment.date)}
                    </Text>
                  </View>
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
                </View>

                <View style={styles.historyBody}>
                  <Text style={styles.clientName}>
                    {appointment.client.name}
                  </Text>
                  <Text style={styles.serviceName}>
                    {appointment.service.name}
                  </Text>
                  <Text style={styles.servicePrice}>
                    {formatCurrency(appointment.service.price)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
