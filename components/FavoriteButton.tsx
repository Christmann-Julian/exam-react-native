import React, { useState } from "react";
import { TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import type { FavoriteButtonProps } from "../types/props";

export default function FavoriteButton({
  value,
  onToggle,
  size = 20,
  activeColor = "#ef4444",
  inactiveColor = "#cbd5e1",
}: FavoriteButtonProps) {
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
      activeOpacity={0.7}
      accessibilityLabel={value ? "Retirer des favoris" : "Ajouter aux favoris"}
      style={{ paddingHorizontal: 6, paddingVertical: 4 }}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FontAwesome name={value ? "heart" : "heart-o"} size={size} color={value ? activeColor : inactiveColor} />
      )}
    </TouchableOpacity>
  );
}