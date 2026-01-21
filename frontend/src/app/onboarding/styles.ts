import { colors } from "@/styles/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: colors.black,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 12,
    lineHeight: 34,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#d0d0d0",
    lineHeight: 22,
    marginBottom: 32,
    textAlign: "center",
  },

  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  googleButton: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  googleButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "600",
  },
  emailButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  emailButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Texto "Já tem uma conta? Entrar"
  skipText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  skipTextBold: {
    color: colors.primary,
    fontWeight: "600",
  },

  // Dots de paginação
  dot: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pagination: {
    top: 50,
  },
});
