import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { styles } from "./styles";

export default function AgendamentoSucesso() {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Vibração de sucesso ao entrar na tela
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animação de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleVoltar = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/dashboard");
  };

  const handleNovoAgendamento = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/novo-agendamento");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Ícone de sucesso */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={120} color="#FFF" />
        </View>

        {/* Título */}
        <Text style={styles.title}>Agendamento Concluído!</Text>

        {/* Mensagem */}
        <Text style={styles.message}>
          Seu agendamento foi criado com sucesso e está confirmado.
        </Text>

        {/* Ícone decorativo */}
        <View style={styles.decorativeContainer}>
          <MaterialIcons name="event-available" size={40} color="#FFF" />
        </View>
      </Animated.View>

      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleVoltar}
          activeOpacity={0.8}
        >
          <MaterialIcons name="dashboard" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Voltar ao Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleNovoAgendamento}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
          <Text style={styles.secondaryButtonText}>Novo Agendamento</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
