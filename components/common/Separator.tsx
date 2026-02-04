import React, { useMemo } from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "@/lib/Theme";

// Predefined aesthetic styles
const separatorOptions = [
  "☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽",
  "⊹˚₊‧────────‧₊˚⊹",
  "⋆✿｡⋆ ── ⋆ ✿｡⋆",
  "─◈─◉─◈─◉─◈─",
  "༶•┈┈୨♡୧┈┈•༶",
  "♡₊˚.༄ ─── ༄˚₊♡",
  "꒰ঌ ✧ ─ ✧ ໒꒱",
  "⚬⭑⚬ ─ ⚬⭑⚬",

  // emoji based
  "🌷⋆｡˚ ❀ ─ ❀ ｡˚⋆🌷",
  "🌸🌙💖 ─ 💖🌙🌸",
];

const getRandomSeparator = (options: string[]) => {
  const index = Math.floor(Math.random() * options.length);
  return options[index];
};

export const Separator = ({ customOptions }: { customOptions?: string[] }) => {
  const { colors } = useTheme();
  const options =
    customOptions && customOptions.length > 0
      ? customOptions
      : separatorOptions;

  // Pick a separator once per render
  const chosenSeparator = useMemo(() => getRandomSeparator(options), [options]);

  return (
    <Text style={[styles.separator, { color: colors.success }]}>
      {chosenSeparator}
    </Text>
  );
};

const styles = StyleSheet.create({
  separator: {
    textAlign: "center",
    marginVertical: 12,
    fontSize: 14,
  },
});
