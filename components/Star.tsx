import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import type { StarProps } from "../types/props";

export default function Star({
  value,
  onChange,
  max = 5,
  size = 24,
  activeColor = "#ffb400",
  inactiveColor = "#cbd5e1",
}: StarProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View style={styles.row}>
      {stars.map((pos) => {
        const filled = value != null && value >= pos;
        return (
          <TouchableOpacity
            key={pos}
            onPress={() => {
              if (value === pos) onChange(null);
              else onChange(pos);
            }}
            activeOpacity={0.7}
            accessibilityLabel={`Donner ${pos} étoile${pos > 1 ? "s" : ""}`}
            style={styles.touch}
          >
            <FontAwesome
              name={filled ? "star" : "star-o"}
              size={size}
              color={filled ? activeColor : inactiveColor}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  touch: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});