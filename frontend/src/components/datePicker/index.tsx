import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./styles";

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

export function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
}: DatePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <MaterialIcons name="calendar-today" size={20} color="#8B4513" />
        <Text style={styles.inputText}>{formatDate(value)}</Text>
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
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                locale="pt-BR"
              />
            </View>
          </View>
        </Modal>
      )}

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

