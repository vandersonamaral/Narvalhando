import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("@onboarding_seen");
      const token = await AsyncStorage.getItem("@auth_token");

      if (hasSeenOnboarding === "true") {
        // Verifica se está autenticado
        router.replace(token ? "/dashboard" : "/login");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      router.replace("/onboarding");
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#156778" />
    </View>
  );
}
