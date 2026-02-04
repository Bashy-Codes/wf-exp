import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useTheme } from "@/lib/Theme";
import { WFModal } from "./ui/WFModal";

const { height: screenHeight } = Dimensions.get("window");

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const currentDate = initialDate || new Date();

  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1924 + 1 }, (_, i) => currentYear - i);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onConfirm(date);
  };

  const styles = StyleSheet.create({
    pickerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    picker: {
      flex: 1,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 12,
    },
    scrollContainer: {
      height: screenHeight * 0.52,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: 4,
    },
    option: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: "center",
      marginVertical: 3,
      marginHorizontal: 6,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "600",
    },
    selectedOptionText: {
      color: theme.colors.white,
      fontWeight: "700",
    },
  });

  return (
    <WFModal
      visible={visible}
      onClose={onCancel}
      onConfirm={handleConfirm}
      headerIcon="calendar"
      title="Select Date"
    >
      <View style={styles.pickerContainer}>
        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>Year</Text>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.option,
                  selectedYear === year && styles.selectedOption,
                ]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedYear === year && styles.selectedOptionText,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>Month</Text>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.option,
                  selectedMonth === index && styles.selectedOption,
                ]}
                onPress={() => setSelectedMonth(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMonth === index && styles.selectedOptionText,
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>Day</Text>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.option,
                  selectedDay === day && styles.selectedOption,
                ]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDay === day && styles.selectedOptionText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </WFModal>
  );
};