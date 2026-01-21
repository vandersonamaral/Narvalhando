import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { styles } from "./styles";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validateForm() {
    if (!email.trim()) {
      setError("Por favor, insira seu email");
      return false;
    }
    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return false;
    }
    return true;
  }

  async function handleForgotPassword() {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implementar chamada de API
      // await authService.forgotPassword(email);
      router.push("/confirmationCode");
    } catch (err) {
      Alert.alert("Erro", "Falha ao enviar código. Verifique seu email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View>
          <Text style={styles.title}>Esqueceu sua senha,</Text>
          <Text style={styles.subtitle}>
            Preencha as informações abaixo para recuperar sua senha.
          </Text>
        </View>

        <View>
          <Input
            icon="email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Button
          title={loading ? "Enviando..." : "Enviar código"}
          onPress={handleForgotPassword}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
