import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <MaterialIcons name="access-time" size={20} color="#8B4513" />
        <Text style={styles.inputText}>{formatTime(value)}</Text>
      </TouchableOpacity>

      {show && Platform.OS === "ios" && (
        <Modal transparent animationType="slide" visible={show}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.modalButton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.modalButton, styles.modalButtonDone]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value}
                mode="time"
                display="spinner"
                onChange={handleChange}
                locale="pt-BR"
                is24Hour={true}
              />
            </View>
          </View>
        </Modal>
      )}

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleChange}
          is24Hour={true}
        />
      )}
    </View>
  );
}

