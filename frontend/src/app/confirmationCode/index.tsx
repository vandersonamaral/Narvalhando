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

export default function ConfirmationCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validateForm() {
    if (!code.trim() || code.length < 4) {
      setError("Por favor, insira o código de verificação");
      return false;
    }
    return true;
  }

  async function handleConfirmationCode() {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implementar chamada de API
      // await authService.verifyCode(code);
      router.replace("/resetPassword");
    } catch (err) {
      Alert.alert("Erro", "Código inválido. Tente novamente.");
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
          <Text style={styles.title}>Verificação de e-mail,</Text>
          <Text style={styles.subtitle}>
            Por favor, digite o código que lhe fornecemos.
          </Text>
        </View>

        <View>
          <Input
            icon="key"
            placeholder="Código de verificação"
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Button
          title={loading ? "Verificando..." : "Verificar código"}
          onPress={handleConfirmationCode}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
