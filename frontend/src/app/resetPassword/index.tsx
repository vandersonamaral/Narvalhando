import { Button } from "@/components/button";
import { PasswordInput } from "@/components/passwordInput";
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

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validateForm() {
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }
    return true;
  }

  async function handleResetPassword() {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implementar chamada de API
      // await authService.resetPassword(password);
      Alert.alert("Sucesso", "Senha redefinida com sucesso!", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (err) {
      Alert.alert("Erro", "Falha ao redefinir senha. Tente novamente.");
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
          <Text style={styles.title}>Redefinir senha,</Text>
          <Text style={styles.subtitle}>
            Por favor, digite a nova senha que deseja utilizar.
          </Text>
        </View>

        <View>
          <PasswordInput
            placeholder="Nova senha"
            value={password}
            onChangeText={setPassword}
          />
          <PasswordInput
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Button
          title={loading ? "Redefinindo..." : "Redefinir senha"}
          onPress={handleResetPassword}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
