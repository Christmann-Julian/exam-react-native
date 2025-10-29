import React, { useState } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ViewStyle,
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import type { ReadButtonProps } from "../types/props";

export default function ReadButton({
  value,
  onToggle,
  size = 22,
  activeColor = "#10b981",
  inactiveColor = "#64748b",
  style,
}: ReadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);
      await onToggle(!value);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={value ? "Marquer comme non lu" : "Marquer comme lu"}
      style={[styles.button, value ? styles.buttonActive : styles.buttonInactive, style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={value ? activeColor : inactiveColor} />
      ) : (
        <View style={styles.content}>
          <FontAwesome
            name={value ? "check-circle" : "circle-o"}
            size={size}
            color={value ? activeColor : inactiveColor}
          />
          <Text style={[styles.label, { color: value ? activeColor : inactiveColor }]}>
            {value ? "Lu" : "Non lu"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: Platform.select({ ios: "#ecfdf5", android: "#f0fdf4" }),
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  buttonInactive: {
    backgroundColor: Platform.select({ ios: "#f8fafc", android: "#ffffff" }),
    borderWidth: 1,
    borderColor: "#e6eef8",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  } as any,
  label: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 14,
  },
});