import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/lib/Theme";

const { width } = Dimensions.get("window");

interface OtpInputProps {
  numberOfDigits: number;
  onTextChange: (text: string) => void;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  numberOfDigits,
  onTextChange,
  autoFocus = false,
}) => {
  const theme = useTheme();
  const [values, setValues] = useState<string[]>(Array(numberOfDigits).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleTextChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text;
    setValues(newValues);
    onTextChange(newValues.join(""));

    if (text && index < numberOfDigits - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: numberOfDigits }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[
            styles.input,
            {
              borderColor: focusedIndex === index ? theme.colors.primary : theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
            },
            focusedIndex === index && { borderWidth: 2 },
            values[index] && { borderColor: theme.colors.primary },
          ]}
          value={values[index]}
          onChangeText={(text) => handleTextChange(text.slice(-1), index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    width: width / 9,
    height: 48,
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
});