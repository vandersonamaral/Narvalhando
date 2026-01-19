import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

type PasswordInputProps = TextInputProps & {
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function PasswordInput({ icon = "lock", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <MaterialIcons
        name={icon}
        size={22}
        color="#ADB3BC"
        style={styles.icon}
      />
      <TextInput
        {...props}
        style={styles.input}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        placeholderTextColor="#8E8E8E"
      />

      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <MaterialIcons
          name={showPassword ? "visibility" : "visibility-off"}
          size={24}
          color="#ADB3BC"
        />
      </TouchableOpacity>
    </View>
  );
}
