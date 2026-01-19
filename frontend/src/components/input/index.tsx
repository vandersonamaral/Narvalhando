import { MaterialIcons } from "@expo/vector-icons";
import { TextInput, TextInputProps, View } from "react-native";
import { styles } from "./styles";

type InputProps = TextInputProps & {
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function Input({ icon, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={22}
          color="#ADB3BC"
          style={styles.icon}
        />
      )}

      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#8E8E8E"
      />
    </View>
  );
}
