import { StyleSheet } from "react-native";
import { colors, fontSize, spacing } from "./theme";

export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "left",
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: "left",
  },
  forgotPasswordText: {
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: "right",
  },
  footerText: {
    textAlign: "center",
    marginTop: spacing.lg,
    color: colors.text,
  },
  footerLink: {
    fontWeight: "600",
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
