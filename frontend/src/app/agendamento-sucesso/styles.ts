import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4CAF50", // Verde sucesso
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  message: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
    opacity: 0.95,
  },
  decorativeContainer: {
    marginTop: 40,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
});
