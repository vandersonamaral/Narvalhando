import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = {
  // Ignorar arquivos que não são rotas
  initialRouteName: "index",
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#09090B",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgotPassword" />
        <Stack.Screen name="resetPassword" />
        <Stack.Screen name="confirmationCode" />
        <Stack.Screen name="home" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="agendamentos" />
        <Stack.Screen name="novo-agendamento" />
        <Stack.Screen name="editar-agendamento" />
        <Stack.Screen name="servicos" />
        <Stack.Screen name="relatorios" />
      </Stack>
    </>
  );
}
