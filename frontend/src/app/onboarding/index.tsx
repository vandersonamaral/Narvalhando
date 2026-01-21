import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-swiper";
import { styles } from "./styles";
export default function Onboarding() {
  async function finishOnboarding() {
    await AsyncStorage.setItem("@onboarding_seen", "true");
    router.replace("/login");
  }

  return (
    <Swiper
      loop={false}
      showsPagination
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      paginationStyle={styles.pagination}
    >
      {/* Slide 1 */}
      <View style={styles.slide}>
        <Image
          source={require("@/assets/images/onboarding/onboarding1.png")}
          style={styles.image}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.content}
        >
          <Text style={styles.title}>Mais controle do seu dia</Text>
          <Text style={styles.subtitle}>
            Gerencie agenda, clientes e serviços em poucos toques.
          </Text>

          <TouchableOpacity onPress={finishOnboarding}>
            <Text style={styles.skipText}>
              Já tem uma conta? <Text style={styles.skipTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Slide 2 */}
      <View style={styles.slide}>
        <Image
          source={require("@/assets/images/onboarding/onboarding2.png")}
          style={styles.image}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.content}
        >
          <Text style={styles.title}>Menos bagunça, mais resultado</Text>
          <Text style={styles.subtitle}>
            Evite conflitos de horário e mantenha tudo organizado.
          </Text>

          <TouchableOpacity onPress={finishOnboarding}>
            <Text style={styles.skipText}>
              Já tem uma conta? <Text style={styles.skipTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Slide 3 */}
      <View style={styles.slide}>
        <Image
          source={require("@/assets/images/onboarding/onboarding3.png")}
          style={styles.image}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.content}
        >
          <Text style={styles.title}>Seu negócio no próximo nível</Text>
          <Text style={styles.subtitle}>
            Acompanhe atendimentos, faturamento e desempenho mensal.
          </Text>

          <TouchableOpacity onPress={finishOnboarding}>
            <Text style={styles.skipText}>
              Já tem uma conta? <Text style={styles.skipTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Slide 4 - Login */}
      <View style={styles.slide}>
        <Image
          source={require("@/assets/images/onboarding/onboarding4.png")}
          style={styles.image}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.content}
        >
          <Text style={styles.title}>Seu estilo começa aqui.</Text>
          <Text style={styles.subtitle}>
            Tudo o que o barbeiro precisa, em um só app.
          </Text>

          <TouchableOpacity style={styles.googleButton} onPress={finishOnboarding}>
            <MaterialIcons
              name="search"
              size={20}
              color="#000"
              style={styles.buttonIcon}
            />
            <Text style={styles.googleButtonText}>Acessar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton} onPress={finishOnboarding}>
            <MaterialIcons
              name="email"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.emailButtonText}>Acessar com Email</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={finishOnboarding}>
            <Text style={styles.skipText}>
              Já tem uma conta? <Text style={styles.skipTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Swiper>
  );
}
