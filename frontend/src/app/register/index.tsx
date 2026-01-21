import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { PasswordInput } from "@/components/passwordInput";
import { authService } from "@/services/authService";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validateForm() {
    if (!name.trim() || name.length < 3) {
      setError("Por favor, insira seu nome completo (mínimo 3 caracteres)");
      return false;
    }
    if (!email.trim()) {
      setError("Por favor, insira seu email");
      return false;
    }
    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return false;
    }
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  }

  async function handleRegister() {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.register(name, email, password);
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.replace("/dashboard") },
      ]);
    } catch (err: any) {
      const errorMessage =
        err.message || "Falha ao criar conta. Tente novamente.";
      setError(errorMessage);
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    router.push("/login");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View>
          <Text style={styles.title}>Crie uma conta,</Text>
          <Text style={styles.subtitle}>
            Preencha as informações abaixo para criar sua conta.
          </Text>
        </View>

        <View>
          <Input
            icon="person"
            placeholder="Nome"
            keyboardType="default"
            autoCapitalize="words"
            autoCorrect={false}
            value={name}
            onChangeText={setName}
          />
          <Input
            icon="email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <PasswordInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Button
          title={loading ? "Cadastrando..." : "Cadastrar"}
          onPress={handleRegister}
          disabled={loading}
        />

        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.footerText}>
            Já tem uma conta? <Text style={styles.footerLink}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
