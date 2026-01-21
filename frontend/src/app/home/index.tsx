// Redirecionamento para Dashboard
// Esta rota agora redireciona automaticamente para o dashboard do barbeiro
import { Redirect } from "expo-router";

export default function Home() {
  return <Redirect href="/dashboard" />;
}
