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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  }

  async function handleLogin() {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.message || "Falha ao fazer login. Verifique suas credenciais.";
      setError(errorMessage);
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function goToRegister() {
    router.push("/register");
  }

  function goToForgotPassword() {
    router.push("/forgotPassword");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View>
          <Text style={styles.title}>Bem-vindo de volta,</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>
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
          <PasswordInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text onPress={goToForgotPassword} style={styles.forgotPasswordText}>
            Esqueceu a senha?
          </Text>
        </View>

        <Button
          title={loading ? "Entrando..." : "Entrar"}
          onPress={handleLogin}
          disabled={loading}
        />

        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.footerText}>
            Não tem uma conta?{" "}
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
